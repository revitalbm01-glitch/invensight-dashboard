export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `₪${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `₪${(value / 1_000).toFixed(1)}K`
  return `₪${Math.round(value).toLocaleString('he-IL')}`
}

export function formatCurrencyFull(value: number): string {
  return `₪${Math.round(value).toLocaleString('he-IL')}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('he-IL')
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDays(value: number): string {
  return `${value.toFixed(1)} ימים`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function daysSince(iso: string): number {
  const then = new Date(iso).getTime()
  const now = Date.now()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

export function formatDelta(deltaPercent: number | null): string {
  if (deltaPercent === null) return '—'
  const sign = deltaPercent > 0 ? '+' : ''
  return `${sign}${deltaPercent.toFixed(1)}%`
}

const STOCK_STATUS_LABELS_HE: Record<string, string> = {
  OUT_OF_STOCK: 'מלאי אפס',
  BELOW_REORDER: 'מתחת לנקודת הזמנה',
  EXCESS: 'מלאי עודף',
  NORMAL: 'תקין',
}

export function stockStatusLabel(status: string): string {
  return STOCK_STATUS_LABELS_HE[status] ?? status
}

const PO_STATUS_LABELS_HE: Record<string, string> = {
  OPEN: 'פתוחה',
  IN_TRANSIT: 'במשלוח',
  RECEIVED: 'התקבלה',
  LATE: 'באיחור',
  CANCELLED: 'בוטלה',
}

export function poStatusLabel(status: string): string {
  return PO_STATUS_LABELS_HE[status] ?? status
}

const SUPPLIER_RATING_LABELS_HE: Record<string, string> = {
  excellent: 'מצוין',
  good: 'תקין',
  warning: 'טעון שיפור',
  critical: 'קריטי',
}

export function supplierRatingLabel(rating: string): string {
  return SUPPLIER_RATING_LABELS_HE[rating] ?? rating
}
