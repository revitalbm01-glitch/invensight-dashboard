import { useNavigate } from 'react-router-dom'
import type { ManagementAlert, Severity } from '../../types'
import { formatDate } from '../../logic/formatters'

const SEVERITY_ACCENT: Record<Severity, string> = {
  critical: 'bg-status-bad',
  warning: 'bg-status-warn',
  good: 'bg-status-good',
  info: 'bg-status-info',
}

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: 'bg-status-badBg text-status-bad',
  warning: 'bg-status-warnBg text-status-warn',
  good: 'bg-status-goodBg text-status-good',
  info: 'bg-status-infoBg text-status-info',
}

function IconAlert() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 4.5L21 19H3L12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4.5M12 17h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 12.5l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SEVERITY_ICON: Record<Severity, () => JSX.Element> = {
  critical: IconAlert,
  warning: IconAlert,
  good: IconCheck,
  info: IconCheck,
}

const TYPE_LABELS: Record<ManagementAlert['type'], string> = {
  BELOW_REORDER: 'נקודת הזמנה',
  OUT_OF_STOCK: 'מלאי אפס',
  LATE_ORDER: 'איחור באספקה',
  EXCESS_STOCK: 'מלאי עודף',
  NO_MOVEMENT: 'ללא תנועה',
  HIGH_LEAD_TIME: 'Lead Time גבוה',
  SUPPLIER_OK: 'ביצועים תקינים',
}

export function AlertCard({ alert }: { alert: ManagementAlert }) {
  const navigate = useNavigate()
  const Icon = SEVERITY_ICON[alert.severity]

  return (
    <button
      type="button"
      onClick={() => navigate(alert.linkTo)}
      className="card card-hover group relative flex w-full items-start gap-3.5 overflow-hidden p-4 text-right"
    >
      <span className={`absolute inset-y-0 right-0 w-[3px] ${SEVERITY_ACCENT[alert.severity]}`} />

      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${SEVERITY_BADGE[alert.severity]}`}>
        <Icon />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13.5px] font-bold text-slate-800">{alert.title}</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-500">{TYPE_LABELS[alert.type]}</span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{alert.description}</p>
        <p className="mt-1.5 text-[11px] text-slate-400">{formatDate(alert.timestamp)}</p>
      </div>

      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        className="mt-1.5 shrink-0 text-slate-300 transition-transform group-hover:-translate-x-0.5"
      >
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
