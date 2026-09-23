import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

function IconHome() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5L12 5l8 6.5M6 10v9h5v-5h2v5h5v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M4 7.5l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 7.5v9l8 4 8-4v-9M12 11.5V20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="7.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 18.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'דשבורד ראשי', icon: <IconHome /> },
  { to: '/inventory', label: 'ניתוח מלאי', icon: <IconBox /> },
  { to: '/logistics', label: 'לוגיסטיקה ורכש', icon: <IconTruck /> },
  { to: '/alerts', label: 'התראות ניהוליות', icon: <IconBell /> },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col bg-sidebar-gradient shadow-nav transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-900/40">
            <svg width="21" height="21" viewBox="0 0 32 32" fill="none">
              <path d="M8 22V13l8-4.5 8 4.5v9l-8 4.5-8-4.5Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 13l8 4.5 8-4.5M16 17.5V26" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold leading-tight text-white">InvenSight</p>
            <p className="truncate text-[11px] font-medium leading-tight text-slate-400">BI · מלאי ולוגיסטיקה</p>
          </div>
        </div>

        <div className="mx-5 mb-2 h-px bg-white/[0.06]" />

        <nav className="flex-1 space-y-0.5 px-3 py-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">ניווט</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
                  isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-y-1 right-0 w-[3px] rounded-full bg-brand-400 transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <span className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}>{item.icon}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-5 mb-3 h-px bg-white/[0.06]" />

        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-good opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-good" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-300">נתוני דמה פעילים</p>
              <p className="truncate text-[10px] text-slate-500">עדכון אחרון: היום</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
