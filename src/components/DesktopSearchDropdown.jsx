import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { mockProducts } from './ProductCatalog'
import { supabase } from '../supabaseClient'
import { useSiteConfig } from '../context/ConfigContext'

const defaultPopularSearches = ['Diamond', 'Ice Cube', 'High Jewelry', 'Timepieces']

export default function DesktopSearchDropdown({
  isOpen,
  onClose,
  searchQuery = '',
  setSearchQuery,
  searchResults,
  categories,
  popularSearches = defaultPopularSearches,
  onSelectSearch,
}) {
  const { config } = useSiteConfig()
  const [products, setProducts] = useState(mockProducts)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef(null)
  const updateSearchQuery = setSearchQuery || (() => {})

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || products !== mockProducts) return undefined
    let active = true
    supabase.from('products').select('*, categories(*), collections(*)').then(({ data, error }) => {
      if (!active) return
      if (error) console.warn(`Desktop search fallback: ${error.message}`)
      if (data?.length) setProducts(data)
    })
    return () => {
      active = false
    }
  }, [isOpen, products])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase())
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const filteredMatches = useMemo(() => {
    if (!debouncedQuery) return products
    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.category_name,
        product.collection,
        product.collection_name,
        product.description,
        product.tags,
      ].flatMap((value) => Array.isArray(value) ? value : [value]).filter(Boolean).join(' ').toLowerCase()
      return searchableText.includes(debouncedQuery)
    })
  }, [debouncedQuery, products])
  const matches = searchResults || filteredMatches
  const isDebouncing = searchQuery.trim().toLowerCase() !== debouncedQuery

  const collectionNames = categories || [...new Set(products.map((product) => product.collection_name || product.category_name || 'Fine Jewelry'))].slice(0, 5)
  const selectSearch = (value) => {
    const normalizedValue = value.trim().toLowerCase()
    updateSearchQuery(value)
    setDebouncedQuery(normalizedValue)
    onSelectSearch?.(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 hidden md:block" role="dialog" aria-modal="true" aria-label="Desktop search">
      <div aria-hidden="true" className="fixed inset-0 top-[152px] z-30 bg-black/60" />
      <section className="fixed left-0 right-0 top-[152px] z-40 max-h-[55vh] w-full overflow-y-auto border-b border-amber-500/30 bg-neutral-950/98 text-white shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="relative mb-6 flex w-full items-center gap-4 rounded-sm border border-amber-500/40 bg-neutral-900/80 px-5 py-3.5 shadow-inner transition-all focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50">
            <Search className="h-6 w-6 flex-shrink-0 text-amber-400" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              placeholder="SEARCH CREATIONS, HIGH JEWELRY, TIMEPIECES..."
              className="w-full bg-transparent font-serif text-lg tracking-wider text-amber-50 uppercase outline-none placeholder:text-neutral-500 md:text-xl"
            />
            {isDebouncing && <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-label="Searching" />}
            {searchQuery && (
              <button type="button" aria-label="Clear search" onClick={() => updateSearchQuery('')} className="p-1 text-neutral-400 transition-colors hover:text-amber-400">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 space-y-4 md:col-span-4">
              <div>
                <h3 className="mb-2 text-xs font-mono tracking-widest text-amber-400/90 uppercase">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => (
                    <button key={item} type="button" onClick={() => selectSearch(item)} className="border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-mono tracking-wider text-neutral-300 uppercase transition-all hover:border-amber-500/60 hover:text-amber-300">{item}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-mono tracking-widest text-amber-400/90 uppercase">Collections</h3>
                <ul className="space-y-2">
                  {collectionNames.map((category) => (
                    <li key={category}><button type="button" onClick={() => selectSearch(category)} className="text-sm font-serif tracking-wide text-neutral-400 uppercase transition-colors hover:text-white">{category}</button></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <h3 className="mb-2 flex items-center justify-between text-xs font-mono tracking-widest text-amber-400/90 uppercase">
                <span>{debouncedQuery ? `Results for '${debouncedQuery}'` : 'Recommended Products'}</span>
                {debouncedQuery && <span className="text-[11px] font-sans text-neutral-500">{matches.length} results</span>}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {matches.slice(0, 6).map((product) => (
                  <a key={product.id} href={`/product/${product.id}`} onClick={onClose} className="group cursor-pointer">
                    <div className="mb-2 aspect-[4/3] max-h-28 overflow-hidden border border-neutral-800 bg-neutral-900 transition-colors group-hover:border-amber-500/40">
                      <img src={product.image || product.main_image_url || product.images?.[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h4 className="line-clamp-1 font-serif text-xs text-neutral-200 transition-colors group-hover:text-amber-300">{product.name}</h4>
                    <p className="mt-0.5 text-[10px] font-mono text-neutral-400">{product.category || product.category_name || product.material || 'Fine Jewelry'}</p>
                    <p className="mt-0.5 text-[10px] font-mono text-amber-400">{product.price ? `${product.price} ${config.currency_symbol || 'MAD'}` : ''}</p>
                  </a>
                ))}
              </div>
              {!matches.length && debouncedQuery && (
                <div className="py-10 text-center">
                  <p className="font-serif text-lg text-neutral-300">No creations matching your search were found.</p>
                  <button type="button" onClick={() => { updateSearchQuery(''); setDebouncedQuery('') }} className="mt-4 text-[11px] uppercase tracking-widest text-amber-400 hover:text-white">Reset search</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
