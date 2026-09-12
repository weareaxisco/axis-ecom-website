import { useEffect, useRef, useState } from 'react'

export default function TaxonomyCombobox({ label, value = '', options = [], onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const normalized = value.trim().toLowerCase()
  const filtered = options.filter((option) => option.toLowerCase().includes(normalized))
  const isDraft = Boolean(value.trim()) && !options.some((option) => option.toLowerCase() === normalized)

  useEffect(() => {
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return <div ref={ref} className="relative">
    <label className="text-[10px] uppercase tracking-widest text-neutral-400">{label}
      <input value={value} onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true) }} className="mt-1 h-11 w-full border border-neutral-800 bg-neutral-900 px-3 text-sm normal-case tracking-normal outline-none focus:border-amber-400" aria-expanded={open} aria-autocomplete="list" />
    </label>
    {open && <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-y-auto border border-neutral-800 bg-neutral-950 p-1 shadow-2xl" role="listbox">
      {filtered.map((option) => <button key={option} type="button" onClick={() => { onChange(option); setOpen(false) }} className="block w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-900 hover:text-amber-300">{option}</button>)}
      {isDraft && <button type="button" onClick={() => { onChange(value.trim()); setOpen(false) }} className="block w-full border-t border-neutral-800 px-3 py-2 text-left text-xs text-amber-300">+ Add custom &quot;{value.trim()}&quot;</button>}
      {!filtered.length && !isDraft && <p className="px-3 py-2 text-xs text-neutral-600">No matches</p>}
    </div>}
    {isDraft && <span className="mt-1 inline-flex border border-amber-400 bg-amber-950/30 px-2 py-1 text-[9px] uppercase tracking-wider text-amber-300">New draft: {value.trim()}</span>}
  </div>
}
