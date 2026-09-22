import { useMemo } from 'react'
import { Bar, Line, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import type { InventoryItem } from '../../types'
import { buildParetoSeries } from '../../logic/abcAnalysis'
import { formatCurrency, formatCurrencyFull, formatPercent } from '../../logic/formatters'
import { ChartCard } from '../common/ChartCard'

const CLASS_COLORS: Record<'A' | 'B' | 'C', string> = { A: '#1d4ed8', B: '#60a5fa', C: '#cbd5e1' }

export function AbcParetoChart({ items }: { items: InventoryItem[] }) {
  const series = useMemo(() => buildParetoSeries(items).slice(0, 40), [items])

  return (
    <ChartCard
      title="ניתוח ABC — עקומת פארטו"
      subtitle="40 הפריטים המובילים לפי שווי מלאי, ותרומתם המצטברת"
      tooltip="פריטים ממוינים לפי שווי מלאי יורד. קטגוריה A = 80% הראשונים מהשווי המצטבר, B = עד 95%, C = היתרה."
    >
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={series} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="sku" tick={false} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis
            yAxisId="value"
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <YAxis
            yAxisId="percent"
            orientation="left"
            hide
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ direction: 'rtl', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }}
            formatter={(value, name) =>
              name === 'אחוז מצטבר' ? formatPercent(Number(value)) : formatCurrencyFull(Number(value))
            }
            labelFormatter={(_, payload: any) => (payload?.[0]?.payload ? `${payload[0].payload.sku}` : '')}
          />
          <ReferenceLine yAxisId="percent" y={80} stroke="#d97706" strokeDasharray="4 4" />
          <Bar yAxisId="value" dataKey="stockValue" name="שווי מלאי" barSize={10} radius={[3, 3, 0, 0]}>
            {series.map((entry) => (
              <Cell key={entry.sku} fill={CLASS_COLORS[entry.abcClass]} />
            ))}
          </Bar>
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="cumulativePercent"
            name="אחוז מצטבר"
            stroke="#0f172a"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CLASS_COLORS.A }} />קטגוריה A</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CLASS_COLORS.B }} />קטגוריה B</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CLASS_COLORS.C }} />קטגוריה C</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-amber-600" />סף 80%</span>
      </div>
    </ChartCard>
  )
}
