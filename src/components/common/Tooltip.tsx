import { useState } from 'react'

export function Tooltip({ text, tone = 'default' }: { text: string; tone?: 'default' | 'light' }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <span
        role="button"
        tabIndex={0}
        aria-label="הסבר"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            setOpen((v) => !v)
          }
        }}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border text-[10px] font-bold ${
          tone === 'light'
            ? 'border-white/40 text-white/70 hover:border-white hover:text-white'
            : 'border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500'
        }`}
      >
        i
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full right-1/2 z-20 mb-2 w-56 translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-right text-xs leading-relaxed text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  )
}
