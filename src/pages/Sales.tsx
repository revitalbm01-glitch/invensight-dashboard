import { useMemo } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { KpiGrid } from '../components/kpi/KpiGrid'
import { SalesTrendChart } from '../components/charts/SalesTrendChart'
import { ChartCard } from '../components/common/ChartCard'
import { SectionHeading } from '../components/common/SectionHeading'
import { DataTable, type DataTableColumn } from '../components/tables/DataTable'
import { useFilteredData } from '../hooks/useFilteredData'
import { buildSalesTrend, last30VsPrevious30, deltaPercent, topItemsBySales, topCustomersBySales } from '../logic/salesAnalytics'
import type { SalesByCustomer, SalesByItem } from '../logic/salesAnalytics'
import { formatCurrencyFull, formatDate, formatNumber, formatPercent } from '../logic/formatters'
import type { KpiValue, Sale } from '../types'

function buildKpi(
  id: string,
  label: string,
  value: number,
  format: KpiValue['format'],
  tooltip: string,
  previousValue?: number,
): KpiValue {
  const prev = previousValue ?? value
  return {
    id,
    label,
    value,
    previousValue: prev,
    deltaPercent: previousValue === undefined ? null : deltaPercent(value, prev),
    format,
    isBreached: false,
    breachDirection: 'down-is-bad',
    tooltip,
  }
}

export default function Sales() {
  const { sales } = useFilteredData()

  const trend = useMemo(() => buildSalesTrend(sales), [sales])
  const topItems = useMemo(() => topItemsBySales(sales, 10), [sales])
  const topCustomers = useMemo(() => topCustomersBySales(sales, 10), [sales])
  const recentSales = useMemo(() => [...sales].sort((a, b) => (a.saleDate < b.saleDate ? 1 : -1)).slice(0, 40), [sales])

  const kpis = useMemo(() => {
    const revenue = sales.reduce((s, x) => s + x.revenue, 0)
    const cost = sales.reduce((s, x) => s + x.cost, 0)
    const units = sales.reduce((s, x) => s + x.quantity, 0)
    const { current, previous } = last30VsPrevious30(sales)
    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0

    return [
      buildKpi('revenue', 'סה"כ הכנסות ממכירות', revenue, 'currency', 'סך ההכנסות מכל עסקאות המכירה בהתאם לפילטרים הפעילים.'),
      buildKpi('revenue30', 'הכנסות 30 ימים אחרונים', current.revenue, 'currency', 'הכנסות ב-30 הימים האחרונים, בהשוואה ל-30 הימים שקדמו להם.', previous.revenue),
      buildKpi('units', 'יחידות שנמכרו', units, 'number', 'סך היחידות שנמכרו בכל העסקאות.'),
      buildKpi('orders', 'מספר עסקאות', sales.length, 'number', 'מספר עסקאות המכירה.'),
      buildKpi('aov', 'ערך עסקה ממוצע', sales.length ? revenue / sales.length : 0, 'currency', 'הכנסה ממוצעת לעסקה.'),
      buildKpi('margin', 'רווח גולמי', margin, 'percent', 'אחוז הרווח הגולמי: (הכנסות פחות עלות הפריטים שנמכרו) חלקי הכנסות.'),
    ]
  }, [sales])

  const itemColumns: DataTableColumn<SalesByItem>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-mono text-xs text-slate-500">{r.sku}</span> },
    { key: 'name', header: 'שם פריט', render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'category', header: 'קטגוריה', render: (r) => r.category },
    { key: 'units', header: 'יחידות', align: 'left', render: (r) => formatNumber(r.units) },
    { key: 'revenue', header: 'הכנסות', align: 'left', render: (r) => <span className="font-semibold">{formatCurrencyFull(r.revenue)}</span> },
    {
      key: 'margin',
      header: 'רווח גולמי',
      align: 'left',
      render: (r) => <span className={r.margin >= 0 ? 'text-status-good' : 'text-status-bad'}>{formatCurrencyFull(r.margin)}</span>,
    },
  ]

  const customerColumns: DataTableColumn<SalesByCustomer>[] = [
    { key: 'customer', header: 'לקוח', render: (r) => <span className="font-medium text-slate-800">{r.customer}</span> },
    { key: 'orders', header: 'עסקאות', align: 'left', render: (r) => formatNumber(r.orders) },
    { key: 'units', header: 'יחידות', align: 'left', render: (r) => formatNumber(r.units) },
    { key: 'revenue', header: 'הכנסות', align: 'left', render: (r) => <span className="font-semibold">{formatCurrencyFull(r.revenue)}</span> },
  ]

  const saleColumns: DataTableColumn<Sale>[] = [
    { key: 'saleId', header: 'מס׳ עסקה', render: (r) => <span className="font-mono text-xs text-slate-500">{r.saleId}</span> },
    { key: 'item', header: 'פריט', render: (r) => <span className="font-medium text-slate-800">{r.itemName}</span> },
    { key: 'customer', header: 'לקוח', render: (r) => r.customer },
    { key: 'warehouse', header: 'מחסן', render: (r) => r.warehouse },
    { key: 'date', header: 'תאריך', render: (r) => formatDate(r.saleDate) },
    { key: 'qty', header: 'כמות', align: 'left', render: (r) => formatNumber(r.quantity) },
    { key: 'price', header: 'מחיר ליחידה', align: 'left', render: (r) => formatCurrencyFull(r.unitPrice) },
    { key: 'revenue', header: 'הכנסה', align: 'left', render: (r) => <span className="font-semibold">{formatCurrencyFull(r.revenue)}</span> },
  ]

  return (
    <PageLayout title="מכירות" subtitle="הכנסות, פריטים נמכרים ולקוחות מובילים">
      <div className="space-y-5">
        <KpiGrid kpis={kpis} featuredId="revenue" />

        <div>
          <SectionHeading title="מגמת מכירות" />
          <SalesTrendChart data={trend} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
          <ChartCard title="Top 10 פריטים נמכרים" tooltip="הפריטים עם ההכנסה הגבוהה ביותר מהמכירות.">
            <DataTable columns={itemColumns} rows={topItems} rowKey={(r) => r.sku} emptyTitle="אין מכירות להצגה" />
          </ChartCard>
          <ChartCard title="Top 10 לקוחות" tooltip="הלקוחות עם סך ההכנסות הגבוה ביותר.">
            <DataTable columns={customerColumns} rows={topCustomers} rowKey={(r) => r.customer} emptyTitle="אין מכירות להצגה" />
          </ChartCard>
        </div>

        <ChartCard
          title="עסקאות אחרונות"
          subtitle={`${recentSales.length} מתוך ${formatNumber(sales.length)} עסקאות`}
          tooltip="עסקאות המכירה האחרונות בהתאם לפילטרים הפעילים."
        >
          <DataTable columns={saleColumns} rows={recentSales} rowKey={(r) => r.saleId} emptyTitle="אין מכירות להצגה" />
        </ChartCard>

        <p className="text-xs text-slate-400">אחוז רווח גולמי כולל: {formatPercent(Number(kpis[5].value))}</p>
      </div>
    </PageLayout>
  )
}
