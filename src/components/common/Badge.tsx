import React from 'react'

export type BadgeTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral'

const TONE_CLASSES: Record<BadgeTone, string> = {
  good: 'bg-status-goodBg text-status-good ring-1 ring-inset ring-green-200',
  warn: 'bg-status-warnBg text-status-warn ring-1 ring-inset ring-amber-200',
  bad: 'bg-status-badBg text-status-bad ring-1 ring-inset ring-red-200',
  info: 'bg-status-infoBg text-status-info ring-1 ring-inset ring-blue-200',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  )
}
