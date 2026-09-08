import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { mockProducts } from '../components/ProductCatalog'
import ProductGrid from '../components/ProductGrid'
import FilterSidebar from '../components/FilterSidebar'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const initialFilters = { category: [], metal: [], gemstone: [], minPrice: '', maxPrice: '', exclusive: false }
const normalize = (value) => String(value || '').toLowerCase().replace(/[-_]/g, ' ')

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState(mockProducts)
  const [categoryOptions, setCategoryOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    category: params.get('category') ? params.get('category').split(',') : [],
    metal: params.get('metal') ? params.get('metal').split(',') : [],
    gemstone: params.get('gemstone') ? params.get('gemstone').split(',') : [],
    minPrice: params.get('min') || '',
    maxPrice: params.get('max') || '',
    exclusive: params.get('exclusive') === 'true',
  }))
  const [sort, setSort] = useState(params.get('sort') || 'featured')
  const [view, setView] = useState(params.get('view') || 'standard')
  const [mobileFilters, setMobileFilters] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    let active = true
    supabase.from('products').select('*, categories(*), collections(*)').then(({ data, error }) => {
      if (!active) return
      if (error) console.warn(`Catalog fallback: ${error.message}`)
      if (data?.length) setProducts(data)
      setLoading(false)
    })
    return () => { active = false }
  }, [])
  useEffect(() => {
    supabase.from('categories').select('name_en').order('name_en').then(({ data }) => {
      if (data?.length) setCategoryOptions(data.map((item) => item.name_en))
    })
  }, [])

  useEffect(() => {
    const next = new URLSearchParams()
    if (filters.category.length) next.set('category', filters.category.join(','))
    if (filters.metal.length) next.set('metal', filters.metal.join(','))
    if (filters.gemstone.length) next.set('gemstone', filters.gemstone.join(','))
    if (filters.minPrice) next.set('min', filters.minPrice)
    if (filters.maxPrice) next.set('max', filters.maxPrice)
    if (filters.exclusive) next.set('exclusive', 'true')
    if (sort !== 'featured') next.set('sort', sort)
    if (view !== 'standard') next.set('view', view)
    setParams(next, { replace: true })
  }, [filters, sort, view, setParams])

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const text = normalize([product.name, product.category_name, product.category, product.material, product.metals, product.gemstones, product.tags].flat().join(' '))
      const price = Number(product.price ?? product.price_dh ?? 0)
      return (!filters.category.length || filters.category.some((item) => text.includes(normalize(item)))) &&
        (!filters.metal.length || filters.metal.some((item) => text.includes(normalize(item)))) &&
        (!filters.gemstone.length || filters.gemstone.some((item) => text.includes(normalize(item)))) &&
        (!filters.minPrice || price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || price <= Number(filters.maxPrice)) &&
        (!filters.exclusive || product.onsite_only === true)
    })
    return [...filtered].sort((a, b) => sort === 'price-desc' ? Number(b.price ?? b.price_dh ?? 0) - Number(a.price ?? a.price_dh ?? 0) : sort === 'price-asc' ? Number(a.price ?? a.price_dh ?? 0) - Number(b.price ?? b.price_dh ?? 0) : sort === 'newest' ? Number(b.display_order || 0) - Number(a.display_order || 0) : 0)
  }, [filters, products, sort])

  const activeBadges = [...filters.category, ...filters.metal, ...filters.gemstone]
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{t('maison')}</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">{t('allCreations')}</h1><p className="mt-3 text-sm text-neutral-500">{loading ? t('curatingCollection') : `${filteredProducts.length} ${t('creations')}`}</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => setMobileFilters((value) => !value)} className="inline-flex items-center gap-2 border border-neutral-800 px-4 py-3 text-[10px] uppercase tracking-widest lg:hidden"><SlidersHorizontal size={14} /> {t('filters')}</button><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label={t('sortProducts')} className="border border-neutral-800 bg-neutral-900 px-3 py-3 text-xs outline-none focus:border-amber-500"><option value="featured">{t('featured')}</option><option value="newest">{t('newestArrivals')}</option><option value="price-desc">{t('priceHighLow')}</option><option value="price-asc">{t('priceLowHigh')}</option></select></div></header><div className="mt-10 flex gap-10"><FilterSidebar filters={filters} onChange={updateFilter} onReset={() => setFilters(initialFilters)} categoryOptions={categoryOptions} />{mobileFilters && <div className="fixed inset-x-4 top-32 z-30 max-h-[70vh] overflow-y-auto border border-neutral-800 bg-neutral-950 p-5 lg:hidden"><FilterSidebar filters={filters} onChange={updateFilter} onReset={() => setFilters(initialFilters)} mobile categoryOptions={categoryOptions} /></div>}<div className="min-w-0 flex-1">{activeBadges.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-2">{activeBadges.map((badge) => <span key={badge} className="border border-amber-500/40 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-300">{badge}</span>)}<button type="button" onClick={() => setFilters(initialFilters)} className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-amber-300">{t('resetAll')}</button></div>}<ProductGrid products={filteredProducts} view={view} onViewChange={setView} /></div></div></div></main>
}
