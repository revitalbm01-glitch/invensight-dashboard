export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 mt-1 flex items-center gap-2.5">
      <span className="h-4 w-[3px] rounded-full bg-brand-600" />
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {subtitle && <span className="text-[12px] text-slate-400">· {subtitle}</span>}
    </div>
  )
}
