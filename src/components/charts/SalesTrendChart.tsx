import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SalesTrendPoint } from '../../types'
import { ChartCard } from '../common/ChartCard'
import { formatCurrency, formatCurrencyFull } from '../../logic/formatters'

export function SalesTrendChart({ data }: { data: SalesTrendPoint[] }) {
  return (
    <ChartCard
      title="מגמת מכירות לאורך זמן"
      subtitle="12 חודשים אחרונים"
      tooltip="סך ההכנסות ממכירות בכל חודש, בהתאם לפילטרים הפעילים."
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => formatCurrency(v)}
          />
          <Tooltip
            contentStyle={{ direction: 'rtl', borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)' }}
            cursor={{ fill: '#f8fafc' }}
            formatter={(value: number) => [formatCurrencyFull(value), 'הכנסות']}
          />
          <Bar dataKey="revenue" name="הכנסות" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
