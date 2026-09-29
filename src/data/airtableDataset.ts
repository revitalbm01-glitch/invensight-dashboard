import { fetchAllRecords } from '../services/airtable'
import { CATEGORIES, WAREHOUSES } from './generators/items'
import { generateStockValueTrend, generateOrdersTrend } from './generators/timeSeries'
import type {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  MockDataset,
  StockStatus,
  PoStatus,
  AbcClass,
  SupplierRating,
} from '../types'

interface SupplierFields {
  Name: string
  'Supplier Code': string
  'Avg Lead Time Days': number
  'OTIF %': number
  Rating?: string
  'Order Count': number
  'Order Value': number
  'Late Order Count': number
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
  'Stock Value': number
  'Avg Monthly Consumption': number
  'Last Movement Date': string
  'Last Updated': string
  'ABC Class': string
  'Stock Status': string
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

function mapStockStatus(label: string): StockStatus {
  switch (label) {
    case 'Out of Stock':
      return 'OUT_OF_STOCK'
    case 'Below Reorder':
      return 'BELOW_REORDER'
    case 'Excess':
      return 'EXCESS'
    default:
      return 'NORMAL'
  }
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

const SUPPLIER_RATINGS: readonly SupplierRating[] = ['excellent', 'good', 'warning', 'critical']

function mapRating(label: string | undefined): SupplierRating {
  const lower = (label ?? '').toLowerCase()
  return (SUPPLIER_RATINGS as readonly string[]).includes(lower) ? (lower as SupplierRating) : 'good'
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

  const suppliers: Supplier[] = supplierRecords.map((r) => ({
    id: r.fields['Supplier Code'],
    name: r.fields.Name,
    avgLeadTimeDays: r.fields['Avg Lead Time Days'] ?? 0,
    otifPercent: r.fields['OTIF %'] ?? 0,
    rating: mapRating(r.fields.Rating),
    orderCount: r.fields['Order Count'] ?? 0,
    orderValue: r.fields['Order Value'] ?? 0,
    lateOrderCount: r.fields['Late Order Count'] ?? 0,
  }))

  const items: InventoryItem[] = itemRecords.map((r) => {
    const f = r.fields
    const supplierRecId = f.Supplier?.[0]
    return {
      sku: f.SKU,
      name: f.Name,
      category: f.Category,
      warehouse: f.Warehouse,
      supplierId: (supplierRecId && supplierCodeByRecId.get(supplierRecId)) || '',
      currentStock: f['Current Stock'] ?? 0,
      minStock: f['Min Stock'] ?? 0,
      reorderPoint: f['Reorder Point'] ?? 0,
      maxStock: f['Max Stock'] ?? 0,
      unitCost: f['Unit Cost'] ?? 0,
      stockValue: f['Stock Value'] ?? 0,
      avgMonthlyConsumption: f['Avg Monthly Consumption'] ?? 0,
      lastMovementDate: f['Last Movement Date'] ?? '',
      lastUpdated: f['Last Updated'] ?? '',
      abcClass: (f['ABC Class'] as AbcClass) ?? 'C',
      stockStatus: mapStockStatus(f['Stock Status']),
    }
  })

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
