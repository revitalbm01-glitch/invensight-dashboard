import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopFilterBar } from './TopFilterBar'

const TODAY_LABEL = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function PageLayout({
  eyebrow = 'InvenSight BI',
  title,
  subtitle,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopFilterBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-[radial-gradient(120%_110px_at_50%_0%,rgba(37,99,235,0.06),transparent)] px-4 py-4 lg:px-7 lg:py-5">
          <div className="mx-auto max-w-[1760px]">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div>
                <p className="eyebrow mb-1">{eyebrow}</p>
                <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">{title}</h1>
                {subtitle && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-500">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-good opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-good" />
                </span>
                <span className="text-xs font-semibold text-slate-500">עדכני ל-{TODAY_LABEL}</span>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
