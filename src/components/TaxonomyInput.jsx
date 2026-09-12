import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function TaxonomyInput({ label, value, options, onChange, onCreate }) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const create = async () => {
    const name = draft.trim()
    if (!name) return
    const created = await onCreate(name)
    if (created) {
      setDraft('')
      setCreating(false)
    }
  }
  return <label className="text-[10px] uppercase tracking-widest text-neutral-400">{label}
    <div className="mt-1 flex gap-2">
      <input list={`${label}-options`} value={value} onChange={onChange} className="min-w-0 flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-amber-500" />
      <datalist id={`${label}-options`}>{options.map((option) => <option key={option} value={option} />)}</datalist>
      <button type="button" onClick={() => setCreating((current) => !current)} aria-label={`Add new ${label}`} className="inline-flex items-center gap-1 border border-neutral-700 px-2 text-[10px] text-amber-300"><Plus size={14} /> Add {label}</button>
    </div>
    {creating && <div className="mt-2 flex gap-2"><input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); create() } }} placeholder={`New ${label}`} className="min-w-0 flex-1 border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs normal-case tracking-normal outline-none focus:border-amber-500" /><button type="button" onClick={create} className="border border-amber-500 px-3 text-[10px] uppercase text-amber-300">Save</button></div>}
  </label>
}
