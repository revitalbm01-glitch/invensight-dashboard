import { useMemo } from 'react'
import { useDataset } from '../context/DataContext'
import { filterItems, filterPurchaseOrders, filterSales } from '../logic/filters'
import { useFilters } from '../context/FilterContext'
import type { InventoryItem, PurchaseOrder, Sale, Supplier } from '../types'

export interface FilteredData {
  items: InventoryItem[]
  purchaseOrders: PurchaseOrder[]
  sales: Sale[]
  suppliers: Supplier[]
}

export function useFilteredData(): FilteredData {
  const { filters } = useFilters()
  const dataset = useDataset()

  const items = useMemo(() => filterItems(dataset.items, filters), [dataset, filters])
  const purchaseOrders = useMemo(() => filterPurchaseOrders(dataset.purchaseOrders, filters), [dataset, filters])

  const sales = useMemo(() => filterSales(dataset.sales, filters), [dataset, filters])

  const suppliers = useMemo(() => {
    if (!filters.suppliers.length) return dataset.suppliers
    return dataset.suppliers.filter((s) => filters.suppliers.includes(s.id))
  }, [dataset, filters])

  return { items, purchaseOrders, sales, suppliers }
}
