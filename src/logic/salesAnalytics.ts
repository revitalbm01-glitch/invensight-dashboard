import { lastNMonths } from '../data/generators/timeSeries'
import type { Sale, SalesTrendPoint } from '../types'

export function buildSalesTrend(sales: Sale[]): SalesTrendPoint[] {
  return lastNMonths(12).map((m) => {
    const monthSales = sales.filter((s) => s.saleDate.startsWith(m.date))
    return {
      date: m.date,
      label: m.label,
      revenue: Math.round(monthSales.reduce((sum, s) => sum + s.revenue, 0)),
      units: monthSales.reduce((sum, s) => sum + s.quantity, 0),
    }
  })
}

function sumRevenueBetween(sales: Sale[], fromDaysAgo: number, toDaysAgo: number): { revenue: number; units: number } {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const from = now - fromDaysAgo * day
  const to = now - toDaysAgo * day
  let revenue = 0
  let units = 0
  for (const s of sales) {
    const t = new Date(s.saleDate).getTime()
    if (t > from && t <= to) {
      revenue += s.revenue
      units += s.quantity
    }
  }
  return { revenue, units }
}

export function last30VsPrevious30(sales: Sale[]): {
  current: { revenue: number; units: number }
  previous: { revenue: number; units: number }
} {
  return { current: sumRevenueBetween(sales, 30, 0), previous: sumRevenueBetween(sales, 60, 30) }
}

export function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export interface SalesByItem {
  sku: string
  name: string
  category: string
  units: number
  revenue: number
  margin: number
}

export function topItemsBySales(sales: Sale[], limit = 10): SalesByItem[] {
  const map = new Map<string, SalesByItem>()
  for (const s of sales) {
    const row = map.get(s.sku) ?? { sku: s.sku, name: s.itemName, category: s.category, units: 0, revenue: 0, margin: 0 }
    row.units += s.quantity
    row.revenue += s.revenue
    row.margin += s.revenue - s.cost
    map.set(s.sku, row)
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

export interface SalesByCustomer {
  customer: string
  orders: number
  units: number
  revenue: number
}

export function topCustomersBySales(sales: Sale[], limit = 10): SalesByCustomer[] {
  const map = new Map<string, SalesByCustomer>()
  for (const s of sales) {
    const row = map.get(s.customer) ?? { customer: s.customer, orders: 0, units: 0, revenue: 0 }
    row.orders += 1
    row.units += s.quantity
    row.revenue += s.revenue
    map.set(s.customer, row)
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}
