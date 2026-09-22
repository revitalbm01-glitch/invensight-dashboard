import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { CategoryBarChart } from '../components/charts/CategoryBarChart'
import { TrendLineChart } from '../components/charts/TrendLineChart'
import { AbcParetoChart } from '../components/charts/AbcParetoChart'
import { ChartCard } from '../components/common/ChartCard'
import { ItemsTable } from '../components/tables/ItemsTable'
import { useFilteredData } from '../hooks/useFilteredData'
import { useFilters } from '../context/FilterContext'
import { mockDataset } from '../data/mockData'
import { topItemsByValue, excessStockItems, shortageRiskItems, noMovementItems } from '../logic/itemInsights'
import { summarizeAbcClasses } from '../logic/abcAnalysis'
import { formatNumber, formatCurrencyFull } from '../logic/formatters'
import type { DataTableColumn } from '../components/tables/DataTable'

const ABC_CLASS_LABEL: Record<'A' | 'B' | 'C', string> = { A: 'ניהול הדוק, בדיקה שוטפת', B: 'מעקב תקופתי', C: 'ניהול מינימלי' }
const ABC_CLASS_TONE: Record<'A' | 'B' | 'C', string> = { A: 'border-brand-300 bg-brand-50', B: 'border-slate-300 bg-slate-50', C: 'border-slate-200 bg-white' }

export default function InventoryAnalysis() {
  const { items } = useFilteredData()
  const { updateFilter } = useFilters()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const sku = searchParams.get('sku')
    if (sku) updateFilter('skuSearch', sku)
  }, [searchParams, updateFilter])

  const top10 = useMemo(() => topItemsByValue(items, 10), [items])
  const excess = useMemo(() => excessStockItems(items), [items])
  const atRisk = useMemo(() => shortageRiskItems(items), [items])
  const idle = useMemo(() => noMovementItems(items), [items])
  const abcSummary = useMemo(() => summarizeAbcClasses(items), [items])

  const atRiskColumns: DataTableColumn<(typeof atRisk)[number]>[] = [
    {
      key: 'daysUntilStockout',
      header: 'ימים עד אזילה',
      align: 'left',
      render: (r) => <span className="font-semibold text-status-warn">{formatNumber(Math.round(r.daysUntilStockout))} ימים</span>,
    },
  ]

  const idleColumns: DataTableColumn<(typeof idle)[number]>[] = [
    {
      key: 'idleDays',
      header: 'ימים ללא תנועה',
      align: 'left',
      render: (r) => <span className="font-semibold text-status-warn">{formatNumber(r.idleDays)} ימים</span>,
    },
  ]

  return (
    <PageLayout title="ניתוח מלאי" subtitle="ניתוח מעמיק של שווי, חלוקה, חריגות ותרומת פריטים למלאי">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CategoryBarChart
            items={items}
            groupBy="category"
            title="שווי מלאי לפי קטגוריה"
            onBarClick={(category) => updateFilter('categories', [category])}
          />
          <CategoryBarChart
            items={items}
            groupBy="warehouse"
            title="שווי מלאי לפי מחסן"
            onBarClick={(warehouse) => updateFilter('warehouses', [warehouse])}
          />
        </div>

        <TrendLineChart data={mockDataset.stockValueTrend} warehouses={mockDataset.warehouses} />

        <ChartCard title="ABC Analysis — סיווג פריטים לפי תרומה לשווי המלאי" tooltip="A = 80% הראשונים מהשווי, B = עד 95%, C = היתרה.">
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {abcSummary.map((s) => (
              <div key={s.abcClass} className={`rounded-xl border p-4 ${ABC_CLASS_TONE[s.abcClass]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-800">קטגוריה {s.abcClass}</span>
                  <span className="text-xs text-slate-400">{ABC_CLASS_LABEL[s.abcClass]}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">מס' פריטים</p>
                    <p className="text-lg font-bold text-slate-800">{formatNumber(s.itemCount)} ({s.itemPercent}%)</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">שווי מלאי</p>
                    <p className="text-lg font-bold text-slate-800">{s.valuePercent}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AbcParetoChart items={items} />
        </ChartCard>

        <ChartCard title="Top 10 פריטים לפי שווי מלאי" tooltip="הפריטים התורמים הכי הרבה לשווי המלאי הכולל.">
          <ItemsTable items={top10} />
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="פריטים עם מלאי עודף"
            subtitle={`${excess.length} פריטים`}
            tooltip="מלאי נוכחי גבוה ממלאי המקסימום שהוגדר — הון כלוא מיותר."
          >
            <ItemsTable items={excess} emptyTitle="אין פריטים במלאי עודף" emptySubtitle="מצוין — אין הון כלוא מיותר כרגע" />
          </ChartCard>

          <ChartCard
            title="פריטים בסיכון לחוסר"
            subtitle={`${atRisk.length} פריטים`}
            tooltip="פריטים שטרם ירדו מתחת לנקודת ההזמנה, אך בקצב הצריכה הנוכחי צפויים לאזול תוך 21 יום."
          >
            <ItemsTable items={atRisk} extraColumns={atRiskColumns} emptyTitle="אין פריטים בסיכון" emptySubtitle="קצב הצריכה הנוכחי לא מסמן סיכון לחוסר" />
          </ChartCard>
        </div>

        <ChartCard
          title="פריטים ללא תנועה"
          subtitle={`${idle.length} פריטים ללא תנועת מלאי מעל 60 יום — שווי כולל: ${formatCurrencyFull(idle.reduce((s, i) => s + i.stockValue, 0))}`}
          tooltip="פריטים שלא נרשמה בהם כל תנועת מלאי (מכירה/צריכה) ביותר מ-60 הימים האחרונים — מועמדים לסליקה או מבצע."
        >
          <ItemsTable items={idle} extraColumns={idleColumns} emptyTitle="אין מלאי מת" emptySubtitle="כל הפריטים מציגים תנועת מלאי סדירה" />
        </ChartCard>

        <ChartCard title="כלל הפריטים במלאי (מפורט)" subtitle={`${items.length} פריטים בהתאם לפילטרים הפעילים`}>
          <ItemsTable
            items={[...items].sort((a, b) => b.stockValue - a.stockValue)}
            emptyTitle="אין פריטים להצגה"
            emptySubtitle="נסו לשנות את הפילטרים הפעילים"
          />
        </ChartCard>
      </div>
    </PageLayout>
  )
}
