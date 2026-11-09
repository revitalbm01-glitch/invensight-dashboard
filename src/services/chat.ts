import { API_URL } from './airtable'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChartBlock {
  type: 'chart'
  chartType: 'bar' | 'line' | 'pie'
  title: string
  valueLabel: string
  field: string | null
  points: { label: string; value: number }[]
}

export interface TableBlock {
  type: 'table'
  title: string
  columns: string[]
  rows: Record<string, string | number | boolean | null>[]
  totalMatching: number
}

export type ChatBlock = ChartBlock | TableBlock

export interface ChatReply {
  reply: string
  blocks: ChatBlock[]
}

export class ChatAuthError extends Error {}

export async function sendChat(password: string, history: ChatMessage[], message: string): Promise<ChatReply> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Password': password },
    body: JSON.stringify({ message, history }),
  })
  let data: { reply?: string; blocks?: ChatBlock[]; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    // non-JSON error body
  }
  if (res.status === 401) throw new ChatAuthError(data.error ?? 'סיסמה שגויה.')
  if (!res.ok || !data.reply) throw new Error(data.error ?? `שגיאה (${res.status})`)
  return { reply: data.reply, blocks: data.blocks ?? [] }
}
