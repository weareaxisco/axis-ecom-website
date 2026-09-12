import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TagManager from '../components/TagManager'
import SpecificationEditor from '../components/SpecificationEditor'

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
const sku = () => `MSN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
const emptyForm = { name: '', sku: '', category: '', collection: '', price_dh: '', stock: '0', description: '', images: '', tags: [], specifications: {} }

export default function AdminProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [activePanel, setActivePanel] = useState('form')
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) return undefined
    let active = true
    supabase.from('products').select('*').eq('id', id).single().then(({ data, error: loadError }) => {
      if (!active) return
      if (loadError) setError(loadError.message)
      if (data) setForm({ ...emptyForm, ...data, name: data.name || data.title || '', images: Array.isArray(data.images) ? data.images.join('\n') : data.images || '', tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [], specifications: data.specifications || {} })
      setLoading(false)
    })
    return () => { active = false }
  }, [editing, id])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const image = useMemo(() => form.images.split(/\r?\n|,/).map((item) => item.trim()).find(Boolean), [form.images])
  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = { ...form, sku: form.sku.trim() || sku(), slug: slugify(form.name), price_dh: Number(form.price_dh), stock: Number(form.stock), images: form.images.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) }
    const query = editing ? supabase.from('products').update(payload).eq('id', id) : supabase.from('products').insert(payload)
    const { error: saveError } = await query
    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }
    navigate('/admin')
  }

  if (loading) return <main className="min-h-screen bg-neutral-950 px-6 pt-40 text-center text-sm text-amber-300">Loading editor…</main>
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-32 text-[var(--text-primary)] md:px-10">
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Admin Studio</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">{editing ? 'Edit Creation' : 'New Creation'}</h1></div><button type="button" onClick={() => navigate('/admin')} className="border border-neutral-800 px-4 py-3 text-xs uppercase tracking-widest">Back to Inventory</button></header>
      <div className="sticky top-0 z-20 mt-8 flex border-b border-neutral-800 bg-[var(--bg-primary)]/95 md:hidden"><button type="button" onClick={() => setActivePanel('form')} className={`flex-1 py-3 text-[10px] uppercase tracking-widest ${activePanel === 'form' ? 'border-b-2 border-amber-400 text-amber-300' : 'text-neutral-500'}`}>Edit Form</button><button type="button" onClick={() => setActivePanel('preview')} className={`flex-1 py-3 text-[10px] uppercase tracking-widest ${activePanel === 'preview' ? 'border-b-2 border-amber-400 text-amber-300' : 'text-neutral-500'}`}>Live Preview</button></div>
      <div className="mt-8 grid gap-8 md:grid-cols-[3fr_2fr]">
        <form onSubmit={save} className={`${activePanel === 'form' ? 'block' : 'hidden'} space-y-5 md:block`}>
          <div className="grid gap-4 border border-neutral-800 bg-neutral-950/60 p-6 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Title<input required value={form.name} onChange={update('name')} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">SKU<input value={form.sku} onChange={update('sku')} placeholder="Auto-generated if empty" className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Category<input value={form.category} onChange={update('category')} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Price (DH)<input required type="number" value={form.price_dh} onChange={update('price_dh')} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Stock<input type="number" value={form.stock} onChange={update('stock')} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Image URLs<textarea value={form.images} onChange={update('images')} className="mt-2 h-20 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Description<textarea value={form.description} onChange={update('description')} className="mt-2 h-24 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></label></div>
          <TagManager value={form.tags} onChange={(tags) => setForm((current) => ({ ...current, tags }))} /><SpecificationEditor value={form.specifications} onChange={(specifications) => setForm((current) => ({ ...current, specifications }))} />
          {error && <p className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{error}</p>}<button type="submit" disabled={saving} className="w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-50">{saving ? 'Saving…' : 'Save Creation'}</button>
        </form>
        <aside className={`${activePanel === 'preview' ? 'block' : 'hidden'} md:block`}><div className="sticky top-8 border border-neutral-800 bg-neutral-950/70 p-6"><p className="text-[10px] uppercase tracking-widest text-amber-400">Live Preview</p>{image ? <img src={image} alt="" className="mt-5 aspect-square w-full object-cover" /> : <div className="mt-5 flex aspect-square items-center justify-center bg-neutral-900 text-xs uppercase tracking-widest text-neutral-600">Add an image</div>}<h2 className="mt-5 font-serif text-2xl">{form.name || 'Untitled Creation'}</h2><p className="mt-2 text-sm text-amber-400">{Number(form.price_dh || 0).toLocaleString()} DH</p>{Object.entries(form.specifications).map(([key, value]) => <p key={key} className="mt-2 text-xs text-neutral-400">{key}: {value}</p>)}</div></aside>
      </div>
    </div>
  </main>
}
