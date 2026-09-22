import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { KpiGrid } from '../components/kpi/KpiGrid'
import { OrdersTrendChart } from '../components/charts/OrdersTrendChart'
import { SupplierPerformanceChart } from '../components/charts/SupplierPerformanceChart'
import { ChartCard } from '../components/common/ChartCard'
import { SuppliersTable } from '../components/tables/SuppliersTable'
import { PurchaseOrdersTable } from '../components/tables/PurchaseOrdersTable'
import { useFilteredData } from '../hooks/useFilteredData'
import { useFilters } from '../context/FilterContext'
import { mockDataset } from '../data/mockData'
import { computeKpis } from '../logic/kpiCalculations'
import { formatDays, formatNumber } from '../logic/formatters'
import type { KpiValue } from '../types'

export default function Logistics() {
  const { items, purchaseOrders, suppliers } = useFilteredData()
  const { updateFilter } = useFilters()
  const [searchParams] = useSearchParams()
  const [poSearch, setPoSearch] = useState('')

  useEffect(() => {
    const supplierId = searchParams.get('supplier')
    if (supplierId) updateFilter('suppliers', [supplierId])
    const po = searchParams.get('po')
    if (po) setPoSearch(po)
  }, [searchParams, updateFilter])

  const allKpis = useMemo(
    () => computeKpis({ items, purchaseOrders, stockValueTrend: mockDataset.stockValueTrend }),
    [items, purchaseOrders],
  )
  const logisticsKpis = useMemo(
    () => allKpis.filter((k) => ['openOrders', 'lateOrders', 'otif'].includes(k.id)),
    [allKpis],
  )

  const avgLeadTime = useMemo(() => {
    const active = suppliers.filter((s) => s.orderCount > 0)
    if (active.length === 0) return 0
    return active.reduce((s, sup) => s + sup.avgLeadTimeDays, 0) / active.length
  }, [suppliers])

  const receivedCount = useMemo(() => purchaseOrders.filter((po) => po.status === 'RECEIVED').length, [purchaseOrders])

  const leadTimeKpi: KpiValue = {
    id: 'avgLeadTime',
    label: 'זמן אספקה ממוצע',
    value: avgLeadTime,
    previousValue: avgLeadTime,
    deltaPercent: null,
    format: 'days',
    isBreached: avgLeadTime > 14,
    breachDirection: 'up-is-bad',
    tooltip: 'ממוצע פשוט של זמני האספקה של כלל הספקים הפעילים בפילטר הנוכחי.',
  }
  const receivedKpi: KpiValue = {
    id: 'received',
    label: 'הזמנות שהתקבלו',
    value: receivedCount,
    previousValue: receivedCount,
    deltaPercent: null,
    format: 'number',
    isBreached: false,
    breachDirection: 'down-is-bad',
    tooltip: 'הזמנות רכש שהושלמו והתקבלו במלואן בזמן.',
  }

  const displayedOrders = poSearch ? purchaseOrders.filter((po) => po.poNumber.includes(poSearch)) : purchaseOrders

  return (
    <PageLayout title="לוגיסטיקה ורכש" subtitle="מעקב הזמנות רכש, ביצועי ספקים וזמני אספקה">
      <div className="space-y-6">
        <KpiGrid kpis={[...logisticsKpis, leadTimeKpi, receivedKpi]} />

        <OrdersTrendChart data={mockDataset.ordersTrend} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SupplierPerformanceChart suppliers={suppliers} metric="leadTime" />
          <SupplierPerformanceChart suppliers={suppliers} metric="otif" />
        </div>

        <ChartCard title="טבלת ספקים" subtitle={`${suppliers.length} ספקים`} tooltip="ביצועי כלל הספקים: היקף הזמנות, Lead Time, OTIF ואיחורים.">
          <SuppliersTable
            suppliers={[...suppliers].sort((a, b) => b.orderValue - a.orderValue)}
            onRowClick={(s) => updateFilter('suppliers', [s.id])}
          />
        </ChartCard>

        <ChartCard
          title="הזמנות רכש"
          subtitle={`${displayedOrders.length} הזמנות${poSearch ? ` · סינון לפי: ${poSearch}` : ''}`}
          tooltip="כלל הזמנות הרכש בהתאם לפילטרים הפעילים, ממוינות לפי תאריך הזמנה."
          action={
            poSearch ? (
              <button type="button" onClick={() => setPoSearch('')} className="text-xs font-semibold text-brand-600 hover:underline">
                נקה סינון הזמנה
              </button>
            ) : undefined
          }
        >
          <PurchaseOrdersTable
            orders={[...displayedOrders].sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1)).slice(0, 60)}
            suppliers={mockDataset.suppliers}
          />
          {displayedOrders.length > 60 && (
            <p className="mt-3 text-center text-xs text-slate-400">
              מוצגות 60 ההזמנות האחרונות מתוך {formatNumber(displayedOrders.length)} · צמצמו באמצעות הפילטרים לתוצאה ממוקדת יותר
            </p>
          )}
        </ChartCard>

        <p className="text-xs text-slate-400">זמן אספקה ממוצע כולל: {formatDays(avgLeadTime)}</p>
      </div>
    </PageLayout>
  )
}
