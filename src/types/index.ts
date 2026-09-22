// ---------------------------------------------------------------------------
// Core domain types — mirrors the data model defined in SPEC.md section 4.
// ---------------------------------------------------------------------------

export type AbcClass = 'A' | 'B' | 'C'

export type StockStatus = 'OUT_OF_STOCK' | 'BELOW_REORDER' | 'EXCESS' | 'NORMAL'

export type SupplierRating = 'excellent' | 'good' | 'warning' | 'critical'

export type PoStatus = 'OPEN' | 'IN_TRANSIT' | 'RECEIVED' | 'LATE' | 'CANCELLED'

export type Severity = 'critical' | 'warning' | 'good' | 'info'

export interface InventoryItem {
  sku: string
  name: string
  category: string
  warehouse: string
  supplierId: string
  currentStock: number
  minStock: number
  reorderPoint: number
  maxStock: number
  unitCost: number
  stockValue: number
  avgMonthlyConsumption: number
  lastMovementDate: string
  lastUpdated: string
  abcClass: AbcClass
  stockStatus: StockStatus
}

export interface Supplier {
  id: string
  name: string
  avgLeadTimeDays: number
  otifPercent: number
  rating: SupplierRating
  orderCount: number
  orderValue: number
  lateOrderCount: number
}

export interface PurchaseOrder {
  poNumber: string
  sku: string
  itemName: string
  supplierId: string
  warehouse: string
  orderedQty: number
  receivedQty: number
  unitCost: number
  orderValue: number
  orderDate: string
  plannedDeliveryDate: string
  actualDeliveryDate: string | null
  status: PoStatus
  isLate: boolean
  isFullQty: boolean
}

export interface StockValuePoint {
  date: string
  label: string
  totalStockValue: number
  byWarehouse: Record<string, number>
}

export interface OrdersTrendPoint {
  date: string
  label: string
  opened: number
  received: number
}

export interface MockDataset {
  items: InventoryItem[]
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  stockValueTrend: StockValuePoint[]
  ordersTrend: OrdersTrendPoint[]
  categories: string[]
  warehouses: string[]
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface DateRange {
  from: string | null
  to: string | null
}

export interface GlobalFilters {
  dateRange: DateRange
  warehouses: string[]
  categories: string[]
  suppliers: string[]
  skuSearch: string
  stockStatuses: StockStatus[]
  abcClasses: AbcClass[]
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export interface KpiValue {
  id: string
  label: string
  value: number
  previousValue: number
  deltaPercent: number | null
  format: 'currency' | 'number' | 'percent' | 'days'
  isBreached: boolean
  breachDirection: 'up-is-bad' | 'down-is-bad'
  tooltip: string
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export type AlertType =
  | 'BELOW_REORDER'
  | 'OUT_OF_STOCK'
  | 'LATE_ORDER'
  | 'EXCESS_STOCK'
  | 'NO_MOVEMENT'
  | 'HIGH_LEAD_TIME'
  | 'SUPPLIER_OK'

export interface ManagementAlert {
  id: string
  type: AlertType
  severity: Severity
  title: string
  description: string
  entityLabel: string
  linkTo: string
  timestamp: string
}
