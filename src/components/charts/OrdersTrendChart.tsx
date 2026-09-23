import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { OrdersTrendPoint } from '../../types'
import { ChartCard } from '../common/ChartCard'

export function OrdersTrendChart({ data }: { data: OrdersTrendPoint[] }) {
  return (
    <ChartCard
      title="מגמת הזמנות רכש לאורך זמן"
      subtitle="12 חודשים אחרונים"
      tooltip="מספר ההזמנות שנפתחו מול מספר ההזמנות שהתקבלו בפועל, לכל חודש."
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{ direction: 'rtl', borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, direction: 'rtl' }} />
          <Bar dataKey="opened" name="הזמנות שנפתחו" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="received" name="הזמנות שהתקבלו" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
