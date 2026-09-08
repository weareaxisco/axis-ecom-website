import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'

const fallbackCategories = ['High Jewelry', 'Fine Jewelry', 'Timepieces', 'Haute Horlogerie']
const fallbackCollections = ['Ice Cube', 'Happy Sport', 'Alpine Eagle', "L'Élégance"]

export default function AdminAddProductModal({ onClose, onCreated }) {
  const [categories, setCategories] = useState(fallbackCategories)
  const [collections, setCollections] = useState(fallbackCollections)
  const [categoryRecords, setCategoryRecords] = useState([])
  const [collectionRecords, setCollectionRecords] = useState([])
  const [attributeOptions, setAttributeOptions] = useState({})
  const [form, setForm] = useState({ name: '', category: fallbackCategories[0], collection: fallbackCollections[0], price_dh: '', images: '', description: '', material: '', metal: '', gender: '', shape: '', novelty: '', stock: '0', onsite_only: false })
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('id, name_en').order('name_en'),
      supabase.from('collections').select('id, name').order('name'),
      supabase.from('attributes').select('id, slug, attribute_values(id, value)').order('slug'),
    ]).then(([categoryResult, collectionResult, attributeResult]) => {
      if (!categoryResult.error && categoryResult.data?.length) {
        setCategoryRecords(categoryResult.data)
        const values = categoryResult.data.map((item) => item.name_en)
        setCategories(values)
        setForm((current) => ({ ...current, category: values.includes(current.category) ? current.category : values[0] }))
      }
      if (!collectionResult.error && collectionResult.data?.length) {
        setCollectionRecords(collectionResult.data)
        const values = collectionResult.data.map((item) => item.name)
        setCollections(values)
        setForm((current) => ({ ...current, collection: values.includes(current.collection) ? current.collection : values[0] }))
      }
      if (!attributeResult.error && attributeResult.data?.length) {
        setAttributeOptions(Object.fromEntries(attributeResult.data.map((item) => [item.slug, item.attribute_values || []])))
      }
    })
  }, [])
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    const payload = { ...form, category_id: categoryRecords.find((item) => item.name_en === form.category)?.id || null, collection_id: collectionRecords.find((item) => item.name === form.collection)?.id || null, slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'), price_dh: Number(form.price_dh), stock: Number(form.stock), images: form.images.split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean) }
    const { data, error: insertError } = await supabase.from('products').insert(payload).select().single()
    if (insertError) { setError(insertError.message); return }
    onCreated(data); onClose()
  }
  const input = 'mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500'
  const attributeSelect = (field) => attributeOptions[field]?.length ? <label className="text-[10px] uppercase tracking-widest text-neutral-400">{field}<select value={form[field]} onChange={update(field)} className={input}><option value="">Select {field}</option>{attributeOptions[field].map((item) => <option key={item.id} value={item.value}>{item.value}</option>)}</select></label> : null
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-800 bg-neutral-950 p-6 text-white"><div className="flex justify-between"><h2 className="font-serif text-2xl uppercase tracking-widest">Add New Creation</h2><button type="button" onClick={onClose} aria-label="Close"><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Title / Name<input required value={form.name} onChange={update('name')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Category<select value={form.category} onChange={update('category')} className={input}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Collection<select value={form.collection} onChange={update('collection')} className={input}>{collections.map((item) => <option key={item}>{item}</option>)}</select></label>{attributeSelect('metal')}{attributeSelect('gender')}{attributeSelect('shape')}{attributeSelect('novelty')}<label className="text-[10px] uppercase tracking-widest text-neutral-400">Price in DH<input required type="number" min="0" value={form.price_dh} onChange={update('price_dh')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Stock Quantity<input type="number" min="0" value={form.stock} onChange={update('stock')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Image URLs <span className="normal-case">(one per line)</span><textarea value={form.images} onChange={update('images')} className={`${input} h-20`} />{form.images.split(/\r?\n|,/).filter(Boolean).map((src) => <img key={src} src={src.trim()} alt="" className="mt-2 mr-2 inline-block h-14 w-14 object-cover" />)}</label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Description<textarea value={form.description} onChange={update('description')} className={`${input} h-20`} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Material Specifications<input value={form.material} onChange={update('material')} className={input} /></label></div><label className="mt-5 flex items-center gap-3 text-xs text-amber-300"><input type="checkbox" checked={form.onsite_only} onChange={update('onsite_only')} className="accent-amber-500" />Boutique Exclusive / Onsite Only</label>{error && <p className="mt-4 text-xs text-rose-400">{error}</p>}<button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">Create Creation</button></form></div>
}
