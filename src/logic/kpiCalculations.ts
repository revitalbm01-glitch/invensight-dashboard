import type { InventoryItem, PurchaseOrder, StockValuePoint, KpiValue } from '../types'

// Deterministic, non-mutating pseudo-variation used to synthesize a
// "previous period" comparison for KPIs that have no real historical
// snapshot in the mock dataset (only a single current snapshot of items
// exists). Same input always produces the same output — no shared RNG
// state, so it's safe to call on every render/filter change.
function stableVariation(key: string, magnitude = 0.12): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  const normalized = ((hash % 1000) / 1000) * 2 - 1 // -1..1
  return normalized * magnitude
}

function previousFromCurrent(current: number, key: string, magnitude = 0.12): number {
  const variation = stableVariation(key, magnitude)
  const previous = current / (1 + variation)
  return Math.max(0, Math.round(previous * 100) / 100)
}

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function kpi(
  id: string,
  label: string,
  value: number,
  previousValue: number,
  format: KpiValue['format'],
  isBreached: boolean,
  breachDirection: KpiValue['breachDirection'],
  tooltip: string,
): KpiValue {
  return {
    id,
    label,
    value,
    previousValue,
    deltaPercent: deltaPercent(value, previousValue),
    format,
    isBreached,
    breachDirection,
    tooltip,
  }
}

export interface KpiComputationInput {
  items: InventoryItem[]
  purchaseOrders: PurchaseOrder[]
  stockValueTrend: StockValuePoint[]
}

