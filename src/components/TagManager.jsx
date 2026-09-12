import { Plus, X } from 'lucide-react'
import { useState } from 'react'

const suggestedTags = ['New Arrival', 'Iconic', 'Boutique Exclusive']

export default function TagManager({ value = [], onChange }) {
  const [draft, setDraft] = useState('')
  const tags = Array.isArray(value) ? value : value ? [value] : []
  const add = (raw = draft) => {
    const tag = raw.trim()
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag])
    setDraft('')
  }
  return <div className="text-[10px] uppercase tracking-widest text-neutral-400">Tags
    <div className="mt-2 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-[10px] normal-case tracking-normal text-amber-300">{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((item) => item !== tag))}><X size={12} /></button></span>)}</div>
    <div className="mt-2 flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }} placeholder="Add a tag" className="min-w-0 flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-amber-500" /><button type="button" onClick={() => add()} aria-label="Add tag" className="border border-neutral-700 px-3 text-amber-300"><Plus size={15} /></button></div>
    <div className="mt-2 flex flex-wrap gap-2">{suggestedTags.filter((tag) => !tags.includes(tag)).map((tag) => <button type="button" key={tag} onClick={() => add(tag)} className="border border-neutral-800 px-2 py-1 text-[10px] normal-case tracking-normal text-neutral-500 hover:border-amber-500 hover:text-amber-300">+ {tag}</button>)}</div>
  </div>
}
