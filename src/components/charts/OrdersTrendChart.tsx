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
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip contentStyle={{ direction: 'rtl', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }} cursor={{ fill: '#f1f5f9' }} />
          <Legend wrapperStyle={{ fontSize: 12, direction: 'rtl' }} />
          <Bar dataKey="opened" name="הזמנות שנפתחו" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="received" name="הזמנות שהתקבלו" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
