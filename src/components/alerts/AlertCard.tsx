import { useNavigate } from 'react-router-dom'
import type { ManagementAlert } from '../../types'
import { SeverityDot } from '../common/SeverityIndicator'
import { formatDate } from '../../logic/formatters'

const SEVERITY_BORDER: Record<ManagementAlert['severity'], string> = {
  critical: 'border-r-4 border-r-status-bad',
  warning: 'border-r-4 border-r-status-warn',
  good: 'border-r-4 border-r-status-good',
  info: 'border-r-4 border-r-status-info',
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

  return (
    <button
      type="button"
      onClick={() => navigate(alert.linkTo)}
      className={`card card-hover flex w-full items-start gap-3 p-4 text-right ${SEVERITY_BORDER[alert.severity]}`}
    >
      <div className="mt-1">
        <SeverityDot severity={alert.severity} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-slate-800">{alert.title}</p>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{TYPE_LABELS[alert.type]}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{alert.description}</p>
        <p className="mt-1.5 text-xs text-slate-400">{formatDate(alert.timestamp)}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-1 shrink-0 text-slate-300">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
