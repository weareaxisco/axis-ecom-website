import { useEffect, useRef, useState } from 'react'

export default function TaxonomyCombobox({ value = '', options = [], onChange, onSelect, selectedValues = [], onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inputRef = useRef(null)
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
  const selectValues = (rawValue) => {
    const values = rawValue.split(',').map((item) => item.trim()).filter(Boolean)
    values.forEach((item) => onSelect?.(item))
    onChange('')
    setOpen(false)
  }
  const handleChange = (event) => {
    const nextValue = event.target.value
    if (multiple && nextValue.includes(',')) {
      selectValues(nextValue)
      return
    }
    onChange(nextValue)
    setOpen(true)
  }
  const handleKeyDown = (event) => {
    if (!multiple || !['Enter', ','].includes(event.key)) return
    event.preventDefault()
    selectValues(value)
  }
  return <div ref={ref} className="relative w-full">
    <div onClick={() => inputRef.current?.focus()} className="relative flex items-center gap-1.5 w-full h-11 bg-neutral-900 border border-neutral-800 focus-within:border-amber-400 px-3 overflow-x-auto no-scrollbar scrollbar-none">
      {multiple && selectedValues.map((item) => <span key={item} className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-xs normal-case tracking-normal text-amber-300">
        {item}<button type="button" aria-label={`Remove ${item}`} onClick={() => onRemove?.(item)}><span aria-hidden="true">×</span></button>
      </span>)}
      <input ref={inputRef} value={value} onFocus={() => setOpen(true)} onChange={handleChange} onKeyDown={handleKeyDown} className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-neutral-200 h-full border-none focus:ring-0 p-0" aria-expanded={open} aria-autocomplete="list" />
    </div>
    {open && <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto border border-neutral-800 bg-neutral-900 shadow-xl" role="listbox">
      {filtered.map((option) => <button key={option} type="button" onClick={() => multiple ? selectValues(option) : (onChange(option), onSelect?.(option), setOpen(false))} className="block w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-950 hover:text-amber-300">{option}</button>)}
      {isDraft && <button type="button" onClick={() => selectValues(value)} className="block w-full border-t border-neutral-800 px-3 py-2 text-left text-xs text-amber-300">+ Add custom &quot;{value.trim()}&quot;</button>}
      {!filtered.length && !isDraft && <p className="px-3 py-2 text-xs text-neutral-600">No matches</p>}
    </div>}
  </div>
}
