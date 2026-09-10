import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const fallbackCategories = ['High Jewelry', 'Fine Jewelry', 'Timepieces', 'Haute Horlogerie']
const fallbackCollections = ['Ice Cube', 'Happy Sport', 'Alpine Eagle', "L'Élégance"]
const generateSku = () => `MSN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export default function AdminAddProductModal({ onClose, onCreated, initialProduct = null, onUpdated }) {
  const { t } = useLanguage()
  const [categories, setCategories] = useState(fallbackCategories)
  const [collections, setCollections] = useState(fallbackCollections)
  const [categoryRecords, setCategoryRecords] = useState([])
  const [collectionRecords, setCollectionRecords] = useState([])
  const [attributeOptions, setAttributeOptions] = useState({})
  const [form, setForm] = useState(() => initialProduct ? { ...initialProduct, sku: initialProduct.sku || '', name: initialProduct.name || initialProduct.title || '', category: initialProduct.category || fallbackCategories[0], collection: initialProduct.collection || fallbackCollections[0], price_dh: initialProduct.price_dh ?? initialProduct.price ?? '', images: Array.isArray(initialProduct.images) ? initialProduct.images.join('\n') : initialProduct.images || '', stock: initialProduct.stock ?? '0', onsite_only: Boolean(initialProduct.onsite_only) } : { name: '', sku: '', category: fallbackCategories[0], collection: fallbackCollections[0], price_dh: '', images: '', description: '', material: '', metal: '', gender: '', shape: '', novelty: '', stock: '0', onsite_only: false })
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
    const payload = { ...form, sku: form.sku?.trim() || generateSku(), category_id: categoryRecords.find((item) => item.name_en === form.category)?.id || null, collection_id: collectionRecords.find((item) => item.name === form.collection)?.id || null, slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'), price_dh: Number(form.price_dh), stock: Number(form.stock), images: form.images.split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean) }
    const query = initialProduct
      ? supabase.from('products').update(payload).eq('id', initialProduct.id).select().single()
      : supabase.from('products').insert(payload).select().single()
    const { data, error: saveError } = await query
    if (saveError) { setError(saveError.message); return }
    if (initialProduct) onUpdated(data)
    else onCreated(data)
    onClose()
  }
  const input = 'mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500'
  const attributeSelect = (field) => attributeOptions[field]?.length ? <label className="text-[10px] uppercase tracking-widest text-neutral-400">{field}<select value={form[field]} onChange={update(field)} className={input}><option value="">{t('select')} {field}</option>{attributeOptions[field].map((item) => <option key={item.id} value={item.value}>{item.value}</option>)}</select></label> : null
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-800 bg-neutral-950 p-6 text-white"><div className="flex justify-between"><h2 className="font-serif text-2xl uppercase tracking-widest">{initialProduct ? t('edit') : t('addNewCreationTitle')}</h2><button type="button" onClick={onClose} aria-label={t('close')}><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('titleName')}<input required value={form.name} onChange={update('name')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">SKU<input value={form.sku} onChange={update('sku')} placeholder="MSN-XXXXXX" className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('category')}<select value={form.category} onChange={update('category')} className={input}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('collection')}<select value={form.collection} onChange={update('collection')} className={input}>{collections.map((item) => <option key={item}>{item}</option>)}</select></label>{attributeSelect('metal')}{attributeSelect('gender')}{attributeSelect('shape')}{attributeSelect('novelty')}<label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('priceInDh')}<input required type="number" min="0" value={form.price_dh} onChange={update('price_dh')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('stockQuantity')}<input type="number" min="0" value={form.stock} onChange={update('stock')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('imageUrls')} <span className="normal-case">({t('onePerLine')})</span><textarea value={form.images} onChange={update('images')} className={`${input} h-20`} />{form.images.split(/\r?\n|,/).filter(Boolean).map((src) => <img key={src} src={src.trim()} alt="" className="mt-2 mr-2 inline-block h-14 w-14 object-cover" />)}</label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('description')}<textarea value={form.description} onChange={update('description')} className={`${input} h-20`} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('materialSpecifications')}<input value={form.material} onChange={update('material')} className={input} /></label></div><label className="mt-5 flex items-center gap-3 text-xs text-amber-300"><input type="checkbox" checked={form.onsite_only} onChange={update('onsite_only')} className="accent-amber-500" />{t('boutiqueExclusive')}</label>{error && <p className="mt-4 text-xs text-rose-400">{error}</p>}<button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">{t('createCreation')}</button></form></div>
}
