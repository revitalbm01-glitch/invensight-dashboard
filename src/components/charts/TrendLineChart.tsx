import { useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { StockValuePoint } from '../../types'
import { formatCurrency, formatCurrencyFull } from '../../logic/formatters'
import { ChartCard } from '../common/ChartCard'

const WAREHOUSE_COLORS = ['#2563eb', '#0ea5e9', '#7c3aed', '#0d9488']

export function TrendLineChart({ data, warehouses }: { data: StockValuePoint[]; warehouses: string[] }) {
  const [byWarehouse, setByWarehouse] = useState(false)

  const chartData = data.map((p) => ({
    label: p.label,
    total: p.totalStockValue,
    ...Object.fromEntries(warehouses.map((w) => [w, p.byWarehouse[w] ?? 0])),
  }))

  return (
    <ChartCard
      title="מגמת שווי מלאי לאורך זמן"
      subtitle="12 חודשים אחרונים"
      tooltip="שווי המלאי הכולל (או לפי מחסן) בסוף כל חודש, ב-12 החודשים האחרונים."
      action={
        <button
          type="button"
          onClick={() => setByWarehouse((v) => !v)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {byWarehouse ? 'הצג סה"כ' : 'פילוח לפי מחסן'}
        </button>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(value) => formatCurrencyFull(Number(value))}
            contentStyle={{ direction: 'rtl', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }}
          />
          {byWarehouse ? (
            <>
              <Legend wrapperStyle={{ fontSize: 12, direction: 'rtl' }} />
              {warehouses.map((w, i) => (
                <Line
                  key={w}
                  type="monotone"
                  dataKey={w}
                  name={w}
                  stroke={WAREHOUSE_COLORS[i % WAREHOUSE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </>
          ) : (
            <Line type="monotone" dataKey="total" name="שווי מלאי כולל" stroke="#1d4ed8" strokeWidth={2.5} dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
