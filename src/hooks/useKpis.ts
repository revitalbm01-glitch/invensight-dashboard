import { useMemo } from 'react'
import { computeKpis } from '../logic/kpiCalculations'
import { useDataset } from '../context/DataContext'
import { useFilteredData } from './useFilteredData'
import type { KpiValue } from '../types'

export function useKpis(): KpiValue[] {
  const { items, purchaseOrders } = useFilteredData()
  const dataset = useDataset()

  return useMemo(
    () => computeKpis({ items, purchaseOrders, stockValueTrend: dataset.stockValueTrend }),
    [items, purchaseOrders, dataset],
  )
}
