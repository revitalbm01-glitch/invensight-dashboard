import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { MockDataset } from '../types'
import { fetchAirtableDataset } from '../data/airtableDataset'

interface DataContextValue {
  dataset: MockDataset | null
  loading: boolean
  error: string | null
  reload: () => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<MockDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchAirtableDataset()
      .then((data) => {
        if (!cancelled) setDataset(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return <DataContext.Provider value={{ dataset, loading, error, reload }}>{children}</DataContext.Provider>
}

function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataset/useDataStatus must be used within a DataProvider')
  return ctx
}

export function useDataset(): MockDataset {
  const { dataset } = useDataContext()
  if (!dataset) throw new Error('useDataset נקרא לפני שהנתונים מ-Airtable נטענו')
  return dataset
}

export function useDataStatus(): DataContextValue {
  return useDataContext()
}
