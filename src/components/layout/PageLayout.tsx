import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopFilterBar } from './TopFilterBar'
import { useDataStatus } from '../../context/DataContext'

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
  const { loading, reload } = useDataStatus()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopFilterBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-slate-50 px-4 py-4 lg:px-7 lg:py-5">
          <div className="mx-auto max-w-[1760px]">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div>
                <p className="eyebrow mb-1">{eyebrow}</p>
                <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">{title}</h1>
                {subtitle && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-500">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-good opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-good" />
                  </span>
                  <span className="text-xs font-semibold text-slate-500">עדכני ל-{TODAY_LABEL}</span>
                </div>
                <button
                  type="button"
                  onClick={reload}
                  disabled={loading}
                  title="רענון נתונים מ-Airtable"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={loading ? 'animate-spin' : ''}
                  >
                    <path
                      d="M4 4v6h6M20 20v-6h-6M5.5 9a7 7 0 0 1 12.3-3M18.5 15a7 7 0 0 1-12.3 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
