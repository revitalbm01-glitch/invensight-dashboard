import { useMemo, useState } from 'react'
import type { ManagementAlert, Severity } from '../../types'
import { AlertCard } from './AlertCard'
import { EmptyState } from '../common/EmptyState'

const SEVERITY_TABS: { value: Severity | 'all'; label: string; dotClass: string }[] = [
  { value: 'all', label: 'הכל', dotClass: 'bg-slate-400' },
  { value: 'critical', label: 'קריטי', dotClass: 'bg-status-bad' },
  { value: 'warning', label: 'אזהרה', dotClass: 'bg-status-warn' },
  { value: 'good', label: 'תקין', dotClass: 'bg-status-good' },
]

export function AlertsPanel({ alerts }: { alerts: ManagementAlert[] }) {
  const [activeSeverity, setActiveSeverity] = useState<Severity | 'all'>('all')

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: alerts.length, critical: 0, warning: 0, good: 0, info: 0 }
    for (const a of alerts) map[a.severity] = (map[a.severity] ?? 0) + 1
    return map
  }, [alerts])

  const filtered = activeSeverity === 'all' ? alerts : alerts.filter((a) => a.severity === activeSeverity)

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SEVERITY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveSeverity(tab.value)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeSeverity === tab.value
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${tab.dotClass}`} />
            {tab.label}
            <span className="text-xs text-slate-400">({counts[tab.value] ?? 0})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="אין התראות בקטגוריה זו" subtitle="כל הפריטים בתחום זה תקינים" />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}
