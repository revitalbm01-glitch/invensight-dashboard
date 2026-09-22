import type { KpiValue } from '../../types'
import { Tooltip } from '../common/Tooltip'
import { formatCurrency, formatDays, formatDelta, formatNumber, formatPercent } from '../../logic/formatters'

function formatValue(kpi: KpiValue): string {
  switch (kpi.format) {
    case 'currency':
      return formatCurrency(kpi.value)
    case 'percent':
      return formatPercent(kpi.value)
    case 'days':
      return formatDays(kpi.value)
    default:
      return formatNumber(Math.round(kpi.value))
  }
}

function isGoodDelta(kpi: KpiValue): boolean | null {
  if (kpi.deltaPercent === null || kpi.deltaPercent === 0) return null
  const rose = kpi.deltaPercent > 0
  return kpi.breachDirection === 'up-is-bad' ? !rose : rose
}

export function KpiCard({ kpi, onClick }: { kpi: KpiValue; onClick?: () => void }) {
  const good = isGoodDelta(kpi)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`card card-hover flex flex-col gap-2.5 p-4 text-right ${onClick ? 'cursor-pointer' : 'cursor-default'} ${
        kpi.isBreached ? 'ring-1 ring-inset ring-red-100' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
        <div className="flex items-center gap-1.5">
          {kpi.isBreached && <span className="h-2 w-2 rounded-full bg-status-bad" />}
          <Tooltip text={kpi.tooltip} />
        </div>
      </div>

      <div className="text-2xl font-extrabold tabular-nums text-slate-900">{formatValue(kpi)}</div>

      {kpi.deltaPercent !== null && (
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span
            className={
              good === null ? 'text-slate-400' : good ? 'text-status-good' : 'text-status-bad'
            }
          >
            {kpi.deltaPercent > 0 ? '↑' : kpi.deltaPercent < 0 ? '↓' : '—'} {formatDelta(kpi.deltaPercent)}
          </span>
          <span className="text-slate-400">לעומת תקופה קודמת</span>
        </div>
      )}
    </button>
  )
}
