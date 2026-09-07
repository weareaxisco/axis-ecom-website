import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ProductCard from './ProductCard'

const filterOptions = ['All', 'High Jewelry', 'Rings', 'Bracelets', 'Timepieces']
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'low', label: 'Price: Low to High' },
  { value: 'high', label: 'Price: High to Low' },
]

export const mockProducts = [
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
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [scrollDirection, setScrollDirection] = useState('up')
  const [scrollProgress, setScrollProgress] = useState(0)
  const sortMenuRef = useRef(null)
  const filterBarRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const filterOffsetTopRef = useRef(0)
  const scrollFrameRef = useRef(null)

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

  useEffect(() => {
    const updateFilterOffset = () => {
      if (filterBarRef.current) {
        filterOffsetTopRef.current =
          filterBarRef.current.getBoundingClientRect().top + window.scrollY
      }
    }

    const updateScrollState = () => {
      const currentScrollY = window.scrollY
      const nearTop = currentScrollY <= 20
      const scrollingUp = currentScrollY < lastScrollYRef.current
      const nextDirection = scrollingUp ? 'up' : 'down'
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = scrollHeight > 0 ? currentScrollY / scrollHeight : 0

      setScrollDirection(nextDirection)
      setScrollProgress(Math.min(1, Math.max(0, nextProgress)))
      setIsSticky(currentScrollY > filterOffsetTopRef.current && !nearTop)
      lastScrollYRef.current = currentScrollY
      scrollFrameRef.current = null
    }

    const handleScroll = () => {
      if (scrollFrameRef.current === null) {
        scrollFrameRef.current = window.requestAnimationFrame(updateScrollState)
      }
    }

    updateFilterOffset()
    updateScrollState()
    lastScrollYRef.current = window.scrollY
    window.addEventListener('resize', updateFilterOffset)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', updateFilterOffset)
      window.removeEventListener('scroll', handleScroll)
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!sortMenuRef.current?.contains(event.target)) setIsSortOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
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
          <div ref={filterBarRef} className={isSticky ? 'h-12 md:h-14' : 'h-14'}>
            <div
              className={`relative mx-auto w-full max-w-5xl border-y border-[var(--border-subtle)] bg-[var(--surface-primary)] transition-[top] duration-300 ease-in-out ${
                isSticky
                  ? `sticky z-30 shadow-md ${scrollDirection === 'up' ? 'top-14' : 'top-0'}`
                  : ''
              }`}
            >
              <div className="md:hidden">
                <button
                  type="button"
                  aria-expanded={isCategoryOpen}
                  onClick={() => setIsCategoryOpen((open) => !open)}
                  className="flex w-full items-center justify-between bg-[var(--surface-primary)] px-4 py-3 text-xs font-medium uppercase tracking-widest"
                >
                  {activeFilter === 'All' ? 'Our Jewellery Universe' : activeFilter}
                  {isCategoryOpen ? <ChevronUp size={15} strokeWidth={1.25} /> : <ChevronDown size={15} strokeWidth={1.25} />}
                </button>
                {isCategoryOpen && (
                  <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-primary)]">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setActiveFilter(filter)
                          setIsCategoryOpen(false)
                        }}
                        className="block w-full border-b border-[var(--border-subtle)] px-4 py-3 text-left text-xs uppercase tracking-widest text-[var(--text-primary)] last:border-b-0"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-[var(--accent-gold)] will-change-transform transition-transform duration-75"
                  style={{ transform: `scaleX(${scrollProgress})` }}
                />
              </div>
              <div className="hidden items-center justify-between gap-6 px-4 py-5 md:flex md:px-12">
                <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-center gap-6 overflow-x-auto whitespace-nowrap">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`relative text-[11px] font-medium uppercase leading-none tracking-[0.18em] transition-colors duration-200 md:text-xs ${
                        activeFilter === filter
                          ? 'border-b-2 border-[var(--accent-gold)] pb-1 text-[var(--text-primary)]'
                          : 'text-[var(--text-primary)] opacity-60 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div ref={sortMenuRef} className="relative shrink-0">
              <button
                type="button"
                aria-expanded={isSortOpen}
                aria-haspopup="menu"
                onClick={() => setIsSortOpen((open) => !open)}
                className="flex items-center gap-1 border-b-2 border-transparent px-2 py-1 text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[var(--text-primary)] opacity-60 transition-colors duration-200 hover:text-[var(--text-primary)] md:text-xs"
              >
                {sortOptions.find((option) => option.value === sortOrder)?.label}
                <ChevronDown
                  size={12}
                  strokeWidth={1.25}
                  className={`text-[var(--text-primary)] opacity-60 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 z-30 mt-2 w-48 border border-[var(--border-subtle)] bg-[var(--surface-primary)] py-2 shadow-2xl backdrop-blur-md">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSortOrder(option.value)
                        setIsSortOpen(false)
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-left text-xs uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/10 hover:text-[var(--accent-gold)]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-10">
            {Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-10">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id || product.slug || product.name} product={product} />
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
    </section>
  )
}
