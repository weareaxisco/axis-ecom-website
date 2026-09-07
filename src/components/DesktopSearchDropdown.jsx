import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { mockProducts } from './ProductCatalog'
import { supabase } from '../supabaseClient'
import { useSiteConfig } from '../context/ConfigContext'

export default function DesktopSearchDropdown({ isOpen, onClose, onMouseEnter, onMouseLeave }) {
  const { config } = useSiteConfig()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState(mockProducts)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef(null)

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
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300)
    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const matches = useMemo(() => {
    if (!debouncedQuery) return products
    return products.filter((product) => JSON.stringify(product).toLowerCase().includes(debouncedQuery))
  }, [debouncedQuery, products])

  const collections = useMemo(
    () => [...new Set(products.map((product) => product.collection_name || product.category_name || 'Fine Jewelry'))].slice(0, 5),
    [products],
  )

  return (
    <div className={`fixed inset-0 z-40 hidden transition-opacity duration-300 md:block ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} role="dialog" aria-modal="true" aria-label="Desktop search" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button type="button" aria-label="Close search" onClick={onClose} onMouseEnter={onMouseLeave} className={`fixed inset-0 top-[80px] z-30 bg-black/60 transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} />
      <section className={`fixed left-0 right-0 top-[80px] z-40 h-auto max-h-[80vh] w-full overflow-y-auto border-b border-neutral-800 bg-neutral-950/95 text-[var(--text-primary)] backdrop-blur-md transition-all duration-500 ease-in-out ${isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}`}>
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="relative mb-8 flex w-full items-center gap-3 border-b border-neutral-700/80 transition-colors focus-within:border-amber-400">
            <Search size={20} strokeWidth={1.25} className="text-neutral-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setDebouncedQuery(query.trim().toLowerCase())
              }}
              placeholder="Search creations, high jewelry, timepieces..."
              className="w-full min-w-0 bg-transparent py-2 font-serif text-xl tracking-wide text-white outline-none placeholder:text-neutral-500"
            />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-neutral-400 hover:text-white"><X size={16} strokeWidth={1.25} /></button>}
          </div>

          {matches.length ? (
            <div className="grid gap-10 py-8 lg:grid-cols-[0.7fr_1.8fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">Popular searches</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Diamond', 'Ice Cube', 'High Jewelry', 'Timepieces'].map((term) => (
                    <button key={term} type="button" onClick={() => setQuery(term)} className="border border-[var(--border-subtle)] px-3 py-2 text-[10px] uppercase tracking-widest hover:border-[var(--accent-gold)]">
                      {term}
                    </button>
                  ))}
                </div>
                <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">Collections</p>
                <ul className="mt-3 space-y-2 text-xs uppercase tracking-widest opacity-75">
                  {collections.map((collection) => <li key={collection}>{collection}</li>)}
                </ul>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">Recommended products</p>
                  <span className="text-[10px] opacity-50">{matches.length} results</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-3">
                  {matches.slice(0, 3).map((product) => (
                    <a key={product.id} href={`/product/${product.id}`} onClick={onClose} className="group">
                      <div className="aspect-square overflow-hidden bg-[var(--bg-primary)]">
                        <img src={product.main_image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <p className="mt-2 truncate font-serif text-xs uppercase tracking-wider">{product.name}</p>
                      <p className="mt-1 truncate text-[10px] uppercase tracking-wider opacity-60">{product.subtitle || product.material || product.category_name || 'Fine Jewelry'}</p>
                      <p className="mt-1 text-xs">{Number(product.price).toLocaleString()} {config.currency_symbol || 'MAD'}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center py-16 text-center">
              <h2 className="font-serif text-2xl uppercase tracking-widest">No results for "{query}"</h2>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
