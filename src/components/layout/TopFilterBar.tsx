import { useFilters } from '../../context/FilterContext'
import { mockDataset } from '../../data/mockData'
import { MultiSelect } from '../common/MultiSelect'
import { stockStatusLabel } from '../../logic/formatters'
import type { StockStatus, AbcClass, GlobalFilters } from '../../types'

const STOCK_STATUS_OPTIONS: StockStatus[] = ['OUT_OF_STOCK', 'BELOW_REORDER', 'EXCESS', 'NORMAL']
const ABC_OPTIONS: AbcClass[] = ['A', 'B', 'C']

function activeFilterCount(filters: GlobalFilters): number {
  let count = 0
  if (filters.dateRange.from || filters.dateRange.to) count++
  if (filters.warehouses.length) count++
  if (filters.categories.length) count++
  if (filters.suppliers.length) count++
  if (filters.skuSearch.trim()) count++
  if (filters.stockStatuses.length) count++
  if (filters.abcClasses.length) count++
  return count
}

export function TopFilterBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { filters, updateFilter, resetFilters, isActive } = useFilters()
  const count = activeFilterCount(filters)

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 lg:px-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 lg:hidden"
          aria-label="פתח ניווט"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex shrink-0 items-center gap-1.5 pl-1 pr-0.5 text-slate-400">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden text-xs font-bold uppercase tracking-wide sm:inline">סינון</span>
          {count > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={filters.skuSearch}
            onChange={(e) => updateFilter('skuSearch', e.target.value)}
            placeholder="חיפוש לפי SKU או שם פריט..."
            className="w-52 rounded-lg border border-slate-200 bg-slate-50/70 py-2 pr-8 pl-3 text-sm placeholder:text-slate-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
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

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
          <input
            type="date"
            value={filters.dateRange.from ?? ''}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value || null })}
            className="w-[124px] border-0 bg-transparent text-sm text-slate-600 focus:outline-none"
          />
          <span className="text-xs text-slate-400">עד</span>
          <input
            type="date"
            value={filters.dateRange.to ?? ''}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value || null })}
            className="w-[124px] border-0 bg-transparent text-sm text-slate-600 focus:outline-none"
          />
        </div>

        {isActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
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
