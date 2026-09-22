import { randInt, randFloat, pick, chance } from '../seed'
import type { InventoryItem, PurchaseOrder, PoStatus } from '../../types'

function addDaysISO(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

const today = new Date()

export function generatePurchaseOrders(items: InventoryItem[], count = 400): PurchaseOrder[] {
  const orders: PurchaseOrder[] = []

  for (let i = 1; i <= count; i++) {
    const item = pick(items)
    const orderDate = daysAgo(randInt(0, 365))
    const leadTimeDays = randInt(4, 28)
    const plannedDeliveryDate = addDaysISO(orderDate, leadTimeDays)
    const orderedQty = randInt(20, 600)
    const unitCost = item.unitCost * randFloat(0.94, 1.05, 3)

    const plannedDate = new Date(plannedDeliveryDate)
    const isPastPlanned = plannedDate <= today

    let status: PoStatus
    let actualDeliveryDate: string | null = null
    let receivedQty = 0
    let isLate = false
    let isFullQty = true

    if (!isPastPlanned) {
      // Still in the future: either not yet shipped or already in transit.
      status = chance(0.55) ? 'OPEN' : 'IN_TRANSIT'
    } else if (chance(0.04)) {
      status = 'CANCELLED'
    } else if (chance(0.78)) {
      // Delivered — most on-time, some late.
      const deliveredLate = chance(0.22)
      const deliveryOffset = deliveredLate ? randInt(1, 15) : randInt(-3, 0)
      const actualDate = addDaysISO(plannedDate, deliveryOffset)
      actualDeliveryDate = actualDate
      isLate = new Date(actualDate) > plannedDate
      status = isLate ? 'LATE' : 'RECEIVED'
      isFullQty = chance(0.85)
      receivedQty = isFullQty ? orderedQty : Math.round(orderedQty * randFloat(0.6, 0.95))
      if (status === 'LATE' && chance(0.4)) status = 'RECEIVED' // late-but-received still counts as received status with isLate flag
    } else {
      // Overdue and still not delivered.
      status = 'LATE'
      isLate = true
      isFullQty = false
    }

    const orderValue = Math.round(orderedQty * unitCost * 100) / 100

    orders.push({
      poNumber: `PO-${String(20240000 + i)}`,
      sku: item.sku,
      itemName: item.name,
      supplierId: item.supplierId,
      warehouse: item.warehouse,
      orderedQty,
      receivedQty,
      unitCost: Math.round(unitCost * 100) / 100,
      orderValue,
      orderDate: orderDate.toISOString().slice(0, 10),
      plannedDeliveryDate,
      actualDeliveryDate,
      status,
      isLate,
      isFullQty,
    })
  }

  return orders
}
