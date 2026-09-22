import type { PurchaseOrder, Supplier } from '../../types'
import { DataTable, type DataTableColumn } from './DataTable'
import { Badge, type BadgeTone } from '../common/Badge'
import { formatCurrencyFull, formatDate, formatNumber, poStatusLabel } from '../../logic/formatters'

const STATUS_TONE: Record<PurchaseOrder['status'], BadgeTone> = {
  OPEN: 'info',
  IN_TRANSIT: 'info',
  RECEIVED: 'good',
  LATE: 'bad',
  CANCELLED: 'neutral',
}

export function PurchaseOrdersTable({
  orders,
  suppliers,
  onRowClick,
}: {
  orders: PurchaseOrder[]
  suppliers: Supplier[]
  onRowClick?: (po: PurchaseOrder) => void
}) {
  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id

  const columns: DataTableColumn<PurchaseOrder>[] = [
    { key: 'po', header: 'מספר הזמנה', render: (o) => <span className="font-mono text-xs text-slate-500">{o.poNumber}</span> },
    { key: 'item', header: 'פריט', render: (o) => <span className="font-medium text-slate-800">{o.itemName}</span> },
    { key: 'supplier', header: 'ספק', render: (o) => supplierName(o.supplierId) },
    { key: 'warehouse', header: 'מחסן יעד', render: (o) => o.warehouse },
    { key: 'qty', header: 'כמות', align: 'left', render: (o) => formatNumber(o.orderedQty) },
    { key: 'value', header: 'שווי הזמנה', align: 'left', render: (o) => <span className="font-semibold">{formatCurrencyFull(o.orderValue)}</span> },
    { key: 'orderDate', header: 'תאריך הזמנה', align: 'left', render: (o) => formatDate(o.orderDate) },
    { key: 'planned', header: 'אספקה מתוכננת', align: 'left', render: (o) => formatDate(o.plannedDeliveryDate) },
    {
      key: 'actual',
      header: 'אספקה בפועל',
      align: 'left',
      render: (o) => (o.actualDeliveryDate ? formatDate(o.actualDeliveryDate) : '—'),
    },
    { key: 'status', header: 'סטטוס', render: (o) => <Badge tone={STATUS_TONE[o.status]}>{poStatusLabel(o.status)}</Badge> },
  ]

  return (
    <DataTable
      columns={columns}
      rows={orders}
      rowKey={(o) => o.poNumber}
      onRowClick={onRowClick}
      emptyTitle="אין הזמנות רכש להצגה"
      emptySubtitle="נסו לשנות את הפילטרים הפעילים"
    />
  )
}
