import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProductCard from './ProductCard'
import ProductDetailModal from './ProductDetailModal'

const filterOptions = ['All', 'High Jewelry', 'Rings', 'Bracelets', 'Timepieces']

const mockProducts = [
  {
    id: 'mock-ice-cube-ring',
    name: 'Ice Cube Eternity Ring',
    category_name: 'High Jewelry',
    price: 185000,
    main_image_url:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
    hover_image_url:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85',
    display_order: 1,
  },
  {
    id: 'mock-emerald-necklace',
    name: 'Emerald Cascade Necklace',
    category_name: 'High Jewelry',
    price: 320000,
    main_image_url:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
    hover_image_url:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85',
    display_order: 2,
  },
  {
    id: 'mock-solitaire-ring',
    name: 'Lumière Solitaire Ring',
    category_name: 'Rings',
    price: 98000,
    main_image_url:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85',
    hover_image_url:
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=85',
    display_order: 3,
  },
  {
    id: 'mock-gold-bracelet',
    name: 'Mille Miglia Bracelet',
    category_name: 'Bracelets',
    price: 74000,
    main_image_url:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85',
    hover_image_url:
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=85',
    display_order: 4,
  },
  {
    id: 'mock-timepiece',
    name: 'L.U.C Heritage Timepiece',
    category_name: 'Timepieces',
    price: 156000,
    main_image_url:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
    hover_image_url:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    display_order: 5,
  },
  {
    id: 'mock-diamond-earrings',
    name: 'Precious Lace Earrings',
    category_name: 'Fine Jewelry',
    price: 112000,
    main_image_url:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
    hover_image_url:
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85',
    display_order: 6,
  },
]

function getRelatedName(value) {
  if (typeof value === 'string') return value
  return value?.name || ''
}

function getProductCategory(product) {
  return (
    getRelatedName(product.category) ||
    getRelatedName(product.categories) ||
    product.category_name ||
    ''
  )
}

function getProductCollection(product) {
  return (
    getRelatedName(product.collection) ||
    getRelatedName(product.collections) ||
    product.collection_name ||
    ''
  )
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
      <div className="aspect-[3/4] bg-[var(--border-subtle)]/40" />
      <div className="space-y-3 p-4">
        <div className="h-2 w-1/3 bg-[var(--border-subtle)]/60" />
        <div className="h-4 w-2/3 bg-[var(--border-subtle)]/60" />
        <div className="h-3 w-1/4 bg-[var(--border-subtle)]/60" />
      </div>
    </div>
  )
}

export default function ProductCatalog() {
  const [products, setProducts] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('featured')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCatalog() {
      setLoading(true)
      setError(null)

      const [categoryResult, collectionResult] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('collections').select('*'),
      ])
      let productResult = await supabase
        .from('products')
        .select('*, categories(*), collections(*)')

      if (productResult.error) {
        productResult = await supabase.from('products').select('*')
      }

      if (!isMounted) return

      const firstError = categoryResult.error || collectionResult.error || productResult.error
      if (firstError) {
        console.warn(`Supabase catalog fallback: ${firstError.message}`)
        setError(firstError.message)
      }

      if (productResult.data?.length) {
        setProducts(productResult.data)
      } else {
        console.warn('Supabase catalog returned no products; showing luxury fallback creations.')
        setProducts(mockProducts)
      }
      setLoading(false)
    }

    fetchCatalog()
    return () => {
      isMounted = false
    }
  }, [])

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (activeFilter === 'All') return true
      const category = getProductCategory(product).toLowerCase()
      const collection = getProductCollection(product).toLowerCase()
      const filter = activeFilter.toLowerCase()
      return category === filter || collection === filter || category.includes(filter)
    })

    return [...filtered].sort((first, second) => {
      if (sortOrder === 'low') return Number(first.price) - Number(second.price)
      if (sortOrder === 'high') return Number(second.price) - Number(first.price)
      return Number(first.display_order ?? first.sort_order ?? 0) - Number(second.display_order ?? second.sort_order ?? 0)
    })
  }, [activeFilter, products, sortOrder])

  const resetFilters = () => {
    setActiveFilter('All')
    setSortOrder('featured')
  }

  return (
    <section id="high-jewelry" className="bg-[var(--bg-primary)] px-4 py-20 text-[var(--text-primary)] md:px-12 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[var(--accent-gold)]">
            The Collection
          </p>
          <h2 className="font-serif text-3xl tracking-wide md:text-5xl">Curated Creations</h2>
          <div className="mx-auto mt-8 flex max-w-5xl flex-col items-center justify-center gap-6 border-y border-[var(--border-subtle)] py-5 md:flex-row">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`relative pb-1 text-[10px] uppercase tracking-[0.18em] transition-all duration-300 ease-out ${
                    activeFilter === filter
                      ? 'text-[var(--accent-gold)]'
                      : 'text-[var(--text-primary)] opacity-60 hover:text-[var(--accent-gold)] hover:opacity-100'
                  }`}
                >
                  {filter}
                  {activeFilter === filter && (
                    <span className="absolute inset-x-0 -bottom-px h-px bg-[var(--accent-gold)]" />
                  )}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] opacity-70">
              <span className="sr-only">Sort creations</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="bg-transparent py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-primary)] outline-none"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-10">
            {Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-10">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id || product.slug || product.name}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="border border-[var(--border-subtle)] px-6 py-20 text-center">
            <p className="font-serif text-xl">No creations found matching your selection</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 border-b border-[var(--accent-gold)] pb-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]"
            >
              Reset filters
            </button>
          </div>
        )}
        {error && products.length === 0 && !loading && (
          <p className="mt-6 text-center text-xs opacity-60">
            Catalog inventory is being refreshed. Please return shortly.
          </p>
        )}
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}
