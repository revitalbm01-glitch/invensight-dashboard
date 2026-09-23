import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { KpiGrid } from '../components/kpi/KpiGrid'
import { TrendLineChart } from '../components/charts/TrendLineChart'
import { CategoryBarChart } from '../components/charts/CategoryBarChart'
import { ItemsTable } from '../components/tables/ItemsTable'
import { ChartCard } from '../components/common/ChartCard'
import { SectionHeading } from '../components/common/SectionHeading'
import { useKpis } from '../hooks/useKpis'
import { useFilteredData } from '../hooks/useFilteredData'
import { useAlerts } from '../hooks/useAlerts'
import { useFilters } from '../context/FilterContext'
import { mockDataset } from '../data/mockData'
import { topItemsByValue } from '../logic/itemInsights'
import type { KpiValue, StockStatus } from '../types'

const KPI_DRILLDOWN: Partial<Record<string, { path: string; stockStatuses?: StockStatus[] }>> = {
  belowReorder: { path: '/inventory', stockStatuses: ['BELOW_REORDER'] },
  outOfStock: { path: '/inventory', stockStatuses: ['OUT_OF_STOCK'] },
  excessStock: { path: '/inventory', stockStatuses: ['EXCESS'] },
  openOrders: { path: '/logistics' },
  lateOrders: { path: '/logistics' },
  otif: { path: '/logistics' },
  totalStockValue: { path: '/inventory' },
  itemCount: { path: '/inventory' },
}

export default function ExecutiveDashboard() {
  const kpis = useKpis()
  const { items } = useFilteredData()
  const alerts = useAlerts()
  const { updateFilter } = useFilters()
  const navigate = useNavigate()

  const criticalAlerts = useMemo(() => alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').slice(0, 8), [alerts])
  const top10Items = useMemo(() => topItemsByValue(items, 10), [items])
  const topItemsQuickList = top10Items.slice(0, 6)

  function handleKpiClick(kpi: KpiValue) {
    const target = KPI_DRILLDOWN[kpi.id]
    if (!target) return
    if (target.stockStatuses) updateFilter('stockStatuses', target.stockStatuses)
    navigate(target.path)
  }

  return (
    <PageLayout title="דשבורד ראשי" subtitle="תמונת מצב כוללת של מלאי, רכש ולוגיסטיקה">
      <div className="space-y-5">
        <KpiGrid kpis={kpis} onKpiClick={handleKpiClick} featuredId="totalStockValue" />

        <div>
          <SectionHeading title="מגמות ושווי מלאי" />
          <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <TrendLineChart data={mockDataset.stockValueTrend} warehouses={mockDataset.warehouses} />
            </div>
            <CategoryBarChart
              items={items}
              groupBy="category"
              title="שווי מלאי לפי קטגוריה"
              onBarClick={(category) => updateFilter('categories', [category])}
            />
          </div>
        </div>

        <div>
          <SectionHeading title="תובנות ניהוליות" />
          <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ChartCard
                title="דורש טיפול מיידי"
                subtitle="החריגות המשמעותיות ביותר כרגע, ממוינות לפי חומרה"
                tooltip="שילוב של מלאי אפס, הזמנות באיחור חמורות וספקים בעייתיים."
                accent="bad"
                action={
                  <button
                    type="button"
                    onClick={() => navigate('/alerts')}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    לכל ההתראות ←
                  </button>
                }
              >
                {criticalAlerts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">אין חריגות פעילות כרגע — הכל תקין.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {criticalAlerts.map((a) => (
                      <li key={a.id} className="flex items-center gap-3 py-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            a.severity === 'critical' ? 'bg-status-bad' : 'bg-status-warn'
                          }`}
                        />
                        <span className="flex-1 truncate text-sm text-slate-700">{a.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ChartCard>
            </div>

            <ChartCard title="Top פריטים לפי שווי מלאי" tooltip="6 הפריטים בעלי שווי המלאי הגבוה ביותר, בהתאם לפילטר הנוכחי.">
              <ul className="divide-y divide-slate-100">
                {topItemsQuickList.map((item, idx) => (
                  <li key={item.sku} className="flex items-center gap-3 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate text-sm text-slate-700">{item.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-slate-800">
                      {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(item.stockValue)}
                    </span>
                  </li>
                ))}
              </ul>
            </ChartCard>
          </div>
        </div>

        <ChartCard title="פירוט Top 10 פריטים לפי שווי מלאי" tooltip="הפריטים עם שווי המלאי הגבוה ביותר, לפי הפילטר הנוכחי.">
          <ItemsTable items={top10Items} />
        </ChartCard>
      </div>
    </PageLayout>
  )
}
