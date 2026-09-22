import React from 'react'
import { Tooltip as InfoTooltip } from './Tooltip'

export function ChartCard({
  title,
  subtitle,
  tooltip,
  action,
  children,
}: {
  title: string
  subtitle?: string
  tooltip?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="section-title">{title}</h3>
            {tooltip && <InfoTooltip text={tooltip} />}
          </div>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
