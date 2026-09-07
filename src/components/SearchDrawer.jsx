import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { mockProducts } from './ProductCatalog'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}

function relatedName(value) {
  return typeof value === 'string' ? value : value?.name || ''
}

function collectionName(product) {
  return relatedName(product.collection) || relatedName(product.collections) || product.collection_name || product.category_name || 'Our Jewellery Universe'
}

export default function SearchDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 300)

  useEffect(() => {
    if (!isOpen || products.length) return undefined
    let isMounted = true
    supabase
      .from('products')
      .select('*, categories(*), collections(*)')
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) console.warn(`Search catalog fallback: ${error.message}`)
        setProducts(data?.length ? data : mockProducts)
      })
    return () => {
      isMounted = false
    }
  }, [isOpen, products.length])

  const groupedResults = useMemo(() => {
    if (!debouncedQuery) return []
    const groups = new Map()
    products
      .filter((product) => {
        const searchable = [
          product.name,
          product.subtitle,
          product.material,
          product.tags,
          product.category_name,
          collectionName(product),
        ].flat().join(' ').toLowerCase()
        return searchable.includes(debouncedQuery)
      })
      .forEach((product) => {
        const title = collectionName(product)
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        if (!groups.has(id)) groups.set(id, { id, title, items: [] })
        groups.get(id).items.push(product)
      })
    return [...groups.values()].map((group) => ({ ...group, matchCount: group.items.length }))
  }, [debouncedQuery, products])

  return (
    <div className={`pointer-events-none fixed inset-0 z-40 ${isOpen ? 'visible' : 'invisible'}`} aria-hidden={!isOpen}>
      <button type="button" aria-label="Close search" onClick={onClose} className={`pointer-events-auto absolute bottom-0 left-0 right-0 top-[60px] z-40 bg-black/60 transition-opacity duration-300 md:top-0 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside className={`search-drawer pointer-events-auto fixed inset-x-0 bottom-0 top-[60px] z-40 flex h-[calc(100dvh-60px)] transform flex-col overflow-y-auto bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-2xl transition-transform duration-300 ease-out md:top-0 md:h-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="search-input-wrapper m-4 flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-3">
          <Search size={17} strokeWidth={1.25} className="opacity-60" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creations" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-primary)] placeholder:opacity-40" />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} strokeWidth={1.25} /></button>}
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {!debouncedQuery && <p className="py-6 text-xs uppercase tracking-widest opacity-50">Search our creations</p>}
          {debouncedQuery && !groupedResults.length && <p className="py-6 text-sm opacity-60">No creations found.</p>}
          {groupedResults.map((group) => (
            <div key={group.id} className="mb-6">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2">
                <span className="font-serif text-sm font-semibold uppercase">{group.title}</span>
                <span className="font-mono text-xs opacity-60">({group.matchCount} matches)</span>
              </div>
              <ul className="divide-y divide-neutral-100">{group.items.map((product) => <li key={product.id} className="cursor-pointer py-2 text-sm hover:text-amber-700">{product.name}</li>)}</ul>
            </div>
          ))}
          {debouncedQuery && groupedResults.length > 0 && (
            <button type="button" onClick={() => { onClose(); navigate(`/search?q=${encodeURIComponent(query.trim())}`) }} className="mb-8 w-full border border-[var(--text-primary)] py-3 text-xs uppercase tracking-widest transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface-primary)]">
              SHOW ALL
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