export function computeKpis({ items, purchaseOrders, stockValueTrend }: KpiComputationInput): KpiValue[] {
  const totalStockValue = items.reduce((s, it) => s + it.stockValue, 0)
  const itemCount = items.length
  const belowReorderCount = items.filter((it) => it.stockStatus === 'BELOW_REORDER').length
  const outOfStockCount = items.filter((it) => it.stockStatus === 'OUT_OF_STOCK').length
  const excessCount = items.filter((it) => it.stockStatus === 'EXCESS').length

  const totalMonthlyConsumption = items.reduce((s, it) => s + it.avgMonthlyConsumption, 0)
  const avgDaysOfInventory =
    totalMonthlyConsumption > 0 ? items.reduce((s, it) => s + it.currentStock, 0) / (totalMonthlyConsumption / 30) : 0

  const annualConsumptionValue = items.reduce((s, it) => s + it.avgMonthlyConsumption * 12 * it.unitCost, 0)
  const inventoryTurnover = totalStockValue > 0 ? annualConsumptionValue / totalStockValue : 0

  const openOrders = purchaseOrders.filter((po) => po.status === 'OPEN' || po.status === 'IN_TRANSIT')
  const lateOrders = purchaseOrders.filter((po) => po.isLate && po.status !== 'RECEIVED' && po.status !== 'CANCELLED')

  const completedOrders = purchaseOrders.filter((po) => po.actualDeliveryDate !== null)
  const otifOrders = completedOrders.filter((po) => !po.isLate && po.isFullQty)
  const otifPercent = completedOrders.length > 0 ? (otifOrders.length / completedOrders.length) * 100 : 100

  // Real previous-period value for stock value, derived from the trend series.
  const prevStockValuePoint = stockValueTrend.length >= 2 ? stockValueTrend[stockValueTrend.length - 2] : null
  const currentStockValuePoint = stockValueTrend.length >= 1 ? stockValueTrend[stockValueTrend.length - 1] : null
  const stockValueRatio =
    prevStockValuePoint && currentStockValuePoint && currentStockValuePoint.totalStockValue > 0
      ? prevStockValuePoint.totalStockValue / currentStockValuePoint.totalStockValue
      : 1
  const previousStockValue = Math.round(totalStockValue * stockValueRatio)

  return [
    kpi(
      'totalStockValue',
      'שווי מלאי כולל',
      totalStockValue,
      previousStockValue,
      'currency',
      false,
      'down-is-bad',
      'סך שווי המלאי הנוכחי בכל המחסנים: Σ (מלאי נוכחי × עלות יחידה) עבור כל הפריטים המסוננים.',
    ),
    kpi(
      'itemCount',
      'כמות פריטים במלאי',
      itemCount,
      previousFromCurrent(itemCount, 'itemCount', 0.06),
      'number',
      false,
      'down-is-bad',
      'מספר פריטי ה-SKU הייחודיים הנכללים בפילטר הנוכחי.',
    ),
    kpi(
      'belowReorder',
      'מתחת לנקודת הזמנה',
      belowReorderCount,
      previousFromCurrent(belowReorderCount, 'belowReorder', 0.18),
      'number',
      belowReorderCount > 0,
      'up-is-bad',
      'פריטים שהמלאי הנוכחי שלהם ירד לנקודת ההזמנה או מתחתיה, אך עדיין לא התאפס — דורשים הזמנת רכש בקרוב.',
    ),
    kpi(
      'outOfStock',
      'פריטים במלאי אפס',
      outOfStockCount,
      previousFromCurrent(outOfStockCount, 'outOfStock', 0.25),
      'number',
      outOfStockCount > 0,
      'up-is-bad',
      'פריטים שאזלו לגמרי מהמלאי — סיכון מיידי לאספקה או מכירה.',
    ),
    kpi(
      'excessStock',
      'מלאי עודף',
      excessCount,
      previousFromCurrent(excessCount, 'excessStock', 0.15),
      'number',
      excessCount > 0,
      'up-is-bad',
      'פריטים שהמלאי הנוכחי שלהם חורג ממלאי המקסימום שהוגדר — הון כלוא מיותר.',
    ),
    kpi(
      'avgDaysOfInventory',
      'ימי מלאי ממוצעים',
      avgDaysOfInventory,
      previousFromCurrent(avgDaysOfInventory, 'avgDaysOfInventory', 0.1),
      'days',
      avgDaysOfInventory > 120,
      'up-is-bad',
      'לכמה ימים צפוי המלאי הנוכחי להספיק בקצב הצריכה הממוצע: מלאי נוכחי ÷ (צריכה חודשית ממוצעת ÷ 30).',
    ),
    kpi(
      'inventoryTurnover',
      'מחזור מלאי',
      inventoryTurnover,
      previousFromCurrent(inventoryTurnover, 'inventoryTurnover', 0.08),
      'number',
      inventoryTurnover < 2,
      'down-is-bad',
      'כמה פעמים בשנה המלאי "מתחלף" בפועל: עלות צריכה שנתית ÷ שווי מלאי נוכחי. ערך נמוך מרמז על מלאי איטי.',
    ),
    kpi(
      'openOrders',
      'הזמנות רכש פתוחות',
      openOrders.length,
      previousFromCurrent(openOrders.length, 'openOrders', 0.1),
      'number',
      false,
      'up-is-bad',
      'הזמנות רכש שנפתחו וטרם התקבלו במלואן (סטטוס פתוחה/במשלוח).',
    ),
    kpi(
      'lateOrders',
      'הזמנות באיחור',
      lateOrders.length,
      previousFromCurrent(lateOrders.length, 'lateOrders', 0.2),
      'number',
      lateOrders.length > 0,
      'up-is-bad',
      'הזמנות רכש שעברו את תאריך האספקה המתוכנן וטרם התקבלו, או שהתקבלו לאחר האיחור.',
    ),
    kpi(
      'otif',
      'OTIF',
      otifPercent,
      previousFromCurrent(otifPercent, 'otif', 0.05),
      'percent',
      otifPercent < 90,
      'down-is-bad',
      'On-Time In-Full — אחוז ההזמנות שהתקבלו הן בזמן והן בכמות המלאה שהוזמנה, מתוך כלל ההזמנות שהושלמו.',
    ),
  ]
}
