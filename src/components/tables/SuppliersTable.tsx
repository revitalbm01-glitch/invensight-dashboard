import type { Supplier } from '../../types'
import { DataTable, type DataTableColumn } from './DataTable'
import { Badge, type BadgeTone } from '../common/Badge'
import { formatCurrencyFull, formatNumber, formatPercent, supplierRatingLabel } from '../../logic/formatters'

const RATING_TONE: Record<Supplier['rating'], BadgeTone> = {
  excellent: 'good',
  good: 'info',
  warning: 'warn',
  critical: 'bad',
}

export function SuppliersTable({ suppliers, onRowClick }: { suppliers: Supplier[]; onRowClick?: (s: Supplier) => void }) {
  const columns: DataTableColumn<Supplier>[] = [
    { key: 'name', header: 'שם ספק', render: (s) => <span className="font-medium text-slate-800">{s.name}</span> },
    { key: 'orderCount', header: 'מספר הזמנות', align: 'left', render: (s) => formatNumber(s.orderCount) },
    { key: 'orderValue', header: 'שווי הזמנות', align: 'left', render: (s) => <span className="font-semibold">{formatCurrencyFull(s.orderValue)}</span> },
    { key: 'leadTime', header: 'Lead Time ממוצע', align: 'left', render: (s) => `${s.avgLeadTimeDays} ימים` },
    {
      key: 'otif',
      header: 'OTIF',
      align: 'left',
      render: (s) => (
        <span className={s.otifPercent < 90 ? 'font-semibold text-status-bad' : 'font-semibold text-status-good'}>
          {formatPercent(s.otifPercent)}
        </span>
      ),
    },
    {
      key: 'lateOrders',
      header: 'הזמנות באיחור',
      align: 'left',
      render: (s) => (s.lateOrderCount > 0 ? <span className="font-semibold text-status-bad">{s.lateOrderCount}</span> : '0'),
    },
    { key: 'rating', header: 'דירוג', render: (s) => <Badge tone={RATING_TONE[s.rating]}>{supplierRatingLabel(s.rating)}</Badge> },
  ]

  return (
    <DataTable
      columns={columns}
      rows={suppliers}
      rowKey={(s) => s.id}
      onRowClick={onRowClick}
      emptyTitle="אין ספקים להצגה"
      emptySubtitle="נסו לשנות את הפילטרים הפעילים"
    />
  )
}
