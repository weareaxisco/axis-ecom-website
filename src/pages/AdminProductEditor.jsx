import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import SpecificationEditor from '../components/SpecificationEditor'
import TaxonomyCombobox from '../components/TaxonomyCombobox'
import ImageUploader from '../components/ImageUploader'
import MarkdownToolbar from '../components/MarkdownToolbar'
import AdminProductPreview from '../components/AdminProductPreview'
import { useProductContext } from '../context/ProductContext'

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
const sku = () => `MSN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
const emptyForm = { name: '', sku: '', category: '', collection: '', price_dh: '', stock: '0', description: '', images: [], tags: [], specifications: {} }
const isMissingColumnError = (error, column) => error?.code === 'PGRST204' && error.message?.toLowerCase().includes(column)

export default function AdminProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [activePanel, setActivePanel] = useState('form')
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tagDraft, setTagDraft] = useState('')
  const { taxonomies, addTaxonomy } = useProductContext()

  useEffect(() => {
    if (!editing) return undefined
    let active = true
    supabase.from('products').select('*').eq('id', id).single().then(({ data, error: loadError }) => {
      if (!active) return
      if (loadError) setError(loadError.message)
      if (data) {
        const metadata = data.metadata && typeof data.metadata === 'object' ? data.metadata : {}
        setForm({
          ...emptyForm,
          ...data,
          name: data.name || data.title || '',
          sku: data.sku || metadata.sku || '',
          tags: Array.isArray(data.tags) ? data.tags : Array.isArray(metadata.tags) ? metadata.tags : data.tags ? [data.tags] : [],
          specifications: data.specifications || metadata.specifications || {},
          images: Array.isArray(data.images) ? data.images : data.images ? String(data.images).split(/\r?\n|,/) : [],
        })
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [editing, id])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const persistTaxonomy = async (type, name) => {
    const slug = slugify(name)
    const table = type === 'category' ? 'categories' : 'collections'
    const candidates = type === 'category' ? [{ name, name_fr: name, name_en: name, title: name, slug }, { name_fr: name, name_en: name, slug }, { title: name, slug }, { name, slug }] : [{ name, slug }, { title: name, slug }]
    let createError
    for (const payload of candidates) {
      const result = await supabase.from(table).insert(payload)
      createError = result.error
      if (!createError) break
      if (!['PGRST204', '42703'].includes(createError.code)) break
    }
    if (createError) { setError(createError.message); return false }
    window.dispatchEvent(new CustomEvent('taxonomy:changed'))
    return true
  }
  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const generatedSku = form.sku.trim() || sku()
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      category: form.category.trim(),
      collection: form.collection.trim() || null,
      description: form.description,
      price_dh: Number(form.price_dh),
      stock: Number(form.stock),
      images: form.images,
      metadata: {
        sku: generatedSku,
        tags: form.tags,
        specifications: form.specifications,
      },
    }
    const existing = type => taxonomies[type === 'category' ? 'categories' : 'collections'].some((item) => item.toLowerCase() === form[type].trim().toLowerCase())
    for (const [type, name] of [['category', form.category], ['collection', form.collection]]) {
      if (name.trim() && !existing(type) && !(await persistTaxonomy(type, name))) {
        setSaving(false)
        return
      }
    }
    try {
      for (const tag of form.tags) {
        if (!taxonomies.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) await addTaxonomy('tag', tag)
      }
    } catch (taxonomyError) {
      setSaving(false)
      setError(taxonomyError.message)
      return
    }
    const saveProduct = (data) => editing ? supabase.from('products').update(data).eq('id', id) : supabase.from('products').insert(data)
    let saveError = (await saveProduct(payload)).error
    if (isMissingColumnError(saveError, 'metadata')) {
      const withoutMetadata = { ...payload }
      delete withoutMetadata.metadata
      saveError = (await saveProduct(withoutMetadata)).error
    }
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
          <div className="border border-neutral-800 bg-neutral-950/60 p-6">
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400">Title<input required value={form.name} onChange={update('name')} className="mt-2 h-11 w-full border border-neutral-800 bg-neutral-900 px-3 text-sm outline-none focus:border-amber-400" /></label>
            <div className="mt-6 grid w-full grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
              <div className="flex w-full flex-col"><label className="mb-2 block h-4 text-xs uppercase leading-4 tracking-wider text-neutral-400">SKU</label><input value={form.sku} onChange={update('sku')} placeholder="Auto-generated if empty" className="block h-11 w-full border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-400" /></div>
              <div className="flex w-full flex-col"><label className="mb-2 block h-4 text-xs uppercase leading-4 tracking-wider text-neutral-400">CATEGORY</label><TaxonomyCombobox hideLabel value={form.category} options={taxonomies.categories} onChange={(value) => setForm((current) => ({ ...current, category: value }))} /></div>
              <div className="flex w-full flex-col"><label className="mb-2 block h-4 text-xs uppercase leading-4 tracking-wider text-neutral-400">COLLECTION</label><TaxonomyCombobox hideLabel value={form.collection} options={taxonomies.collections} onChange={(value) => setForm((current) => ({ ...current, collection: value }))} /></div>
              <div className="flex w-full flex-col"><label className="mb-2 block h-4 text-xs uppercase leading-4 tracking-wider text-neutral-400">PRICE (DH)</label><input required type="number" value={form.price_dh} onChange={update('price_dh')} className="block h-11 w-full border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-400" /></div>
              <div className="flex w-full flex-col"><label className="mb-2 block h-4 text-xs uppercase leading-4 tracking-wider text-neutral-400">STOCK</label><input type="number" value={form.stock} onChange={update('stock')} className="block h-11 w-full border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-200 outline-none focus:border-amber-400" /></div>
              <div className="flex w-full flex-col"><label className="mb-2 block h-4 text-xs uppercase leading-4 tracking-wider text-neutral-400">TAGS</label><TaxonomyCombobox hideLabel value={tagDraft} options={taxonomies.tags} selectedValues={form.tags} onChange={setTagDraft} onRemove={(tag) => setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))} onSelect={(tag) => { setForm((current) => ({ ...current, tags: current.tags.includes(tag) ? current.tags : [...current.tags, tag] })); setTagDraft('') }} /></div>
            </div>
            <div className="md:col-span-2"><ImageUploader value={form.images} onChange={(images) => setForm((current) => ({ ...current, images }))} /></div>
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 md:col-span-2">Description<MarkdownToolbar value={form.description} onChange={(description) => setForm((current) => ({ ...current, description }))} /></label>
          </div>
          <SpecificationEditor value={form.specifications} onChange={(specifications) => setForm((current) => ({ ...current, specifications }))} />
          {error && <p className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{error}</p>}<button type="submit" disabled={saving} className="w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-50">{saving ? 'Saving…' : 'Save Creation'}</button>
        </form>
        <aside className={`${activePanel === 'preview' ? 'block' : 'hidden'} md:block`}><AdminProductPreview product={form} /></aside>
      </div>
    </div>
  </main>
}
