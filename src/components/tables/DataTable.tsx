import React from 'react'
import { EmptyState } from '../common/EmptyState'

const ALIGN_CLASSES: Record<'right' | 'left' | 'center', string> = {
  right: 'text-right',
  left: 'text-left',
  center: 'text-center',
}

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  align?: 'right' | 'left' | 'center'
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptySubtitle?: string
  maxHeight?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyTitle = 'אין נתונים להצגה',
  emptySubtitle = 'נסו לשנות את הפילטרים הפעילים',
  maxHeight,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/70" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full min-w-[640px] text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`border-b border-slate-200/70 px-3.5 py-2.5 ${ALIGN_CLASSES[col.align ?? 'right']} whitespace-nowrap`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer transition-colors hover:bg-brand-50/40' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-3.5 py-2.5 ${ALIGN_CLASSES[col.align ?? 'right']} ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
