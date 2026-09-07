import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { mockProducts } from './ProductCatalog'
import { supabase } from '../supabaseClient'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim().toLowerCase()
  const [products, setProducts] = useState(mockProducts)

  useEffect(() => {
    let active = true
    supabase.from('products').select('*, categories(*), collections(*)').then(({ data, error }) => {
      if (!active) return
      if (error) console.warn(`Search results fallback: ${error.message}`)
      if (data?.length) setProducts(data)
    })
    return () => { active = false }
  }, [])

  const matches = useMemo(() => products.filter((product) => JSON.stringify(product).toLowerCase().includes(query)), [products, query])

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">Search results</p>
        <h1 className="mt-3 font-serif text-3xl uppercase tracking-widest md:text-5xl">“{query}”</h1>
        <p className="mt-3 text-xs uppercase tracking-widest opacity-60">{matches.length} creations</p>
        {matches.length ? <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{matches.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="mt-12 opacity-60">No creations found.</p>}
      </div>
    </main>
  )
}
