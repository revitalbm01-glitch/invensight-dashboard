export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-slate-300">
        <path
          d="M4 7l8-4 8 4M4 7v10l8 4m-8-14l8 4m0 0l8-4m-8 4v10m8-14v10l-8 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="font-semibold text-slate-500">{title}</p>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}
