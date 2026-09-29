const API_BASE = 'https://api.airtable.com/v0'

export interface AirtableRecord<T> {
  id: string
  fields: T
}

interface AirtableListResponse<T> {
  records: AirtableRecord<T>[]
  offset?: string
}

function getConfig(): { apiKey: string; baseId: string } {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
  if (!apiKey || !baseId) {
    throw new Error(
      'חסרה תצורת Airtable — הגדירו VITE_AIRTABLE_API_KEY ו-VITE_AIRTABLE_BASE_ID בקובץ .env (ראו .env.example).',
    )
  }
  return { apiKey, baseId }
}

export async function fetchAllRecords<T>(tableName: string): Promise<AirtableRecord<T>[]> {
  const { apiKey, baseId } = getConfig()
  const records: AirtableRecord<T>[] = []
  let offset: string | undefined

  do {
    const url = new URL(`${API_BASE}/${baseId}/${encodeURIComponent(tableName)}`)
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error(`בקשה ל-Airtable נכשלה (${res.status}) עבור טבלה "${tableName}": ${await res.text()}`)
    }
    const data: AirtableListResponse<T> = await res.json()
    records.push(...data.records)
    offset = data.offset
  } while (offset)

  return records
}
