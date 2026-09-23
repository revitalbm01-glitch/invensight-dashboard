import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import type { Supplier } from '../../types'
import { ChartCard } from '../common/ChartCard'

type Metric = 'leadTime' | 'otif'

const METRIC_CONFIG: Record<Metric, { title: string; tooltip: string; unit: string; threshold: number; higherIsBetter: boolean }> = {
  leadTime: {
    title: 'זמן אספקה ממוצע לפי ספק',
    tooltip: 'ממוצע ימים בין תאריך ההזמנה לתאריך האספקה, לכל ספק. יעד: עד 14 ימים.',
    unit: ' ימים',
    threshold: 14,
    higherIsBetter: false,
  },
  otif: {
    title: 'OTIF לפי ספק',
    tooltip: 'אחוז ההזמנות שהתקבלו בזמן ובכמות המלאה, לכל ספק. יעד: 95% ומעלה.',
    unit: '%',
    threshold: 95,
    higherIsBetter: true,
  },
}

export function SupplierPerformanceChart({ suppliers, metric }: { suppliers: Supplier[]; metric: Metric }) {
  const config = METRIC_CONFIG[metric]

  const data = useMemo(() => {
    return [...suppliers]
      .filter((s) => s.orderCount > 0)
      .map((s) => ({ name: s.name, value: metric === 'leadTime' ? s.avgLeadTimeDays : s.otifPercent }))
      .sort((a, b) => (config.higherIsBetter ? a.value - b.value : b.value - a.value))
      .slice(0, 12)
  }, [suppliers, metric, config.higherIsBetter])

  function colorFor(value: number): string {
    const breached = config.higherIsBetter ? value < config.threshold : value > config.threshold
    return breached ? '#dc2626' : '#2563eb'
  }

  return (
    <ChartCard title={config.title} tooltip={config.tooltip}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit={config.unit} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={150} />
          <Tooltip
            formatter={(value) => `${value}${config.unit}`}
            contentStyle={{ direction: 'rtl', borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <ReferenceLine x={config.threshold} stroke="#d97706" strokeDasharray="4 4" />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={colorFor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
