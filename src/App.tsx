import { HashRouter, Routes, Route } from 'react-router-dom'
import { FilterProvider } from './context/FilterContext'
import { DataProvider, useDataStatus } from './context/DataContext'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import InventoryAnalysis from './pages/InventoryAnalysis'
import Logistics from './pages/Logistics'
import ManagementAlerts from './pages/ManagementAlerts'

function AppShell() {
  const { loading, error, reload } = useDataStatus()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        <p className="text-sm font-medium">טוען נתונים מ-Airtable...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          נסה שוב
        </button>
      </div>
    )
  }

  return (
    <FilterProvider>
      <Routes>
        <Route path="/" element={<ExecutiveDashboard />} />
        <Route path="/inventory" element={<InventoryAnalysis />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/alerts" element={<ManagementAlerts />} />
      </Routes>
    </FilterProvider>
  )
}

export default function App() {
  return (
    <HashRouter>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </HashRouter>
  )
}
