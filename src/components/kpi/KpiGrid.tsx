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
  let rotationIndex = 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const isFeatured = kpi.id === featuredId
        const colorIndex = isFeatured ? 0 : rotationIndex++

        return (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            featured={isFeatured}
            colorIndex={colorIndex}
            onClick={onKpiClick ? () => onKpiClick(kpi) : undefined}
          />
        )
      })}
    </div>
  )
}
