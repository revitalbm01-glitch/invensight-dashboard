import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { CategoryBarChart } from '../components/charts/CategoryBarChart'
import { TrendLineChart } from '../components/charts/TrendLineChart'
import { AbcParetoChart } from '../components/charts/AbcParetoChart'
import { ChartCard } from '../components/common/ChartCard'
import { SectionHeading } from '../components/common/SectionHeading'
import { ItemsTable } from '../components/tables/ItemsTable'
import { useFilteredData } from '../hooks/useFilteredData'
import { useFilters } from '../context/FilterContext'
import { mockDataset } from '../data/mockData'
import { topItemsByValue, excessStockItems, shortageRiskItems, noMovementItems } from '../logic/itemInsights'
import { summarizeAbcClasses } from '../logic/abcAnalysis'
import { formatNumber, formatCurrencyFull } from '../logic/formatters'
import type { DataTableColumn } from '../components/tables/DataTable'

const ABC_CLASS_LABEL: Record<'A' | 'B' | 'C', string> = { A: 'ניהול הדוק, בדיקה שוטפת', B: 'מעקב תקופתי', C: 'ניהול מינימלי' }
const ABC_CLASS_TONE: Record<'A' | 'B' | 'C', { ring: string; badge: string; bar: string }> = {
  A: { ring: 'border-brand-200 bg-brand-50/40', badge: 'bg-brand-600 text-white', bar: 'bg-brand-600' },
  B: { ring: 'border-slate-200 bg-white', badge: 'bg-slate-400 text-white', bar: 'bg-slate-400' },
  C: { ring: 'border-slate-200 bg-white', badge: 'bg-slate-200 text-slate-600', bar: 'bg-slate-300' },
}

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
      <div className="space-y-5">
        <div>
          <SectionHeading title="חלוקת שווי מלאי" />
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
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
        </div>

        <TrendLineChart data={mockDataset.stockValueTrend} warehouses={mockDataset.warehouses} />

        <ChartCard title="ABC Analysis — סיווג פריטים לפי תרומה לשווי המלאי" tooltip="A = 80% הראשונים מהשווי, B = עד 95%, C = היתרה.">
          <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {abcSummary.map((s) => {
              const tone = ABC_CLASS_TONE[s.abcClass]
              return (
                <div key={s.abcClass} className={`rounded-xl border p-4 transition-shadow hover:shadow-cardHover ${tone.ring}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${tone.badge}`}>
                      {s.abcClass}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">קטגוריה {s.abcClass}</p>
                      <p className="truncate text-[11px] text-slate-400">{ABC_CLASS_LABEL[s.abcClass]}</p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">מס' פריטים</p>
                      <p className="text-lg font-extrabold tracking-tight text-slate-800">
                        {formatNumber(s.itemCount)} <span className="text-xs font-semibold text-slate-400">({s.itemPercent}%)</span>
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-medium text-slate-400">משווי המלאי</p>
                      <p className="text-lg font-extrabold tracking-tight text-slate-800">{s.valuePercent}%</p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${s.valuePercent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <AbcParetoChart items={items} />
        </ChartCard>

        <ChartCard title="Top 10 פריטים לפי שווי מלאי" tooltip="הפריטים התורמים הכי הרבה לשווי המלאי הכולל.">
          <ItemsTable items={top10} />
        </ChartCard>

        <div>
          <SectionHeading title="חריגות מלאי" subtitle="פריטים שדורשים החלטה תפעולית" />
          <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
            <ChartCard
              title="פריטים עם מלאי עודף"
              subtitle={`${excess.length} פריטים`}
              tooltip="מלאי נוכחי גבוה ממלאי המקסימום שהוגדר — הון כלוא מיותר."
              accent="warn"
            >
              <ItemsTable items={excess} emptyTitle="אין פריטים במלאי עודף" emptySubtitle="מצוין — אין הון כלוא מיותר כרגע" />
            </ChartCard>

            <ChartCard
              title="פריטים בסיכון לחוסר"
              subtitle={`${atRisk.length} פריטים`}
              tooltip="פריטים שטרם ירדו מתחת לנקודת ההזמנה, אך בקצב הצריכה הנוכחי צפויים לאזול תוך 21 יום."
              accent="warn"
            >
              <ItemsTable items={atRisk} extraColumns={atRiskColumns} emptyTitle="אין פריטים בסיכון" emptySubtitle="קצב הצריכה הנוכחי לא מסמן סיכון לחוסר" />
            </ChartCard>
          </div>
        </div>

        <ChartCard
          title="פריטים ללא תנועה"
          subtitle={`${idle.length} פריטים ללא תנועת מלאי מעל 60 יום — שווי כולל: ${formatCurrencyFull(idle.reduce((s, i) => s + i.stockValue, 0))}`}
          tooltip="פריטים שלא נרשמה בהם כל תנועת מלאי (מכירה/צריכה) ביותר מ-60 הימים האחרונים — מועמדים לסליקה או מבצע."
          accent="warn"
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
