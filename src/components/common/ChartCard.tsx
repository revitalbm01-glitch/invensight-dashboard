import type { ReactNode } from 'react'
import { Tooltip as InfoTooltip } from './Tooltip'

export function ChartCard({
  title,
  subtitle,
  tooltip,
  action,
  accent,
  children,
}: {
  title: string
  subtitle?: string
  tooltip?: string
  action?: ReactNode
  accent?: 'good' | 'warn' | 'bad'
  children: ReactNode
}) {
  const accentClass = accent === 'bad' ? 'bg-status-bad' : accent === 'warn' ? 'bg-status-warn' : accent === 'good' ? 'bg-status-good' : 'bg-slate-200'

  return (
    <div className="card card-hover overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className={`mt-1.5 h-5 w-1 shrink-0 rounded-full ${accentClass}`} />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="section-title">{title}</h3>
              {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
