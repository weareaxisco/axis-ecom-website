import { useEffect, useMemo, useState } from 'react'
import { Heart, Menu, Search, X } from 'lucide-react'
import { supabase } from '../supabaseClient'

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

export default function SearchDrawer({ isOpen, onClose, onMenuOpen, storeName }) {
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
        setProducts(data || [])
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
    <div className={`pointer-events-none fixed inset-0 z-50 ${isOpen ? 'visible' : 'invisible'}`} aria-hidden={!isOpen}>
      <button type="button" aria-label="Close search" onClick={onClose} className={`pointer-events-auto absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside className={`pointer-events-auto absolute bottom-0 left-0 top-0 flex w-full max-w-[400px] transform flex-col bg-white text-neutral-900 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <button type="button" aria-label="Open navigation" onClick={() => { onClose(); onMenuOpen() }}><Menu size={20} strokeWidth={1.25} /></button>
          <span className="truncate px-3 font-serif text-sm uppercase tracking-widest">{storeName}</span>
          <div className="flex items-center gap-3"><Heart size={19} strokeWidth={1.25} /><button type="button" aria-label="Close search" onClick={onClose}><X size={19} strokeWidth={1.25} /></button></div>
        </header>
        <div className="m-4 flex items-center gap-2 bg-neutral-100 px-3 py-3">
          <Search size={17} strokeWidth={1.25} className="text-neutral-500" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creations" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400" />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} strokeWidth={1.25} /></button>}
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {!debouncedQuery && <p className="py-6 text-xs uppercase tracking-widest text-neutral-400">Search our creations</p>}
          {debouncedQuery && !groupedResults.length && <p className="py-6 text-sm text-neutral-500">No creations found.</p>}
          {groupedResults.map((group) => (
            <div key={group.id} className="mb-6">
              <div className="flex items-center justify-between border-b border-neutral-200 py-2">
                <span className="font-serif text-sm font-semibold uppercase">{group.title}</span>
                <span className="font-mono text-xs text-neutral-500">({group.matchCount} matches)</span>
              </div>
              <ul className="divide-y divide-neutral-100">{group.items.map((product) => <li key={product.id} className="cursor-pointer py-2 text-sm hover:text-amber-700">{product.name}</li>)}</ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
