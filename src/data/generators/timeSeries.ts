import { randFloat } from '../seed'
import type { InventoryItem, PurchaseOrder, StockValuePoint, OrdersTrendPoint } from '../../types'

const MONTH_LABELS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

function lastNMonths(n: number): { date: string; label: string }[] {
  const result: { date: string; label: string }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${MONTH_LABELS_HE[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
    })
  }
  return result
}

// Simulates a plausible historical trend leading up to today's actual stock
// value, since the mock dataset only has a real snapshot for "today".
export function generateStockValueTrend(items: InventoryItem[], warehouses: readonly string[]): StockValuePoint[] {
  const months = lastNMonths(12)
  const currentTotal = items.reduce((sum, it) => sum + it.stockValue, 0)
  const currentByWarehouse: Record<string, number> = {}
  for (const wh of warehouses) {
    currentByWarehouse[wh] = items.filter((it) => it.warehouse === wh).reduce((s, it) => s + it.stockValue, 0)
  }

  return months.map((m, idx) => {
    const isLast = idx === months.length - 1
    const drift = isLast ? 1 : randFloat(0.82, 1.08, 3) * (0.9 + idx * 0.008)
    const byWarehouse: Record<string, number> = {}
    for (const wh of warehouses) {
      byWarehouse[wh] = Math.round(currentByWarehouse[wh] * drift)
    }
    return {
      date: m.date,
      label: m.label,
      totalStockValue: isLast ? Math.round(currentTotal) : Math.round(currentTotal * drift),
      byWarehouse,
    }
  })
}

export function generateOrdersTrend(purchaseOrders: PurchaseOrder[]): OrdersTrendPoint[] {
  const months = lastNMonths(12)
  return months.map((m) => {
    const opened = purchaseOrders.filter((po) => po.orderDate.startsWith(m.date)).length
    const received = purchaseOrders.filter(
      (po) => po.actualDeliveryDate && po.actualDeliveryDate.startsWith(m.date),
    ).length
    return { date: m.date, label: m.label, opened, received }
  })
}
