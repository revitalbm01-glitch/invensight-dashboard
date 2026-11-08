// Data comes from the InvenSight backend on Railway (server/), which holds the Airtable
// token server-side — the browser (and the public JS bundle) never sees it.
export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) || 'https://proxy-production-4c5f.up.railway.app'

export interface AirtableRecord<T> {
  id: string
  fields: T
}

export async function fetchAllRecords<T>(tableName: string): Promise<AirtableRecord<T>[]> {
  const res = await fetch(`${API_URL}/api/${encodeURIComponent(tableName)}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`בקשת הנתונים נכשלה (${res.status}) עבור טבלה "${tableName}": ${await res.text()}`)
  }
  const data: { records: AirtableRecord<T>[] } = await res.json()
  return data.records
}
