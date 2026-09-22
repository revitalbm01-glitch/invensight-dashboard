import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import type { GlobalFilters } from '../types'
import { DEFAULT_FILTERS, isFiltersActive } from '../logic/filters'

interface FilterContextValue {
  filters: GlobalFilters
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>
  updateFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void
  resetFilters: () => void
  isActive: boolean
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS)

  const updateFilter = useCallback(<K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const value = useMemo(
    () => ({ filters, setFilters, updateFilter, resetFilters, isActive: isFiltersActive(filters) }),
    [filters, updateFilter, resetFilters],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider')
  return ctx
}
