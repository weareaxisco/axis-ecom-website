import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const createId = () => globalThis.crypto?.randomUUID?.() || `spec-${Date.now()}-${Math.random().toString(36).slice(2)}`
const toRows = (value) => Object.entries(value || {}).map(([key, currentValue]) => ({ id: createId(), key, value: String(currentValue ?? '') }))

function SpecificationRow({ row, onUpdate, onRemove }) {
  return <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
    <input value={row.key} onChange={(event) => onUpdate(row.id, 'key', event.target.value)} placeholder="Carat Weight" className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-amber-500" />
    <input value={row.value} onChange={(event) => onUpdate(row.id, 'value', event.target.value)} placeholder="18K Gold" className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-amber-500" />
    <button type="button" aria-label="Remove specification" onClick={() => onRemove(row.id)} className="px-2 text-neutral-500 hover:text-rose-300"><Trash2 size={15} /></button>
  </div>
}

export default function SpecificationEditor({ value = {}, onChange }) {
  const [rows, setRows] = useState(() => toRows(value))
  const lastValue = useRef(JSON.stringify(value || {}))
  useEffect(() => {
    const nextValue = JSON.stringify(value || {})
    if (nextValue !== lastValue.current) {
      setRows(toRows(value))
      lastValue.current = nextValue
    }
  }, [value])
  const emit = (nextRows) => {
    setRows(nextRows)
    const nextValue = Object.fromEntries(nextRows.map(({ key, value: rowValue }) => [key, rowValue]))
    lastValue.current = JSON.stringify(nextValue)
    onChange(nextValue)
  }
  const update = (id, field, nextValue) => emit(rows.map((row) => row.id === id ? { ...row, [field]: nextValue } : row))
  const add = () => emit([...rows, { id: createId(), key: '', value: '' }])
  const remove = (id) => emit(rows.filter((row) => row.id !== id))
  return <div className="border border-neutral-800 bg-neutral-950/50 p-4">
    <div className="mb-3 flex items-center justify-between"><h2 className="text-xs uppercase tracking-widest text-neutral-300">Specifications</h2><button type="button" onClick={add} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-amber-300"><Plus size={14} /> Add Specification</button></div>
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] uppercase tracking-widest text-neutral-500"><span>Key</span><span>Value</span><span aria-hidden="true" /></div>
    <div className="mt-2 space-y-2">{rows.map((row) => <SpecificationRow key={row.id} row={row} onUpdate={update} onRemove={remove} />)}</div>
  </div>
}
