import { useMemo } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { AlertsPanel } from '../components/alerts/AlertsPanel'
import { useAlerts } from '../hooks/useAlerts'

export default function ManagementAlerts() {
  const alerts = useAlerts()

  const summary = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === 'critical').length
    const warning = alerts.filter((a) => a.severity === 'warning').length
    const good = alerts.filter((a) => a.severity === 'good').length
    return { critical, warning, good }
  }, [alerts])

  return (
    <PageLayout
      title="התראות ניהוליות"
      subtitle={`${alerts.length} התראות פעילות — ${summary.critical} קריטיות, ${summary.warning} אזהרות, ${summary.good} ביצועים תקינים`}
    >
      <AlertsPanel alerts={alerts} />
    </PageLayout>
  )
}
