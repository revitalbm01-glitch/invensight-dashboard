import { useMemo } from 'react'
import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { InventoryItem } from '../../types'
import { formatCurrency, formatCurrencyFull } from '../../logic/formatters'
import { ChartCard } from '../common/ChartCard'

const PALETTE = ['#3d8f8c', '#c9791f', '#7d3f9e', '#3f5fc4', '#c23f6b', '#64748b']

export function CategoryDonutChart({
  items,
  groupBy,
  title,
  subtitle,
  onSliceClick,
}: {
  items: InventoryItem[]
  groupBy: 'category' | 'warehouse'
  title: string
  subtitle?: string
  onSliceClick?: (value: string) => void
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

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ChartCard title={title} subtitle={subtitle} tooltip="שווי מלאי מצטבר (מלאי נוכחי × עלות יחידה) לכל קבוצה — לחצו על פרוסה לסינון.">
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Tooltip
              formatter={(value) => formatCurrencyFull(Number(value))}
              contentStyle={{ direction: 'rtl', borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, boxShadow: '0 8px 24px -6px rgba(15,23,42,0.15)' }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              onClick={onSliceClick ? (d: any) => onSliceClick(d?.name) : undefined}
              cursor={onSliceClick ? 'pointer' : 'default'}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-400">סה"כ</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((entry, i) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {entry.name}
          </span>
        ))}
      </div>
    </ChartCard>
  )
}
