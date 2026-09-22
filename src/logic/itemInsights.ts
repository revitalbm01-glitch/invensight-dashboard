import type { InventoryItem } from '../types'
import { daysSince } from './formatters'

const NO_MOVEMENT_THRESHOLD_DAYS = 60
const AT_RISK_DAYS_THRESHOLD = 21

export function topItemsByValue(items: InventoryItem[], limit = 10): InventoryItem[] {
  return [...items].sort((a, b) => b.stockValue - a.stockValue).slice(0, limit)
}

export function excessStockItems(items: InventoryItem[]): InventoryItem[] {
  return items
    .filter((it) => it.stockStatus === 'EXCESS')
    .sort((a, b) => b.currentStock - b.maxStock - (a.currentStock - a.maxStock))
}

export interface AtRiskItem extends InventoryItem {
  daysUntilStockout: number
}

// "At risk of shortage" — not yet below the reorder point, but consumption
// trend implies stockout within AT_RISK_DAYS_THRESHOLD days.
export function shortageRiskItems(items: InventoryItem[]): AtRiskItem[] {
  return items
    .filter((it) => it.currentStock > 0 && it.avgMonthlyConsumption > 0)
    .map((it) => ({ ...it, daysUntilStockout: Math.round((it.currentStock / (it.avgMonthlyConsumption / 30)) * 10) / 10 }))
    .filter((it) => it.daysUntilStockout <= AT_RISK_DAYS_THRESHOLD)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
}

export interface NoMovementItem extends InventoryItem {
  idleDays: number
}

export function noMovementItems(items: InventoryItem[]): NoMovementItem[] {
  return items
    .map((it) => ({ ...it, idleDays: daysSince(it.lastMovementDate) }))
    .filter((it) => it.idleDays > NO_MOVEMENT_THRESHOLD_DAYS)
    .sort((a, b) => b.idleDays - a.idleDays)
}
