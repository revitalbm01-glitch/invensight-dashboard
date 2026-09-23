import { useState } from 'react'
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          {byWarehouse ? 'הצג סה"כ' : 'פילוח לפי מחסן'}
        </button>
      }
    >
      <ResponsiveContainer width="100%" height={310}>
        {byWarehouse ? (
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
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
              contentStyle={{ direction: 'rtl', borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, direction: 'rtl' }} />
            {warehouses.map((w, i) => (
              <Line
                key={w}
                type="monotone"
                dataKey={w}
                name={w}
                stroke={WAREHOUSE_COLORS[i % WAREHOUSE_COLORS.length]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="totalStockValueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
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
              contentStyle={{ direction: 'rtl', borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)' }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="שווי מלאי כולל"
              stroke="#1d4ed8"
              strokeWidth={3}
              fill="url(#totalStockValueFill)"
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </ChartCard>
  )
}
