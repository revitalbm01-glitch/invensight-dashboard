import { generateSuppliers, rateSupplier } from './generators/suppliers'
import { generateItems, CATEGORIES, WAREHOUSES } from './generators/items'
import { generatePurchaseOrders } from './generators/purchaseOrders'
import { generateStockValueTrend, generateOrdersTrend } from './generators/timeSeries'
import { assignAbcClasses } from '../logic/abcAnalysis'
import type { MockDataset } from '../types'

function buildDataset(): MockDataset {
  const suppliersBase = generateSuppliers()
  const items = assignAbcClasses(generateItems(suppliersBase, 250))
  const purchaseOrders = generatePurchaseOrders(items, 400)

  // Recompute real supplier performance metrics from the generated PO set.
  const suppliers = suppliersBase.map((supplier) => {
    const supplierOrders = purchaseOrders.filter((po) => po.supplierId === supplier.id && po.status !== 'CANCELLED')
    const completedOrders = supplierOrders.filter((po) => po.actualDeliveryDate !== null)
    const otifOrders = completedOrders.filter((po) => !po.isLate && po.isFullQty)
    const otifPercent = completedOrders.length > 0 ? Math.round((otifOrders.length / completedOrders.length) * 1000) / 10 : 0
    const lateOrderCount = supplierOrders.filter((po) => po.isLate && po.status !== 'RECEIVED').length
    const orderValue = Math.round(supplierOrders.reduce((s, po) => s + po.orderValue, 0))

    return {
      ...supplier,
      orderCount: supplierOrders.length,
      orderValue,
      lateOrderCount,
      otifPercent,
      rating: rateSupplier(otifPercent, supplier.avgLeadTimeDays),
    }
  })

  const stockValueTrend = generateStockValueTrend(items, WAREHOUSES)
  const ordersTrend = generateOrdersTrend(purchaseOrders)

  return {
    items,
    suppliers,
    purchaseOrders,
    stockValueTrend,
    ordersTrend,
    categories: [...CATEGORIES],
    warehouses: [...WAREHOUSES],
  }
}

// Built once at module load — deterministic seed means it's stable across
// every render/reload within a session.
export const mockDataset: MockDataset = buildDataset()
