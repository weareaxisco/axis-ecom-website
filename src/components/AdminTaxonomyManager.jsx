import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

export default function AdminTaxonomyManager({ products = [], onNotice }) {
  const [data, setData] = useState({ categories: [], collections: [] })
  const [drafts, setDrafts] = useState({ categories: '', collections: '' })
  const tags = useMemo(() => [...new Set(products.flatMap((product) => Array.isArray(product.tags) ? product.tags : product.metadata?.tags || []))].sort(), [products])
  const load = async () => {
    const [categories, collections] = await Promise.all([supabase.from('categories').select('*').order('name_en'), supabase.from('collections').select('*').order('name')])
    if (categories.error || collections.error) throw new Error(categories.error?.message || collections.error?.message)
    setData({ categories: categories.data || [], collections: collections.data || [] })
  }
  useEffect(() => { load().catch((error) => onNotice(`Unable to load taxonomies: ${error.message}`)) }, [onNotice])
  const add = async (type) => {
    const name = drafts[type].trim()
    if (!name) return
    const table = type === 'categories' ? 'categories' : 'collections'
    const payload = type === 'categories' ? { name_fr: name, name_en: name, slug: slugify(name) } : { name, slug: slugify(name) }
    const { error } = await supabase.from(table).insert(payload)
    if (error) { onNotice(`Unable to add taxonomy: ${error.message}`); return }
    setDrafts((current) => ({ ...current, [type]: '' }))
    await load()
    window.dispatchEvent(new CustomEvent('taxonomy:changed'))
    onNotice(`${name} added`)
  }
  const remove = async (type, item) => {
    const table = type === 'categories' ? 'categories' : 'collections'
    const { error } = await supabase.from(table).delete().eq('id', item.id)
    if (error) { onNotice(`Unable to delete taxonomy: ${error.message}`); return }
    setData((current) => ({ ...current, [type]: current[type].filter((entry) => entry.id !== item.id) }))
    window.dispatchEvent(new CustomEvent('taxonomy:changed'))
    onNotice(`${item.name_en || item.name} deleted`)
  }
  return <div className="grid gap-6 lg:grid-cols-3">{[['categories', 'Categories', (item) => item.name_en], ['collections', 'Collections', (item) => item.name], ['tags', 'Tags', (item) => item]].map(([type, title, getName]) => <section key={type} className="border border-neutral-800 bg-neutral-950/70 p-5"><h2 className="font-serif text-xl uppercase tracking-widest">{title}</h2>{type !== 'tags' && <div className="mt-4 flex gap-2"><input value={drafts[type]} onChange={(event) => setDrafts((current) => ({ ...current, [type]: event.target.value }))} placeholder={`Add ${title.slice(0, -1)}`} className="min-w-0 flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-500" /><button type="button" onClick={() => add(type)} className="border border-amber-500 px-2 text-amber-300"><Plus size={15} /></button></div>}<div className="mt-4 space-y-2">{(type === 'tags' ? tags : data[type]).map((item) => <div key={item.id || item} className="flex items-center justify-between border-b border-neutral-800 py-2 text-xs text-neutral-300"><span>{getName(item)}</span>{type !== 'tags' && <button type="button" aria-label={`Delete ${getName(item)}`} onClick={() => remove(type, item)} className="text-neutral-600 hover:text-rose-300"><Trash2 size={14} /></button>}</div>)}</div></section>)}</div>
}
