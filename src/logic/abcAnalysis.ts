import type { AbcClass, InventoryItem } from '../types'

export interface AbcParetoPoint {
  sku: string
  name: string
  stockValue: number
  cumulativeValue: number
  cumulativePercent: number
  abcClass: AbcClass
}

// Classic ABC analysis: sort items by value descending, then classify by
// cumulative contribution to total stock value.
//   A — items that together make up the first 80% of value
//   B — items contributing the next 15% (up to 95% cumulative)
//   C — the remaining 5% (the long tail)
export function assignAbcClasses(items: InventoryItem[]): InventoryItem[] {
  const sorted = [...items].sort((a, b) => b.stockValue - a.stockValue)
  const totalValue = sorted.reduce((s, it) => s + it.stockValue, 0)

  let cumulative = 0
  const classifiedBySku = new Map<string, AbcClass>()

  for (const item of sorted) {
    cumulative += item.stockValue
    const cumulativePercent = totalValue > 0 ? (cumulative / totalValue) * 100 : 0
    let abcClass: AbcClass = 'C'
    if (cumulativePercent <= 80) abcClass = 'A'
    else if (cumulativePercent <= 95) abcClass = 'B'
    classifiedBySku.set(item.sku, abcClass)
  }

  return items.map((item) => ({ ...item, abcClass: classifiedBySku.get(item.sku) ?? 'C' }))
}

export function buildParetoSeries(items: InventoryItem[]): AbcParetoPoint[] {
  const sorted = [...items].sort((a, b) => b.stockValue - a.stockValue)
  const totalValue = sorted.reduce((s, it) => s + it.stockValue, 0)

  let cumulative = 0
  return sorted.map((item) => {
    cumulative += item.stockValue
    return {
      sku: item.sku,
      name: item.name,
      stockValue: item.stockValue,
      cumulativeValue: cumulative,
      cumulativePercent: totalValue > 0 ? Math.round((cumulative / totalValue) * 1000) / 10 : 0,
      abcClass: item.abcClass,
    }
  })
}

export interface AbcClassSummary {
  abcClass: AbcClass
  itemCount: number
  itemPercent: number
  totalValue: number
  valuePercent: number
}

export function summarizeAbcClasses(items: InventoryItem[]): AbcClassSummary[] {
  const totalValue = items.reduce((s, it) => s + it.stockValue, 0)
  const classes: AbcClass[] = ['A', 'B', 'C']

  return classes.map((abcClass) => {
    const classItems = items.filter((it) => it.abcClass === abcClass)
    const classValue = classItems.reduce((s, it) => s + it.stockValue, 0)
    return {
      abcClass,
      itemCount: classItems.length,
      itemPercent: items.length > 0 ? Math.round((classItems.length / items.length) * 1000) / 10 : 0,
      totalValue: classValue,
      valuePercent: totalValue > 0 ? Math.round((classValue / totalValue) * 1000) / 10 : 0,
    }
  })
}
