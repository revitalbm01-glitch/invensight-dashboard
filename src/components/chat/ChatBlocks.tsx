import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartBlock, ChatBlock, TableBlock } from '../../services/chat'
import { formatCurrencyFull, formatNumber } from '../../logic/formatters'

// Same decorative palette as the dashboard's KPI cards / donut chart.
const PALETTE = ['#3d8f8c', '#c9791f', '#7d3f9e', '#3f5fc4', '#c23f6b', '#64748b']

const COLUMN_LABELS: Record<string, string> = {
  SKU: 'SKU',
  Name: 'שם פריט',
  'Item Name': 'שם פריט',
  Category: 'קטגוריה',
  Warehouse: 'מחסן',
  Supplier: 'ספק',
  'Current Stock': 'מלאי נוכחי',
  'Unit Cost': 'עלות יחידה',
  'Stock Value': 'שווי מלאי',
  'Reorder Point': 'נקודת הזמנה',
  'Min Stock': 'מלאי מינימום',
  'Max Stock': 'מלאי מקסימום',
  'Avg Monthly Consumption': 'צריכה חודשית',
  'Stock Status': 'סטטוס מלאי',
  'Last Movement Date': 'תנועה אחרונה',
  'Last Updated': 'עודכן',
  'PO Number': 'הזמנת רכש',
  Status: 'סטטוס',
  'Order Date': 'תאריך הזמנה',
  'Planned Delivery Date': 'אספקה מתוכננת',
  'Actual Delivery Date': 'אספקה בפועל',
  'Ordered Qty': 'כמות שהוזמנה',
  'Received Qty': 'כמות שהתקבלה',
  'Order Value': 'ערך הזמנה',
  'Order Count': 'מספר הזמנות',
  'Supplier Code': 'קוד ספק',
  Rating: 'דירוג',
  'Avg Lead Time Days': 'זמן אספקה (ימים)',
  'OTIF %': 'OTIF %',
  'Sale ID': 'מס׳ עסקה',
  Customer: 'לקוח',
  'Sale Date': 'תאריך מכירה',
  Quantity: 'כמות',
  'Unit Price': 'מחיר ליחידה',
  Revenue: 'הכנסה',
  Cost: 'עלות',
  'Gross Profit': 'רווח גולמי',
}

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  OUT_OF_STOCK: { label: 'אזל', cls: 'bg-red-100 text-red-700' },
  BELOW_REORDER: { label: 'מתחת לנקודת הזמנה', cls: 'bg-orange-100 text-orange-700' },
  EXCESS: { label: 'עודף', cls: 'bg-purple-100 text-purple-700' },
  NORMAL: { label: 'תקין', cls: 'bg-emerald-100 text-emerald-700' },
  Excellent: { label: 'מצוין', cls: 'bg-emerald-100 text-emerald-700' },
  Good: { label: 'טוב', cls: 'bg-blue-100 text-blue-700' },
  Warning: { label: 'אזהרה', cls: 'bg-orange-100 text-orange-700' },
  Critical: { label: 'קריטי', cls: 'bg-red-100 text-red-700' },
  Received: { label: 'התקבלה', cls: 'bg-emerald-100 text-emerald-700' },
  Open: { label: 'פתוחה', cls: 'bg-blue-100 text-blue-700' },
  'In Transit': { label: 'במשלוח', cls: 'bg-purple-100 text-purple-700' },
  Late: { label: 'באיחור', cls: 'bg-red-100 text-red-700' },
  Cancelled: { label: 'בוטלה', cls: 'bg-slate-200 text-slate-600' },
}

const MONEY_FIELD = /(value|cost|revenue|price|profit)$/i
const isMoneyField = (f: string | null) => !!f && MONEY_FIELD.test(f.trim())
const isPercentField = (f: string | null) => !!f && f.includes('%')

function formatCell(column: string, value: string | number | boolean | null): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return isMoneyField(column) ? formatCurrencyFull(value) : formatNumber(value)
  if (typeof value === 'boolean') return value ? 'כן' : 'לא'
  return String(value)
}

interface ChartFormat {
  unit: string // caption shown under the title, '' when none
  label: (v: number) => string // short label on the chart (bar top / point / axis)
  full: (v: number) => string // tooltip / legend
}

