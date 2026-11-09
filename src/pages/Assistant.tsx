import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { ChatBlocks } from '../components/chat/ChatBlocks'
import { ChatAuthError, sendChat } from '../services/chat'
import type { ChatBlock, ChatMessage } from '../services/chat'

interface UiMessage extends ChatMessage {
  blocks?: ChatBlock[]
}

const PASSWORD_KEY = 'invensight-chat-password'

const SUGGESTIONS = [
  'הצג גרף של ההכנסות ממכירות לפי חודש',
  'הצג גרף עוגה של שווי המלאי לפי קטגוריה',
  'הצג טבלה של 10 הפריטים שאזלו מהמלאי',
  'הצג גרף של ערך ההזמנות לפי ספק',
]

function readStoredPassword(): string {
  try {
    return sessionStorage.getItem(PASSWORD_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function Assistant() {
  const [password, setPassword] = useState(readStoredPassword)
  const [passwordInput, setPasswordInput] = useState('')
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  function savePassword(e: FormEvent) {
    e.preventDefault()
    const value = passwordInput.trim()
    if (!value) return
    try {
      sessionStorage.setItem(PASSWORD_KEY, value)
    } catch {
      // keep it in memory only
    }
    setPassword(value)
    setPasswordInput('')
    setError(null)
  }

  async function ask(text: string) {
    const question = text.trim()
    if (!question || busy) return
    const history = messages
    const textHistory: ChatMessage[] = history.map(({ role, content }) => ({ role, content }))
    setMessages([...history, { role: 'user', content: question }])
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const { reply, blocks } = await sendChat(password, textHistory, question)
      setMessages((m) => [...m, { role: 'assistant', content: reply, blocks }])
    } catch (err) {
      if (err instanceof ChatAuthError) {
        try {
          sessionStorage.removeItem(PASSWORD_KEY)
        } catch {
          // ignore
        }
        setPassword('')
      }
      setError(err instanceof Error ? err.message : 'שגיאה לא צפויה.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageLayout title="עוזר AI" subtitle="שאלו בעברית על המלאי, הספקים, ההזמנות והמכירות — התשובות מחושבות מנתוני Airtable החיים.">
      {!password ? (
        <form onSubmit={savePassword} className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">הצ׳אט מוגן בסיסמה</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="סיסמה"
            autoFocus
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {error && <p className="mb-3 text-xs text-status-bad">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
            כניסה
          </button>
        </form>
      ) : (
        <div className="mx-auto flex h-[calc(100vh-15rem)] min-h-[420px] max-w-4xl flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div>
                <p className="mb-3 text-sm text-slate-500">לדוגמה:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={m.blocks?.length ? 'w-full max-w-full' : 'max-w-[85%]'}>
                  <div
                    className={`w-fit max-w-full whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${
                      m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.blocks && m.blocks.length > 0 && <ChatBlocks blocks={m.blocks} />}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-slate-400">בודק בנתונים...</p>}
            {error && <p className="text-xs text-status-bad">{error}</p>}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void ask(input)
            }}
            className="flex gap-2 border-t border-slate-200 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="שאלו שאלה על הנתונים..."
              maxLength={2000}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              שליחה
            </button>
          </form>
        </div>
      )}
    </PageLayout>
  )
}
