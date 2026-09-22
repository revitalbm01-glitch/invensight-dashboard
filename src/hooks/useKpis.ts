import { useMemo } from 'react'
import { computeKpis } from '../logic/kpiCalculations'
import { mockDataset } from '../data/mockData'
import { useFilteredData } from './useFilteredData'
import type { KpiValue } from '../types'

export function useKpis(): KpiValue[] {
  const { items, purchaseOrders } = useFilteredData()

  return useMemo(
    () => computeKpis({ items, purchaseOrders, stockValueTrend: mockDataset.stockValueTrend }),
    [items, purchaseOrders],
  )
}
