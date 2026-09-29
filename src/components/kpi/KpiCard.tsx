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

function IconWallet() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M3 7.5a2 2 0 012-2h13a1.5 1.5 0 011.5 1.5V9M3 7.5V18a2 2 0 002 2h14a2 2 0 002-2v-7.5a1.5 1.5 0 00-1.5-1.5H16a2.5 2.5 0 000 5h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconLayers() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5M3 8l9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconAlertTriangle() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 4.5L21 19H3L12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4.5M12 17h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconPackageX() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 7.5l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 7.5v9l8 4 8-4v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 13.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconArchive() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4.5 8.5V18a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V8.5M10 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconClock() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0113.66-5.66M20 12a8 8 0 01-13.66 5.66" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.5 3.5v3.5H14M6.5 20.5V17H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4.5" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4V3.5a1 1 0 011-1h4a1 1 0 011 1V4M8.5 10.5h7M8.5 14h7M8.5 17.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconAlarmClock() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 9.5V13l2.3 1.6M4.5 5L3 6.5M19.5 5L21 6.5M9.5 3h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="7.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function IconPackageCheck() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 7.5l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 7.5v9l8 4 8-4v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 13.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ICONS: Record<string, () => JSX.Element> = {
  totalStockValue: IconWallet,
  itemCount: IconLayers,
  belowReorder: IconAlertTriangle,
  outOfStock: IconPackageX,
  excessStock: IconArchive,
  avgDaysOfInventory: IconClock,
  inventoryTurnover: IconRefresh,
  openOrders: IconClipboard,
  lateOrders: IconAlarmClock,
  otif: IconTarget,
  avgLeadTime: IconTruck,
  received: IconPackageCheck,
}

// Decorative rotation for non-breached, non-featured cards. `danger` is
// reserved exclusively for breached KPIs and is never part of the rotation.
const PALETTE_CLASSES = ['bg-kpi-teal', 'bg-kpi-orange', 'bg-kpi-purple', 'bg-kpi-blue'] as const

export function KpiCard({
  kpi,
  onClick,
  featured = false,
  colorIndex = 0,
}: {
  kpi: KpiValue
  onClick?: () => void
  featured?: boolean
  colorIndex?: number
}) {
  const good = isGoodDelta(kpi)
  const Icon = ICONS[kpi.id] ?? IconChart
  const gradientClass = kpi.isBreached ? 'bg-kpi-danger' : featured ? 'bg-kpi-teal' : PALETTE_CLASSES[colorIndex % PALETTE_CLASSES.length]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col justify-between gap-3 overflow-hidden rounded-2xl ${gradientClass} text-right text-white shadow-elevated transition-transform hover:-translate-y-0.5 ${
        featured ? 'gap-4 p-5 sm:col-span-2' : 'p-4'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
          <Icon />
        </div>
        <div className="flex items-center gap-1.5">
          {kpi.isBreached && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
          )}
          <Tooltip text={kpi.tooltip} tone="light" />
        </div>
      </div>

      <div>
        <p className="text-[11.5px] font-semibold leading-tight text-white/75">{kpi.label}</p>
        <div
          className={`mt-1 font-extrabold leading-none tracking-tight text-white tabular-nums ${
            featured ? 'text-[32px]' : 'text-[22px]'
          }`}
        >
          {formatValue(kpi)}
        </div>
      </div>

      {kpi.deltaPercent !== null ? (
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
              good === null ? 'bg-white/25 text-white' : good ? 'bg-white/90 text-status-good' : 'bg-white/90 text-status-bad'
            }`}
          >
            {kpi.deltaPercent > 0 ? '↑' : kpi.deltaPercent < 0 ? '↓' : '—'} {formatDelta(kpi.deltaPercent)}
          </span>
          <span className="truncate text-[10.5px] text-white/65">לעומת תקופה קודמת</span>
        </div>
      ) : (
        <div className="h-[17px]" />
      )}
    </button>
  )
}
