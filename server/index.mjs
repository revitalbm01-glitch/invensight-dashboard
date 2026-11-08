// InvenSight backend on Railway:
//   GET  /api/<Table>  read-only Airtable proxy (the Airtable token never reaches the browser)
//   POST /api/chat     Claude chat agent that queries the same data with read-only tools
//
// Env:
//   AIRTABLE_API_KEY, AIRTABLE_BASE_ID   Airtable access (read-only scope is enough)
//   ANTHROPIC_API_KEY                    enables /api/chat (without it the endpoint answers 503)
//   APP_PASSWORD                         shared password the chat UI must send (X-App-Password)
//   MODEL                                default claude-sonnet-5-5
//   DAILY_CAP_USD                        estimated daily spend brake for the chat (default 3)
//   PRICE_IN_PER_MTOK / PRICE_OUT_PER_MTOK   used only for the estimate (defaults 3 / 15)
//   CHAT_PER_HOUR                        messages per client IP per hour (default 30)
//   ALLOWED_ORIGINS                      comma-separated CORS origins
//   PORT                                 provided by Railway
import http from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { runAgent } from './agent.mjs'
import { TABLES } from './data.mjs'

const API_KEY = process.env.AIRTABLE_API_KEY
const BASE_ID = process.env.AIRTABLE_BASE_ID
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const APP_PASSWORD = process.env.APP_PASSWORD
const PORT = Number(process.env.PORT) || 3000
const DAILY_CAP_USD = Number(process.env.DAILY_CAP_USD) || 3
const PRICE_IN = Number(process.env.PRICE_IN_PER_MTOK) || 3
const PRICE_OUT = Number(process.env.PRICE_OUT_PER_MTOK) || 15
const CHAT_PER_HOUR = Number(process.env.CHAT_PER_HOUR) || 30
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'https://revitalbm01-glitch.github.io,http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const ALLOWED_TABLES = new Set(TABLES)

if (!API_KEY || !BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID')
  process.exit(1)
}

function corsHeaders(origin) {
  return origin && ALLOWED_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}
}

function send(res, status, body, origin) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(origin),
  })
  res.end(JSON.stringify(body))
}

async function fetchAllRecords(table) {
  const records = []
  let offset
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`)
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)
    const r = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } })
    if (!r.ok) throw new Error(`Airtable ${r.status}`)
    const data = await r.json()
    records.push(...data.records)
    offset = data.offset
  } while (offset)
  return records
}

// ---- chat limits (in memory; fine for one small service) ----
const hits = new Map() // ip -> timestamps (ms) within the last hour
let spend = { day: '', usd: 0 }
const today = () => new Date().toISOString().slice(0, 10)

function overRateLimit(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000)
  if (recent.length >= CHAT_PER_HOUR) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}
function addSpend(inTok, outTok) {
  if (spend.day !== today()) spend = { day: today(), usd: 0 }
  spend.usd += (inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000
}
function overDailyCap() {
  if (spend.day !== today()) spend = { day: today(), usd: 0 }
  return spend.usd >= DAILY_CAP_USD
}
function passwordOk(given) {
  if (!APP_PASSWORD || typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(APP_PASSWORD)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function readJson(req, maxBytes = 64 * 1024) {
  let size = 0
  const chunks = []
  for await (const c of req) {
    size += c.length
    if (size > maxBytes) throw Object.assign(new Error('Body too large'), { status: 413 })
    chunks.push(c)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 })
  }
}

async function handleChat(req, res, origin) {
  if (!ANTHROPIC_KEY || !APP_PASSWORD) return send(res, 503, { error: 'הצ׳אט עדיין לא הוגדר בשרת.' }, origin)
  if (!passwordOk(req.headers['x-app-password'])) return send(res, 401, { error: 'סיסמה שגויה.' }, origin)

  const body = await readJson(req)
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > 2000) return send(res, 400, { error: 'הודעה ריקה או ארוכה מדי.' }, origin)
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim()
  if (overRateLimit(ip)) return send(res, 429, { error: 'יותר מדי הודעות בשעה האחרונה. נסי שוב מאוחר יותר.' }, origin)
  if (overDailyCap()) return send(res, 429, { error: 'הגענו לתקרת השימוש היומית של הצ׳אט.' }, origin)

  try {
    const { reply, toolCalls } = await runAgent({
      apiKey: ANTHROPIC_KEY,
      history,
      message,
      fetchAll: fetchAllRecords,
      onCost: addSpend,
    })
    send(res, 200, { reply, toolCalls }, origin)
  } catch (e) {
    console.error('chat failed:', e.message)
    send(res, 502, { error: 'שגיאה בעיבוד השאלה. נסי שוב.' }, origin)
  }
}

http
  .createServer(async (req, res) => {
    const origin = req.headers.origin
    const { pathname } = new URL(req.url, 'http://x')

    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-App-Password',
          'Access-Control-Max-Age': '600',
          ...corsHeaders(origin),
        })
        return res.end()
      }

      if (pathname === '/' || pathname === '/health') return send(res, 200, { ok: true, chat: Boolean(ANTHROPIC_KEY && APP_PASSWORD) }, origin)

      if (pathname === '/api/chat') {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, origin)
        return await handleChat(req, res, origin)
      }

      if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' }, origin)
      const m = pathname.match(/^\/api\/(.+)$/)
      if (!m) return send(res, 404, { error: 'Not found' }, origin)
      const table = decodeURIComponent(m[1])
      if (!ALLOWED_TABLES.has(table)) return send(res, 404, { error: 'Unknown table' }, origin)

      send(res, 200, { records: await fetchAllRecords(table) }, origin)
    } catch (e) {
      const status = e.status || 502
      if (status === 502) console.error(e.message)
      send(res, status, { error: status === 502 ? 'Upstream request failed' : e.message }, origin)
    }
  })
  .listen(PORT, () => console.log(`InvenSight backend listening on ${PORT}`))
