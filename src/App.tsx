import { HashRouter, Routes, Route } from 'react-router-dom'
import { FilterProvider } from './context/FilterContext'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import InventoryAnalysis from './pages/InventoryAnalysis'
import Logistics from './pages/Logistics'
import ManagementAlerts from './pages/ManagementAlerts'

export default function App() {
  return (
    <HashRouter>
      <FilterProvider>
        <Routes>
          <Route path="/" element={<ExecutiveDashboard />} />
          <Route path="/inventory" element={<InventoryAnalysis />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/alerts" element={<ManagementAlerts />} />
        </Routes>
      </FilterProvider>
    </HashRouter>
  )
}
