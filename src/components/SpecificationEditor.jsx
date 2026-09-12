import { Plus, Trash2 } from 'lucide-react'

export default function SpecificationEditor({ value = {}, onChange }) {
  const entries = Object.entries(value || {})
  const update = (index, field, nextValue) => {
    const next = [...entries]
    const [key, currentValue] = next[index]
    next[index] = field === 'key' ? [nextValue, currentValue] : [key, nextValue]
    onChange(Object.fromEntries(next.filter(([entryKey]) => entryKey.trim())))
  }
  const add = () => onChange({ ...value, '': '' })
  const remove = (index) => onChange(Object.fromEntries(entries.filter((_, entryIndex) => entryIndex !== index)))
  return <div className="border border-neutral-800 bg-neutral-950/50 p-4">
    <div className="mb-3 flex items-center justify-between"><h2 className="text-xs uppercase tracking-widest text-neutral-300">Specifications</h2><button type="button" onClick={add} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-amber-300"><Plus size={14} /> Add Specification</button></div>
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] uppercase tracking-widest text-neutral-500"><span>Key</span><span>Value</span><span aria-hidden="true" /></div>
    <div className="mt-2 space-y-2">{entries.map(([key, currentValue], index) => <div key={`${index}-${key}`} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input value={key} onChange={(event) => update(index, 'key', event.target.value)} placeholder="Carat Weight" className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-amber-500" /><input value={currentValue} onChange={(event) => update(index, 'value', event.target.value)} placeholder="18K Gold" className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-amber-500" /><button type="button" aria-label="Remove specification" onClick={() => remove(index)} className="px-2 text-neutral-500 hover:text-rose-300"><Trash2 size={15} /></button></div>)}</div>
  </div>
}
