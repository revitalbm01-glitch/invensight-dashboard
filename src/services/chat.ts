import { API_URL } from './airtable'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export class ChatAuthError extends Error {}

export async function sendChat(password: string, history: ChatMessage[], message: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Password': password },
    body: JSON.stringify({ message, history }),
  })
  let data: { reply?: string; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    // non-JSON error body
  }
  if (res.status === 401) throw new ChatAuthError(data.error ?? 'סיסמה שגויה.')
  if (!res.ok || !data.reply) throw new Error(data.error ?? `שגיאה (${res.status})`)
  return data.reply
}
