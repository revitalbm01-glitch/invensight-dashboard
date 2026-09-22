import { useMemo } from 'react'
import { generateAlerts } from '../logic/alertEngine'
import { useFilteredData } from './useFilteredData'
import type { ManagementAlert } from '../types'

export function useAlerts(): ManagementAlert[] {
  const { items, purchaseOrders, suppliers } = useFilteredData()

  return useMemo(() => generateAlerts(items, purchaseOrders, suppliers), [items, purchaseOrders, suppliers])
}
