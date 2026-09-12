import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Edit3, LoaderCircle, Search, Trash2 } from 'lucide-react'
import { getProductPrice } from '../utils/productUtils'
import { useLanguage } from '../context/LanguageContext'

const money = (value) => `${Number(value || 0).toLocaleString()} DH`
const pageOptions = [5, 10, 20, 50]
const tags = ['New Arrival', 'Iconic', 'Boutique Exclusive']

function productCategory(product) {
  return product.category_name || product.category?.name || product.category || 'Uncategorized'
}

function productSearchText(product) {
  return [product.name, product.title, product.sku, product.category_name, product.category, product.tags, product.specifications, product.description]
    .flatMap((value) => typeof value === 'object' ? Object.values(value) : value || [])
    .join(' ')
    .toLowerCase()
}

export default function AdminProductTable({ products, onToggleOnsiteOnly, onAddProduct, onEditProduct, onDeleteProduct, onBulkTag, onBulkDelete }) {
  const { t } = useLanguage()
  const [savingId, setSavingId] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [stock, setStock] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkTag, setBulkTag] = useState(tags[0])
  const [bulkBusy, setBulkBusy] = useState(false)
  const safeProducts = Array.isArray(products) ? products : []
  const categories = useMemo(() => [...new Set(safeProducts.map(productCategory))].sort(), [safeProducts])
  const filteredProducts = useMemo(() => safeProducts.filter((product) => {
    const matchesQuery = !query.trim() || productSearchText(product).includes(query.trim().toLowerCase())
    const matchesCategory = category === 'all' || productCategory(product) === category
    const inStock = !(product.in_stock === false || product.stock === 0)
    return matchesQuery && matchesCategory && (stock === 'all' || (stock === 'in' ? inStock : !inStock))
  }), [safeProducts, query, category, stock])
  const pageCount = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const visibleProducts = pageSize === 'all' ? filteredProducts : filteredProducts.slice((page - 1) * pageSize, page * pageSize)
  const visibleIds = visibleProducts.map((product) => product.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  useEffect(() => {
    setPage(1)
  }, [query, category, stock, pageSize])

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => safeProducts.some((product) => product.id === id)))
  }, [safeProducts])

  const handleToggle = async (product) => {
    setSavingId(product.id)
    try {
      await onToggleOnsiteOnly(product.id, !product.onsite_only)
    } finally {
      setSavingId(null)
    }
  }

  const toggleSelection = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
  const toggleAllVisible = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])
  const applyTag = async () => {
    if (!selectedIds.length || !onBulkTag) return
    setBulkBusy(true)
    try {
      await onBulkTag(selectedIds, bulkTag)
      setSelectedIds([])
    } finally {
      setBulkBusy(false)
    }
  }
  const deleteSelected = async () => {
    if (!selectedIds.length || !onBulkDelete || !window.confirm(`Delete ${selectedIds.length} selected products?`)) return
    setBulkBusy(true)
    try {
      await onBulkDelete(selectedIds)
      setSelectedIds([])
    } finally {
      setBulkBusy(false)
    }
  }

  return <div className="relative">
    <div className={`fixed bottom-6 left-1/2 z-50 flex w-[92%] max-w-xl -translate-x-1/2 flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/50 bg-neutral-900/95 px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md transition-all duration-300 sm:flex-nowrap sm:rounded-full sm:gap-3 ${selectedIds.length ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'}`}>
      <span className="whitespace-nowrap font-semibold uppercase tracking-widest text-amber-300">{selectedIds.length} selected</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <select value={bulkTag} onChange={(event) => setBulkTag(event.target.value)} className="min-w-0 flex-1 border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 text-xs text-white sm:flex-none sm:px-3 sm:py-2">{tags.map((tag) => <option key={tag}>{tag}</option>)}</select>
        <button type="button" disabled={bulkBusy} onClick={applyTag} className="whitespace-nowrap border border-amber-500 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-amber-300 disabled:opacity-50 sm:px-3 sm:py-2">{bulkBusy ? 'Saving…' : 'Assign Tag'}</button>
        <button type="button" disabled={bulkBusy} onClick={deleteSelected} aria-label="Delete selected products" className="inline-flex shrink-0 items-center gap-1 border border-rose-500/60 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-rose-300 disabled:opacity-50 sm:px-3 sm:py-2"><Trash2 size={14} /> <span className="hidden sm:inline">Delete Selected</span></button>
      </div>
    </div>
    <div className="sticky top-0 z-10 border border-neutral-800 bg-neutral-950/95 p-3 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3 text-neutral-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, SKU, category or specifications" className="w-full border border-neutral-800 bg-neutral-900 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-amber-500" /></div>
          <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className="inline-flex shrink-0 items-center gap-2 border border-neutral-800 px-3 py-2.5 text-[10px] uppercase tracking-widest text-neutral-300">Filters <ChevronDown size={14} className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} /></button>
        </div>
        <div className="flex items-center gap-2 md:shrink-0">
          <label className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap border border-neutral-800 px-3 py-2.5 text-[10px] uppercase tracking-widest text-neutral-400">Rows:
            <select value={pageSize} onChange={(event) => setPageSize(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="bg-transparent text-xs text-white outline-none">{pageOptions.map((size) => <option key={size} value={size}>{size}</option>)}<option value="all">All</option></select>
          </label>
          <button type="button" onClick={onAddProduct} className="flex-1 whitespace-nowrap bg-amber-500 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-black md:flex-none">+ {t('addNewCreation')}</button>
        </div>
      </div>
      <div className={`grid overflow-hidden transition-all duration-200 md:grid-cols-2 ${filtersOpen ? 'mt-3 max-h-40 gap-3 opacity-100' : 'mt-0 max-h-0 gap-0 opacity-0'}`}>
        <label className="text-[10px] uppercase tracking-widest text-neutral-500">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-[10px] uppercase tracking-widest text-neutral-500">Stock status<select value={stock} onChange={(event) => setStock(event.target.value)} className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white"><option value="all">All stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select></label>
      </div>
    </div>
    <div className="mt-3 overflow-x-auto border border-neutral-800 bg-neutral-950/70">
      <table className="w-full min-w-[900px] text-left"><thead className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr>
          <th className="w-12 px-3 py-4"><input type="checkbox" aria-label="Select all visible products" checked={allVisibleSelected} onChange={toggleAllVisible} className="accent-amber-500" /></th><th className="px-5 py-4">{t('image')}</th><th className="px-5 py-4">{t('name')}</th><th className="px-5 py-4">{t('category')}</th><th className="px-5 py-4">{t('priceDh')}</th><th className="px-5 py-4">{t('inStock')}</th><th className="px-5 py-4">{t('onsiteOnly')}</th><th className="px-5 py-4">{t('actions')}</th>
        </tr></thead><tbody className="divide-y divide-neutral-800/80">{visibleProducts.map((product) => <tr key={product.id} className="text-sm text-neutral-200">
          <td className="px-3 py-4"><input type="checkbox" aria-label={`Select ${product.name || product.title}`} checked={selectedIds.includes(product.id)} onChange={() => toggleSelection(product.id)} className="accent-amber-500" /></td><td className="px-5 py-4"><img src={product.main_image_url || product.image || product.images?.[0]} alt="" className="h-14 w-12 object-cover" /></td><td className="px-5 py-4 font-serif">{product.name || product.title}</td><td className="px-5 py-4 text-xs text-neutral-400">{productCategory(product)}</td><td className="px-5 py-4 text-amber-400">{money(getProductPrice(product))}</td><td className="px-5 py-4 text-xs uppercase tracking-widest">{product.in_stock === false || product.stock === 0 ? t('no') : t('yes')}</td>
          <td className="px-5 py-4"><label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" checked={Boolean(product.onsite_only)} onChange={() => handleToggle(product)} disabled={savingId === product.id} className="peer sr-only" /><span className="relative h-6 w-11 rounded-full bg-neutral-800 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-disabled:opacity-50 peer-focus:outline-none" /><span className="ml-3 whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-neutral-400">{product.onsite_only ? t('pickup') : t('deliveryLabel')}</span>{savingId === product.id && <LoaderCircle className="ml-2 animate-spin text-amber-400" size={15} />}</label></td>
          <td className="px-5 py-4"><div className="flex items-center gap-3"><button type="button" onClick={() => onEditProduct(product)} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300 hover:text-amber-200"><Edit3 size={14} /> {t('edit')}</button><button type="button" onClick={() => onDeleteProduct(product)} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-rose-300 hover:text-rose-200"><Trash2 size={14} /> {t('delete')}</button></div></td>
        </tr>)}</tbody></table>
      {!visibleProducts.length && <p className="p-10 text-center text-sm text-neutral-500">{t('noProductsFound')}</p>}
    </div>
    <div className="flex items-center justify-center gap-4 border-t border-neutral-800 py-4 text-xs uppercase tracking-widest text-neutral-400"><button type="button" aria-label="Previous Page" disabled={page <= 1 || pageSize === 'all'} onClick={() => setPage((current) => current - 1)} className="border border-neutral-800 p-2 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button><span>Page {page} of {pageCount}</span><button type="button" aria-label="Next Page" disabled={page >= pageCount || pageSize === 'all'} onClick={() => setPage((current) => current + 1)} className="border border-neutral-800 p-2 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button></div>
  </div>
}