// Money is shown in thousands of ₪ ("אלפי ₪") when the numbers are large; small money values stay in ₪.
function chartFormat(block: ChartBlock): ChartFormat {
  const max = Math.max(...block.points.map((p) => Math.abs(p.value)), 0)
  if (isPercentField(block.field)) {
    return { unit: 'באחוזים', label: (v) => `${formatNumber(Math.round(v * 10) / 10)}%`, full: (v) => `${formatNumber(Math.round(v * 10) / 10)}%` }
  }
  if (isMoneyField(block.field)) {
    if (max >= 10_000) {
      const k = (v: number) => formatNumber(Math.round(v / 1000))
      return { unit: 'באלפי ₪', label: k, full: (v) => `${k(v)} אלפי ₪` }
    }
    return { unit: 'ב-₪', label: (v) => formatNumber(Math.round(v)), full: (v) => formatCurrencyFull(v) }
  }
  return { unit: '', label: (v) => formatNumber(Math.round(v * 10) / 10), full: (v) => formatNumber(Math.round(v * 10) / 10) }
}

function ChartView({ block }: { block: ChartBlock }) {
  const fmt = chartFormat(block)
  const name = block.valueLabel || 'ערך'
  const total = block.points.reduce((s, p) => s + p.value, 0)
  const pct = (v: number) => (total > 0 ? `${Math.round((v / total) * 100)}%` : '')
  const tooltipStyle = {
    direction: 'rtl' as const,
    borderRadius: 10,
    borderColor: '#e2e8f0',
    fontSize: 13,
    boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)',
  }
  const labelStyle = { fontSize: 10.5, fontWeight: 600, fill: '#475569' }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-bold text-slate-800">{block.title}</p>
        {fmt.unit && <span className="shrink-0 text-[11px] font-medium text-slate-400">{fmt.unit}</span>}
      </div>
      <ResponsiveContainer width="100%" height={block.chartType === 'pie' ? 300 : 280}>
        {block.chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={block.points}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={88}
              paddingAngle={2}
              label={({ value }: { value: number }) => pct(value)}
              labelLine={false}
              style={{ fontSize: 12, fontWeight: 700 }}
            >
              {block.points.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt.full(v)} (${pct(v)})`, name]} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string, entry) => {
                const v = (entry.payload as { value?: number } | undefined)?.value
                return v === undefined ? value : `${value} — ${fmt.label(v)} (${pct(v)})`
              }}
            />
          </PieChart>
        ) : block.chartType === 'line' ? (
          <LineChart data={block.points} margin={{ top: 22, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48} tickFormatter={fmt.label} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmt.full(v), name]} />
            <Line type="monotone" dataKey="value" stroke={PALETTE[0]} strokeWidth={2.5} dot={{ r: 3.5, fill: PALETTE[0] }}>
              <LabelList dataKey="value" position="top" offset={8} formatter={fmt.label} style={labelStyle} />
            </Line>
          </LineChart>
        ) : (
          <BarChart data={block.points} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              interval={0}
              tickFormatter={(l: string) => (l.length > 12 ? `${l.slice(0, 11)}…` : l)}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={48} tickFormatter={fmt.label} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} formatter={(v: number) => [fmt.full(v), name]} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={44}>
              {block.points.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
              <LabelList dataKey="value" position="top" formatter={fmt.label} style={labelStyle} />
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function TableView({ block }: { block: TableBlock }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-l from-[#3f5fc4] to-[#3d8f8c] px-3 py-2">
        <p className="text-[13px] font-bold text-white">{block.title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-[12.5px]">
          <thead>
            <tr className="bg-slate-50">
              {block.columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 font-semibold text-slate-600">
                  {COLUMN_LABELS[c] ?? c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className={i % 2 ? 'bg-slate-50/60' : 'bg-white'}>
                {block.columns.map((c) => {
                  const v = row[c]
                  const badge = typeof v === 'string' ? STATUS_BADGES[v] : undefined
                  return (
                    <td key={c} className="whitespace-nowrap px-3 py-2 text-slate-700">
                      {badge ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>
                      ) : (
                        formatCell(c, v)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.totalMatching > block.rows.length && (
        <p className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-400">
          מוצגות {block.rows.length} מתוך {formatNumber(block.totalMatching)} שורות
        </p>
      )}
    </div>
  )
}

export function ChatBlocks({ blocks }: { blocks: ChatBlock[] }) {
  return (
    <div className="mt-2 space-y-3">
      {blocks.map((b, i) => (b.type === 'chart' ? <ChartView key={i} block={b} /> : <TableView key={i} block={b} />))}
    </div>
  )
}
