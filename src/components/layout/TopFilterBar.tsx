import { useFilters } from '../../context/FilterContext'
import { mockDataset } from '../../data/mockData'
import { MultiSelect } from '../common/MultiSelect'
import { stockStatusLabel } from '../../logic/formatters'
import type { StockStatus, AbcClass } from '../../types'

const STOCK_STATUS_OPTIONS: StockStatus[] = ['OUT_OF_STOCK', 'BELOW_REORDER', 'EXCESS', 'NORMAL']
const ABC_OPTIONS: AbcClass[] = ['A', 'B', 'C']

export function TopFilterBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { filters, updateFilter, resetFilters, isActive } = useFilters()

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 lg:hidden"
          aria-label="פתח ניווט"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative">
          <input
            type="text"
            value={filters.skuSearch}
            onChange={(e) => updateFilter('skuSearch', e.target.value)}
            placeholder="חיפוש לפי SKU או שם פריט..."
            className="w-52 rounded-lg border border-slate-200 py-2 pr-8 pl-3 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <MultiSelect
          label="מחסן"
          options={mockDataset.warehouses.map((w) => ({ value: w, label: w }))}
          selected={filters.warehouses}
          onChange={(v) => updateFilter('warehouses', v)}
        />
        <MultiSelect
          label="קטגוריה"
          options={mockDataset.categories.map((c) => ({ value: c, label: c }))}
          selected={filters.categories}
          onChange={(v) => updateFilter('categories', v)}
        />
        <MultiSelect
          label="ספק"
          options={mockDataset.suppliers.map((s) => ({ value: s.id, label: s.name }))}
          selected={filters.suppliers}
          onChange={(v) => updateFilter('suppliers', v)}
          width="w-48"
        />
        <MultiSelect
          label="סטטוס מלאי"
          options={STOCK_STATUS_OPTIONS.map((s) => ({ value: s, label: stockStatusLabel(s) }))}
          selected={filters.stockStatuses}
          onChange={(v) => updateFilter('stockStatuses', v as StockStatus[])}
          width="w-40"
        />
        <MultiSelect
          label="ABC"
          options={ABC_OPTIONS.map((a) => ({ value: a, label: `קטגוריה ${a}` }))}
          selected={filters.abcClasses}
          onChange={(v) => updateFilter('abcClasses', v as AbcClass[])}
          width="w-32"
        />

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.dateRange.from ?? ''}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value || null })}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
          <span className="text-xs text-slate-400">עד</span>
          <input
            type="date"
            value={filters.dateRange.to ?? ''}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value || null })}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </div>

        {isActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            איפוס פילטרים
          </button>
        )}
      </div>
    </div>
  )
}
