import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import ProductCard from './ProductCard'
import { mockProducts } from './ProductCatalog'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const manuals = [
  { id: 'care-guide', title: 'Jewellery Care Guide', type: 'Care & service', href: '#' },
  { id: 'warranty-guide', title: 'Warranty & Services', type: 'Maison services', href: '#' },
  { id: 'timepieces-guide', title: 'Timepieces Instruction Manual', type: 'Timepieces', href: '#' },
  { id: 'boutique-guide', title: 'Boutique Appointment Guide', type: 'Boutique concierge', href: '#' },
]

function getLabel(value, fallback = '') {
  if (typeof value === 'string') return value
  return value?.name || fallback
}

function SectionHeader({ id, label, count, onShowAll }) {
  const { t } = useLanguage()
  return (
    <div className="mb-6 flex items-end justify-between border-b border-[var(--border-subtle)] pb-3">
      <h2 className="font-serif text-lg uppercase tracking-widest">{label} <span className="text-sm opacity-50">({count})</span></h2>
      <button type="button" onClick={() => onShowAll(id)} className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)] hover:underline">{t('showAll')}</button>
    </div>
  )
}

function ProductsSection({ products, count, onShowAll }) {
  const { t } = useLanguage()
  return (
    <section>
      <SectionHeader id="products" label={t('products')} count={count} onShowAll={onShowAll} />
      {products.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="py-10 text-center opacity-60">{t('noProductsFoundSearch')}</p>}
    </section>
  )
}

function SelectionsSection({ selections, count, onShowAll }) {
  const { t } = useLanguage()
  return (
    <section>
      <SectionHeader id="selections" label={t('selections')} count={count} onShowAll={onShowAll} />
      {selections.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{selections.map((selection) => <a key={selection.id} href="#" className="group relative aspect-[4/3] overflow-hidden bg-[var(--surface-primary)]"><img src={selection.image} alt={selection.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-black/65 p-4 text-white"><p className="font-serif text-sm uppercase tracking-widest">{selection.title}</p><p className="mt-1 text-[10px] uppercase tracking-widest opacity-70">{selection.category}</p></div></a>)}</div> : <p className="py-10 text-center opacity-60">{t('noSelectionsFound')}</p>}
    </section>
  )
}

function ManualsSection({ manuals, count, onShowAll }) {
  const { t } = useLanguage()
  return (
    <section>
      <SectionHeader id="manuals" label={t('instructionManuals')} count={count} onShowAll={onShowAll} />
      {manuals.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{manuals.map((manual) => <a key={manual.id} href={manual.href} className="border border-[var(--border-subtle)] p-5 transition-colors hover:border-[var(--accent-gold)]"><Download size={20} strokeWidth={1.25} className="mb-10 text-[var(--accent-gold)]" /><p className="font-serif text-sm uppercase tracking-wider">{manual.title}</p><p className="mt-2 text-[10px] uppercase tracking-widest opacity-60">{manual.type}</p><p className="mt-6 text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">{t('downloadPdf')}</p></a>)}</div> : <p className="py-10 text-center opacity-60">{t('noManualsFound')}</p>}
    </section>
  )
}

export default function SearchResults() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim().toLowerCase()
  const [products, setProducts] = useState(mockProducts)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    setActiveTab('all')
  }, [query])

  useEffect(() => {
    let active = true
    supabase.from('products').select('*, categories(*), collections(*)').then(({ data, error }) => {
      if (!active) return
      if (error) console.warn(`Search results fallback: ${error.message}`)
      if (data?.length) setProducts(data)
    })
    return () => {
      active = false
    }
  }, [])

  const productMatches = useMemo(
    () => products.filter((product) => !query || JSON.stringify(product).toLowerCase().includes(query)),
    [products, query],
  )

  const selections = useMemo(() => {
    const grouped = new Map()
    productMatches.forEach((product) => {
      const title = getLabel(product.collection, product.collection_name || getLabel(product.collections)) || getLabel(product.category, product.category_name) || 'Fine Jewelry'
      const key = title.toLowerCase()
      if (!grouped.has(key)) grouped.set(key, { id: key, title, category: product.category_name || 'Fine Jewelry', image: product.main_image_url })
    })
    return [...grouped.values()]
  }, [productMatches])

  const manualMatches = useMemo(
    () => manuals.filter((manual) => !query || `${manual.title} ${manual.type}`.toLowerCase().includes(query)),
    [query],
  )

  const counts = {
    products: productMatches.length,
    selections: selections.length,
    manuals: manualMatches.length,
  }
  const total = counts.products + counts.selections + counts.manuals
  const tabs = [
    { id: 'all', label: t('all'), count: total },
    { id: 'products', label: t('products'), count: counts.products },
    { id: 'selections', label: t('selections'), count: counts.selections },
    { id: 'manuals', label: t('instructionManuals'), count: counts.manuals },
  ]

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-24 pt-36 text-[var(--text-primary)] md:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">{t('searchLabel')}</p>
          <h1 className="mt-3 font-serif text-3xl uppercase tracking-widest md:text-5xl">{t('resultsFor')} "{query}"</h1>
        </header>
        <nav className="mt-10 flex flex-wrap justify-center gap-2 border-y border-[var(--border-subtle)] py-3" aria-label="Search result categories">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 text-[10px] uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-[var(--accent-gold)]' : 'opacity-60 hover:opacity-100'}`}>{tab.label} ({tab.count})</button>)}
        </nav>
        <div className="mt-12 space-y-16">
          {(activeTab === 'all' || activeTab === 'products') && <ProductsSection products={productMatches} count={counts.products} onShowAll={setActiveTab} />}
          {(activeTab === 'all' || activeTab === 'selections') && <SelectionsSection selections={selections} count={counts.selections} onShowAll={setActiveTab} />}
          {(activeTab === 'all' || activeTab === 'manuals') && <ManualsSection manuals={manualMatches} count={counts.manuals} onShowAll={setActiveTab} />}
        </div>
      </div>
    </main>
  )
}
