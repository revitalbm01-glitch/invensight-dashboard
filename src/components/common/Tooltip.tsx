import { useState } from 'react'

export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="הסבר"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400 hover:border-brand-400 hover:text-brand-500"
      >
        i
      </button>
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
