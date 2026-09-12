import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useProductContext } from '../context/ProductContext'

export default function AdminTaxonomyManager({ onNotice }) {
  const [drafts, setDrafts] = useState({ categories: '', collections: '', tags: '' })
  const { taxonomies, addTaxonomy, deleteTaxonomy } = useProductContext()
  const add = async (type) => {
    const name = drafts[type].trim()
    if (!name) return
    try { await addTaxonomy(type === 'categories' ? 'category' : type === 'collections' ? 'collection' : 'tag', name) } catch (error) { onNotice(`Unable to add taxonomy: ${error.message}`); return }
    setDrafts((current) => ({ ...current, [type]: '' }))
    onNotice(`${name} added`)
  }
  const remove = async (type, item) => {
    const name = type === 'tags' ? item : item.name_en || item.name
    try { await deleteTaxonomy(type === 'categories' ? 'category' : type === 'collections' ? 'collection' : 'tag', name); onNotice(`${name} deleted`) } catch (error) { onNotice(`Unable to delete taxonomy: ${error.message}`) }
  }
  return <div className="grid gap-6 lg:grid-cols-3">{[['categories', 'Categories', (item) => item], ['collections', 'Collections', (item) => item], ['tags', 'Tags', (item) => item]].map(([type, title, getName]) => <section key={type} className="border border-neutral-800 bg-neutral-950/70 p-5"><h2 className="font-serif text-xl uppercase tracking-widest">{title}</h2><div className="mt-4 flex gap-2"><input value={drafts[type]} onChange={(event) => setDrafts((current) => ({ ...current, [type]: event.target.value }))} placeholder={`Add ${title.slice(0, -1)}`} className="min-w-0 flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-500" /><button type="button" onClick={() => add(type)} className="border border-amber-500 px-2 text-amber-300"><Plus size={15} /></button></div><div className="mt-4 space-y-2">{taxonomies[type].map((item) => <div key={item} className="flex items-center justify-between border-b border-neutral-800 py-2 text-xs text-neutral-300"><span>{getName(item)}</span><button type="button" aria-label={`Delete ${getName(item)}`} onClick={() => remove(type, item)} className="text-neutral-600 hover:text-rose-300"><Trash2 size={14} /></button></div>)}</div></section>)}</div>
}
