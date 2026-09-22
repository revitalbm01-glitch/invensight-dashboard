import type { InventoryItem, PurchaseOrder, Supplier, ManagementAlert } from '../types'
import { daysSince, formatCurrencyFull, formatNumber } from './formatters'

const LEAD_TIME_BENCHMARK_DAYS = 14
const NO_MOVEMENT_THRESHOLD_DAYS = 60

export function generateAlerts(
  items: InventoryItem[],
  purchaseOrders: PurchaseOrder[],
  suppliers: Supplier[],
): ManagementAlert[] {
  const alerts: ManagementAlert[] = []
  const supplierById = new Map(suppliers.map((s) => [s.id, s]))

  for (const item of items) {
    if (item.stockStatus === 'OUT_OF_STOCK') {
      alerts.push({
        id: `oos-${item.sku}`,
        type: 'OUT_OF_STOCK',
        severity: 'critical',
        title: 'מלאי אפס',
        description: `${item.name} (${item.sku}) אזל לחלוטין מהמלאי במחסן "${item.warehouse}". ביקוש חודשי ממוצע: ${formatNumber(item.avgMonthlyConsumption)} יח'.`,
        entityLabel: item.sku,
        linkTo: `/inventory?sku=${item.sku}`,
        timestamp: item.lastUpdated,
      })
    } else if (item.stockStatus === 'BELOW_REORDER') {
      alerts.push({
        id: `reorder-${item.sku}`,
        type: 'BELOW_REORDER',
        severity: 'warning',
        title: 'מלאי מתחת לנקודת הזמנה',
        description: `${item.name} (${item.sku}) — נותרו ${formatNumber(item.currentStock)} יח', מתחת לנקודת ההזמנה (${formatNumber(item.reorderPoint)} יח').`,
        entityLabel: item.sku,
        linkTo: `/inventory?sku=${item.sku}`,
        timestamp: item.lastUpdated,
      })
    }

    if (item.stockStatus === 'EXCESS') {
      alerts.push({
        id: `excess-${item.sku}`,
        type: 'EXCESS_STOCK',
        severity: 'warning',
        title: 'מלאי עודף',
        description: `${item.name} (${item.sku}) — מלאי של ${formatNumber(item.currentStock)} יח' חורג ממלאי המקסימום (${formatNumber(item.maxStock)} יח'), שווי עודף: ${formatCurrencyFull((item.currentStock - item.maxStock) * item.unitCost)}.`,
        entityLabel: item.sku,
        linkTo: `/inventory?sku=${item.sku}`,
        timestamp: item.lastUpdated,
      })
    }

    const idleDays = daysSince(item.lastMovementDate)
    if (idleDays > NO_MOVEMENT_THRESHOLD_DAYS) {
      alerts.push({
        id: `idle-${item.sku}`,
        type: 'NO_MOVEMENT',
        severity: 'warning',
        title: 'מלאי ללא תנועה',
        description: `${item.name} (${item.sku}) ללא תנועת מלאי כבר ${idleDays} ימים. שווי מלאי מת: ${formatCurrencyFull(item.stockValue)}.`,
        entityLabel: item.sku,
        linkTo: `/inventory?sku=${item.sku}`,
        timestamp: item.lastMovementDate,
      })
    }
  }

  for (const po of purchaseOrders) {
    const isActiveLate = po.isLate && po.status !== 'RECEIVED' && po.status !== 'CANCELLED'
    if (isActiveLate) {
      const overdueDays = Math.max(0, daysSince(po.plannedDeliveryDate))
      alerts.push({
        id: `late-${po.poNumber}`,
        type: 'LATE_ORDER',
        severity: overdueDays > 10 ? 'critical' : 'warning',
        title: 'הזמנת רכש באיחור',
        description: `${po.poNumber} (${po.itemName}) מהספק ${supplierById.get(po.supplierId)?.name ?? po.supplierId} באיחור של ${overdueDays} ימים מתאריך האספקה המתוכנן.`,
        entityLabel: po.poNumber,
        linkTo: `/logistics?po=${po.poNumber}`,
        timestamp: po.plannedDeliveryDate,
      })
    }
  }

  for (const supplier of suppliers) {
    if (supplier.avgLeadTimeDays > LEAD_TIME_BENCHMARK_DAYS) {
      alerts.push({
        id: `leadtime-${supplier.id}`,
        type: 'HIGH_LEAD_TIME',
        severity: supplier.avgLeadTimeDays > 21 ? 'critical' : 'warning',
        title: 'ספק עם זמן אספקה גבוה',
        description: `${supplier.name} — זמן אספקה ממוצע של ${supplier.avgLeadTimeDays} ימים, מעל יעד של ${LEAD_TIME_BENCHMARK_DAYS} ימים.`,
        entityLabel: supplier.name,
        linkTo: `/logistics?supplier=${supplier.id}`,
        timestamp: new Date().toISOString().slice(0, 10),
      })
    } else if (supplier.otifPercent >= 95 && supplier.lateOrderCount === 0 && supplier.orderCount > 0) {
      alerts.push({
        id: `ok-${supplier.id}`,
        type: 'SUPPLIER_OK',
        severity: 'good',
        title: 'ביצועי ספק תקינים',
        description: `${supplier.name} — OTIF של ${supplier.otifPercent}% וללא הזמנות באיחור פעילות. ביצועים לדוגמה.`,
        entityLabel: supplier.name,
        linkTo: `/logistics?supplier=${supplier.id}`,
        timestamp: new Date().toISOString().slice(0, 10),
      })
    }
  }

  const severityRank: Record<ManagementAlert['severity'], number> = { critical: 0, warning: 1, info: 2, good: 3 }
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
}
