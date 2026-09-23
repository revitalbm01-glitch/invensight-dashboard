import type { KpiValue } from '../../types'
import { KpiCard } from './KpiCard'

export function KpiGrid({
  kpis,
  onKpiClick,
  featuredId,
}: {
  kpis: KpiValue[]
  onKpiClick?: (kpi: KpiValue) => void
  featuredId?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.id}
          kpi={kpi}
          featured={kpi.id === featuredId}
          onClick={onKpiClick ? () => onKpiClick(kpi) : undefined}
        />
      ))}
    </div>
  )
}
