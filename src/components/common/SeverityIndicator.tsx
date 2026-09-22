import type { Severity } from '../../types'

const DOT_CLASSES: Record<Severity, string> = {
  critical: 'bg-status-bad',
  warning: 'bg-status-warn',
  good: 'bg-status-good',
  info: 'bg-status-info',
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${DOT_CLASSES[severity]}`} />
}
