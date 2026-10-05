import { fetchAllRecords } from '../services/airtable'
import { CATEGORIES, WAREHOUSES, computeStockStatus } from './generators/items'
import { rateSupplier } from './generators/suppliers'
import { generateStockValueTrend, generateOrdersTrend } from './generators/timeSeries'
import { assignAbcClasses } from '../logic/abcAnalysis'
import type { InventoryItem, Supplier, PurchaseOrder, MockDataset, PoStatus } from '../types'

interface SupplierFields {
  Name: string
  'Supplier Code': string
  'Avg Lead Time Days': number
}

interface ItemFields {
  SKU: string
  Name: string
  Category: string
  Warehouse: string
  Supplier?: string[]
  'Current Stock': number
  'Min Stock': number
  'Reorder Point': number
  'Max Stock': number
  'Unit Cost': number
  'Avg Monthly Consumption': number
  'Last Movement Date': string
  'Last Updated': string
}

interface PurchaseOrderFields {
  'PO Number': string
  Item?: string[]
  'Item Name': string
  Supplier?: string[]
  Warehouse: string
  'Ordered Qty': number
  'Received Qty': number
  'Unit Cost': number
  'Order Value': number
  'Order Date': string
  'Planned Delivery Date': string
  'Actual Delivery Date'?: string
  Status: string
  'Is Late': boolean
  'Is Full Qty': boolean
}

function mapPoStatus(label: string): PoStatus {
  switch (label) {
    case 'Open':
      return 'OPEN'
    case 'In Transit':
      return 'IN_TRANSIT'
    case 'Received':
      return 'RECEIVED'
    case 'Late':
      return 'LATE'
    case 'Cancelled':
      return 'CANCELLED'
    default:
      return 'OPEN'
  }
}

export async function fetchAirtableDataset(): Promise<MockDataset> {
  const [supplierRecords, itemRecords, poRecords] = await Promise.all([
    fetchAllRecords<SupplierFields>('Suppliers'),
    fetchAllRecords<ItemFields>('Items'),
    fetchAllRecords<PurchaseOrderFields>('Purchase Orders'),
  ])

  const supplierCodeByRecId = new Map(supplierRecords.map((r) => [r.id, r.fields['Supplier Code']]))
  const skuByItemRecId = new Map(itemRecords.map((r) => [r.id, r.fields.SKU]))
  const itemNameByItemRecId = new Map(itemRecords.map((r) => [r.id, r.fields.Name]))

  // currentStock/unitCost/reorderPoint/maxStock come straight from Airtable, but
  // stockValue/stockStatus/abcClass are derived — recompute them here rather than
  // trusting stale values, so edits to the raw fields in Airtable take effect live.
  const itemsRaw: InventoryItem[] = itemRecords.map((r) => {
    const f = r.fields
    const supplierRecId = f.Supplier?.[0]
    const currentStock = f['Current Stock'] ?? 0
    const reorderPoint = f['Reorder Point'] ?? 0
    const maxStock = f['Max Stock'] ?? 0
    const unitCost = f['Unit Cost'] ?? 0
    return {
      sku: f.SKU,
      name: f.Name,
      category: f.Category,
      warehouse: f.Warehouse,
      supplierId: (supplierRecId && supplierCodeByRecId.get(supplierRecId)) || '',
      currentStock,
      minStock: f['Min Stock'] ?? 0,
      reorderPoint,
      maxStock,
      unitCost,
      stockValue: Math.round(currentStock * unitCost * 100) / 100,
      avgMonthlyConsumption: f['Avg Monthly Consumption'] ?? 0,
      lastMovementDate: f['Last Movement Date'] ?? '',
      lastUpdated: f['Last Updated'] ?? '',
      abcClass: 'C',
      stockStatus: computeStockStatus(currentStock, reorderPoint, maxStock),
    }
  })
  const items = assignAbcClasses(itemsRaw)

  const purchaseOrders: PurchaseOrder[] = poRecords.map((r) => {
    const f = r.fields
    const itemRecId = f.Item?.[0]
    const supplierRecId = f.Supplier?.[0]
    return {
      poNumber: f['PO Number'],
      sku: (itemRecId && skuByItemRecId.get(itemRecId)) || '',
      itemName: f['Item Name'] || (itemRecId && itemNameByItemRecId.get(itemRecId)) || '',
      supplierId: (supplierRecId && supplierCodeByRecId.get(supplierRecId)) || '',
      warehouse: f.Warehouse,
      orderedQty: f['Ordered Qty'] ?? 0,
      receivedQty: f['Received Qty'] ?? 0,
      unitCost: f['Unit Cost'] ?? 0,
      orderValue: f['Order Value'] ?? 0,
      orderDate: f['Order Date'] ?? '',
      plannedDeliveryDate: f['Planned Delivery Date'] ?? '',
      actualDeliveryDate: f['Actual Delivery Date'] ?? null,
      status: mapPoStatus(f.Status),
      isLate: !!f['Is Late'],
      isFullQty: !!f['Is Full Qty'],
    }
  })

  // Order counts, OTIF %, lateness and rating are all rollups over purchaseOrders —
  // recompute them live instead of reading the (now potentially stale) stored fields.
  const suppliers: Supplier[] = supplierRecords.map((r) => {
    const id = r.fields['Supplier Code']
    const avgLeadTimeDays = r.fields['Avg Lead Time Days'] ?? 0
    const supplierOrders = purchaseOrders.filter((po) => po.supplierId === id && po.status !== 'CANCELLED')
    const completedOrders = supplierOrders.filter((po) => po.actualDeliveryDate !== null)
    const otifOrders = completedOrders.filter((po) => !po.isLate && po.isFullQty)
    const otifPercent =
      completedOrders.length > 0 ? Math.round((otifOrders.length / completedOrders.length) * 1000) / 10 : 0
    const lateOrderCount = supplierOrders.filter((po) => po.isLate && po.status !== 'RECEIVED').length
    const orderValue = Math.round(supplierOrders.reduce((s, po) => s + po.orderValue, 0))

    return {
      id,
      name: r.fields.Name,
      avgLeadTimeDays,
      otifPercent,
      rating: rateSupplier(otifPercent, avgLeadTimeDays),
      orderCount: supplierOrders.length,
      orderValue,
      lateOrderCount,
    }
  })

  const categories = [...CATEGORIES]
  const warehouses = [...WAREHOUSES]

  return {
    items,
    suppliers,
    purchaseOrders,
    stockValueTrend: generateStockValueTrend(items, warehouses),
    ordersTrend: generateOrdersTrend(purchaseOrders),
    categories,
    warehouses,
  }
}
