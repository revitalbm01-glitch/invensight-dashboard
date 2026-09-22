import { useMemo } from 'react'
import { mockDataset } from '../data/mockData'
import { filterItems, filterPurchaseOrders } from '../logic/filters'
import { useFilters } from '../context/FilterContext'
import type { InventoryItem, PurchaseOrder, Supplier } from '../types'

export interface FilteredData {
  items: InventoryItem[]
  purchaseOrders: PurchaseOrder[]
  suppliers: Supplier[]
}

export function useFilteredData(): FilteredData {
  const { filters } = useFilters()

  const items = useMemo(() => filterItems(mockDataset.items, filters), [filters])
  const purchaseOrders = useMemo(() => filterPurchaseOrders(mockDataset.purchaseOrders, filters), [filters])

  const suppliers = useMemo(() => {
    if (!filters.suppliers.length) return mockDataset.suppliers
    return mockDataset.suppliers.filter((s) => filters.suppliers.includes(s.id))
  }, [filters])

  return { items, purchaseOrders, suppliers }
}
