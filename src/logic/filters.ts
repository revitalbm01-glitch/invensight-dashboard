import type { GlobalFilters, InventoryItem, PurchaseOrder } from '../types'

export const DEFAULT_FILTERS: GlobalFilters = {
  dateRange: { from: null, to: null },
  warehouses: [],
  categories: [],
  suppliers: [],
  skuSearch: '',
  stockStatuses: [],
  abcClasses: [],
}

export function isFiltersActive(filters: GlobalFilters): boolean {
  return (
    !!filters.dateRange.from ||
    !!filters.dateRange.to ||
    filters.warehouses.length > 0 ||
    filters.categories.length > 0 ||
    filters.suppliers.length > 0 ||
    filters.skuSearch.trim().length > 0 ||
    filters.stockStatuses.length > 0 ||
    filters.abcClasses.length > 0
  )
}

export function filterItems(items: InventoryItem[], filters: GlobalFilters): InventoryItem[] {
  const search = filters.skuSearch.trim().toLowerCase()

  return items.filter((item) => {
    if (filters.warehouses.length && !filters.warehouses.includes(item.warehouse)) return false
    if (filters.categories.length && !filters.categories.includes(item.category)) return false
    if (filters.suppliers.length && !filters.suppliers.includes(item.supplierId)) return false
    if (filters.stockStatuses.length && !filters.stockStatuses.includes(item.stockStatus)) return false
    if (filters.abcClasses.length && !filters.abcClasses.includes(item.abcClass)) return false
    if (search && !item.sku.toLowerCase().includes(search) && !item.name.toLowerCase().includes(search)) return false
    if (filters.dateRange.from && item.lastUpdated < filters.dateRange.from) return false
    if (filters.dateRange.to && item.lastUpdated > filters.dateRange.to) return false
    return true
  })
}

export function filterPurchaseOrders(orders: PurchaseOrder[], filters: GlobalFilters): PurchaseOrder[] {
  const search = filters.skuSearch.trim().toLowerCase()

  return orders.filter((po) => {
    if (filters.warehouses.length && !filters.warehouses.includes(po.warehouse)) return false
    if (filters.suppliers.length && !filters.suppliers.includes(po.supplierId)) return false
    if (search && !po.sku.toLowerCase().includes(search) && !po.itemName.toLowerCase().includes(search)) return false
    if (filters.dateRange.from && po.orderDate < filters.dateRange.from) return false
    if (filters.dateRange.to && po.orderDate > filters.dateRange.to) return false
    return true
  })
}
