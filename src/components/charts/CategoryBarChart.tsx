import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { InventoryItem } from '../../types'
import { formatCurrency, formatCurrencyFull } from '../../logic/formatters'
import { ChartCard } from '../common/ChartCard'

const PALETTE = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#0ea5e9', '#0d9488']

export function CategoryBarChart({
  items,
  groupBy,
  title,
  subtitle,
  onBarClick,
}: {
  items: InventoryItem[]
  groupBy: 'category' | 'warehouse'
  title: string
  subtitle?: string
  onBarClick?: (value: string) => void
}) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) {
      const key = groupBy === 'category' ? item.category : item.warehouse
      map.set(key, (map.get(key) ?? 0) + item.stockValue)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [items, groupBy])

  return (
    <ChartCard title={title} subtitle={subtitle} tooltip="שווי מלאי מצטבר (מלאי נוכחי × עלות יחידה) לכל קבוצה.">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#334155' }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            formatter={(value) => formatCurrencyFull(Number(value))}
            contentStyle={{ direction: 'rtl', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            barSize={22}
            onClick={(d: any) => onBarClick?.(d?.name)}
            cursor={onBarClick ? 'pointer' : 'default'}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
