import type { InventoryItem, AbcClass } from '../../types'
import { DataTable, type DataTableColumn } from './DataTable'
import { Badge } from '../common/Badge'
import { formatCurrencyFull, formatNumber, stockStatusLabel } from '../../logic/formatters'

const STATUS_TONE: Record<InventoryItem['stockStatus'], 'good' | 'warn' | 'bad' | 'neutral'> = {
  NORMAL: 'good',
  BELOW_REORDER: 'warn',
  OUT_OF_STOCK: 'bad',
  EXCESS: 'warn',
}

const ABC_TONE: Record<AbcClass, 'info' | 'neutral'> = { A: 'info', B: 'neutral', C: 'neutral' }

export function itemBaseColumns(): DataTableColumn<InventoryItem>[] {
  return [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-mono text-xs text-slate-500">{r.sku}</span> },
    { key: 'name', header: 'שם פריט', render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'category', header: 'קטגוריה', render: (r) => r.category },
    { key: 'warehouse', header: 'מחסן', render: (r) => r.warehouse },
    {
      key: 'abc',
      header: 'ABC',
      align: 'center',
      render: (r) => <Badge tone={ABC_TONE[r.abcClass]}>{r.abcClass}</Badge>,
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (r) => <Badge tone={STATUS_TONE[r.stockStatus]}>{stockStatusLabel(r.stockStatus)}</Badge>,
    },
    { key: 'stock', header: 'מלאי נוכחי', align: 'left', render: (r) => formatNumber(r.currentStock) },
    { key: 'value', header: 'שווי מלאי', align: 'left', render: (r) => <span className="font-semibold">{formatCurrencyFull(r.stockValue)}</span> },
  ]
}

export function ItemsTable<T extends InventoryItem>({
  items,
  extraColumns,
  onRowClick,
  emptyTitle,
  emptySubtitle,
}: {
  items: T[]
  extraColumns?: DataTableColumn<T>[]
  onRowClick?: (item: T) => void
  emptyTitle?: string
  emptySubtitle?: string
}) {
  const columns: DataTableColumn<T>[] = [...itemBaseColumns(), ...(extraColumns ?? [])]

  return (
    <DataTable
      columns={columns}
      rows={items}
      rowKey={(r) => r.sku}
      onRowClick={onRowClick}
      emptyTitle={emptyTitle}
      emptySubtitle={emptySubtitle}
    />
  )
}
