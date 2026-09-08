import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ProductCard from './ProductCard'
import SortFilterDrawer, { createInitialSelection } from './SortFilterDrawer'
import { getProductPrice } from '../utils/productUtils'
import { useLanguage } from '../context/LanguageContext'

const calculateCollectionProgress = (sectionElement, stickyOffset, headerHeight = 44) => {
  if (!sectionElement) return 0
  const rect = sectionElement.getBoundingClientRect()
  const scrolledDistance = stickyOffset - rect.top
  const maxScrollableRange = rect.height - headerHeight
  if (maxScrollableRange <= 0) return 0
  return Math.min(1, Math.max(0, scrolledDistance / maxScrollableRange))
}

const filterOptions = ['All', 'High Jewelry', 'Rings', 'Bracelets', 'Timepieces']
const sortOptions = ['featured', 'low', 'high']

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

function getProductFacetValue(product, facetId) {
  const values = {
    category: getProductCategory(product),
    metal: product.metal || product.metal_type || product.material || '',
    novelties: product.is_new || product.isNew || product.novelty ? 'Yes' : '',
    gender: product.gender || '',
    shape: product.shape || '',
  }
  return String(values[facetId] || '').toLowerCase()
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
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const filterLabels = { All: t('all'), 'High Jewelry': t('highJewelry'), Rings: t('rings'), Bracelets: t('bracelets'), Timepieces: t('timepieces') }
  const sortLabels = { featured: t('featured'), low: t('priceLowHigh'), high: t('priceHighLow') }
  const [sortOrder, setSortOrder] = useState('featured')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [targetCollectionId, setTargetCollectionId] = useState(null)
  const [collectionFilters, setCollectionFilters] = useState({})
  const [isSticky, setIsSticky] = useState(false)
  const [scrollDirection, setScrollDirection] = useState('up')
  const [scrollY, setScrollY] = useState(0)
  const [collectionProgress, setCollectionProgress] = useState({})
  const sortMenuRef = useRef(null)
  const filterBarRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const filterOffsetTopRef = useRef(0)
  const scrollFrameRef = useRef(null)
  const collectionRefs = useRef({})

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
      setScrollDirection(nextDirection)
      setScrollY(currentScrollY)
      setIsSticky(currentScrollY > filterOffsetTopRef.current && !nearTop)
      lastScrollYRef.current = currentScrollY
      const nextCollectionProgress = {}
      Object.entries(collectionRefs.current).forEach(([collectionId, section]) => {
        if (!section) return
        const stickyOffset = nextDirection === 'up'
          ? (window.innerWidth >= 768 ? 152 : 104)
          : 0
        nextCollectionProgress[collectionId] = calculateCollectionProgress(section, stickyOffset)
      })
      setCollectionProgress(nextCollectionProgress)
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
      const category = getProductCategory(product).toLowerCase()
      const collection = getProductCollection(product).toLowerCase()
      const filter = activeFilter.toLowerCase()
      const matchesCategory = activeFilter === 'All' || category === filter || collection === filter || category.includes(filter)
      if (!matchesCategory) return false
      return Object.entries(createInitialSelection()).every(([facetId]) => {
        const selectedValues = collectionFilters.all?.[facetId]
        if (facetId === 'sort' || !selectedValues?.length) return true
        const productValue = getProductFacetValue(product, facetId)
        return selectedValues.some((value) => productValue.includes(value.toLowerCase()))
      })
    })

    return [...filtered].sort((first, second) => {
      if (sortOrder === 'low') return getProductPrice(first) - getProductPrice(second)
      if (sortOrder === 'high') return getProductPrice(second) - getProductPrice(first)
      return Number(first.display_order ?? first.sort_order ?? 0) - Number(second.display_order ?? second.sort_order ?? 0)
    })
  }, [activeFilter, collectionFilters, products, sortOrder])

  const resetFilters = () => {
    setActiveFilter('All')
    setSortOrder('featured')
    setCollectionFilters({})
  }

  const applyDrawerSelection = (selection, collectionId) => {
    setCollectionFilters((current) => ({ ...current, [collectionId || 'all']: selection }))
    if (selection.sort === 'recommended') setSortOrder('featured')
  }

  const collections = useMemo(() => {
    const grouped = new Map()
    visibleProducts.forEach((product) => {
      const rawTitle = getProductCollection(product) || getProductCategory(product) || 'Our Jewellery Universe'
      const normalizedTitle = rawTitle.toLowerCase()
      const title = normalizedTitle.includes('happy heart')
        ? 'Happy Hearts'
        : normalizedTitle.includes('ice cube')
          ? 'Ice Cube'
          : normalizedTitle.includes('high jewelry')
            ? 'High Jewelry'
            : rawTitle
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      if (!grouped.has(id)) grouped.set(id, { id, title, products: [] })
      const selection = collectionFilters[id]
      const matchesCollection = !selection || Object.entries(selection).every(([facetId, selectedValues]) => {
        if (facetId === 'sort' || !selectedValues?.length) return true
        return selectedValues.some((value) => getProductFacetValue(product, facetId).includes(value.toLowerCase()))
      })
      if (matchesCollection) grouped.get(id).products.push(product)
    })
    return [...grouped.values()].map((collection) => {
      const selection = collectionFilters[collection.id]
      if (!selection || selection.sort === 'recommended') return collection
      const productsForCollection = [...collection.products]
      if (selection.sort === 'name_asc') {
        productsForCollection.sort((first, second) => String(first.name || '').localeCompare(String(second.name || '')))
      } else if (selection.sort === 'name_desc') {
        productsForCollection.sort((first, second) => String(second.name || '').localeCompare(String(first.name || '')))
      }
      return { ...collection, products: productsForCollection }
    })
  }, [collectionFilters, visibleProducts])

  return (
    <section id="high-jewelry" className="bg-[var(--bg-primary)] px-4 py-20 text-[var(--text-primary)] md:px-12 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[var(--accent-gold)]">
            {t('theCollection')}
          </p>
          <h2 className="font-serif text-3xl tracking-wide md:text-5xl">{t('curatedCreations')}</h2>
          <div ref={filterBarRef} className={isSticky ? 'h-12 md:h-14' : 'h-14'}>
            <div
              className={`relative mx-auto hidden w-full max-w-5xl border-y border-[var(--border-subtle)] bg-[var(--surface-primary)] md:transition-[top] md:duration-300 md:ease-in-out md:block ${
                isSticky
                  ? 'sticky z-30 shadow-md top-[var(--mobile-navbar-offset)] md:top-[var(--desktop-navbar-offset)]'
                  : ''
              }`}
            >
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
                      {filterLabels[filter] || filter}
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
                {sortLabels[sortOrder]}
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
                      key={option}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSortOrder(option)
                        setIsSortOpen(false)
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-left text-xs uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/10 hover:text-[var(--accent-gold)]"
                    >
                      {sortLabels[option]}
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
        ) : collections.length > 0 ? (
          <div>
            {collections.map((collection) => (
              <section
                key={collection.id}
                ref={(element) => {
                  collectionRefs.current[collection.id] = element
                }}
                className="relative mb-16"
              >
                <div className="sticky top-[var(--mobile-navbar-offset)] z-30 border-b border-white/10 bg-[var(--surface-primary)] md:top-[var(--desktop-navbar-offset)] md:transition-[top] md:duration-300 md:ease-in-out">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="font-serif text-xs font-medium uppercase tracking-widest">{collection.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] tracking-wider text-neutral-400">({collection.products.length})</span>
                      <button
                        type="button"
                        aria-label={`${t('filter')} ${collection.title}`}
                        onClick={() => {
                          setTargetCollectionId(collection.id)
                          setIsFilterDrawerOpen(true)
                        }}
                        className="text-neutral-400 transition-colors hover:text-[var(--accent-gold)]"
                      >
                        <Filter size={16} strokeWidth={1.25} />
                      </button>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-[var(--accent-gold)] will-change-transform"
                    style={{ transform: `scaleX(${collectionProgress[collection.id] || 0})` }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collection.products.map((product) => (
                    <ProductCard key={product.id || product.slug || product.name} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="border border-[var(--border-subtle)] px-6 py-20 text-center">
            <p className="font-serif text-xl">{t('noCreationsFound')}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 border-b border-[var(--accent-gold)] pb-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]"
            >
              {t('resetFilters')}
            </button>
          </div>
        )}
        {error && products.length === 0 && !loading && (
          <p className="mt-6 text-center text-xs opacity-60">
            {t('catalogRefreshing')}
          </p>
        )}
      </div>
      <SortFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        activeSelection={collectionFilters[targetCollectionId] || createInitialSelection()}
        onApply={applyDrawerSelection}
        targetCollectionId={targetCollectionId}
      />
    </section>
  )
}
