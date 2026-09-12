import { useEffect, useRef, useState } from 'react'

export default function TaxonomyCombobox({ value = '', options = [], onChange, onSelect, selectedValues = [], onRemove }) {
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

  const multiple = selectedValues.length > 0 || Boolean(onRemove)
  return <div ref={ref} className="relative w-full">
    <div className="flex flex-wrap items-center gap-1.5 w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus-within:border-amber-400 p-2">
      {multiple && selectedValues.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[10px] normal-case tracking-normal text-amber-300">
        {item}<button type="button" aria-label={`Remove ${item}`} onClick={() => onRemove?.(item)}><span aria-hidden="true">×</span></button>
      </span>)}
      <input value={value} onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true) }} className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-neutral-200" aria-expanded={open} aria-autocomplete="list" />
    </div>
    {open && <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-y-auto border border-neutral-800 bg-neutral-950 p-1 shadow-2xl" role="listbox">
      {filtered.map((option) => <button key={option} type="button" onClick={() => { onChange(option); onSelect?.(option); setOpen(false) }} className="block w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-900 hover:text-amber-300">{option}</button>)}
      {isDraft && <button type="button" onClick={() => { onChange(value.trim()); onSelect?.(value.trim()); setOpen(false) }} className="block w-full border-t border-neutral-800 px-3 py-2 text-left text-xs text-amber-300">+ Add custom &quot;{value.trim()}&quot;</button>}
      {!filtered.length && !isDraft && <p className="px-3 py-2 text-xs text-neutral-600">No matches</p>}
    </div>}
  </div>
}
