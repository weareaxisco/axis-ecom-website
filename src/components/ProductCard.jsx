import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSiteConfig } from '../context/ConfigContext'
import ImageWithSkeleton from './ImageWithSkeleton'
import { useWishlist } from '../context/WishlistContext'
import { useLanguage } from '../context/LanguageContext'
import { getProductPrice } from '../utils/productUtils'

const cardImageFallback =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000'

function getCategoryName(product) {
  if (typeof product.category === 'string') return product.category
  return product.category?.name || product.categories?.name || product.category_name || 'Fine Jewelry'
}

function replaceWithFallback(event) {
  if (event.currentTarget.src !== cardImageFallback) {
    event.currentTarget.src = cardImageFallback
  }
}

function normalizeImages(product) {
  const configured = Array.isArray(product.images) ? product.images : []
  const images = configured.map((image) => typeof image === 'string' ? image : image?.url || image?.src || image?.path).filter(Boolean)
  return [...new Set([...images, product.main_image_url, product.hover_image_url].filter(Boolean))]
}

export default function ProductCard({ product, onProductClick }) {
  const { config } = useSiteConfig()
  const { t } = useLanguage()
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const cardRef = useRef(null)
  const touchStartX = useRef(null)
  const images = useMemo(() => normalizeImages(product), [product.images, product.main_image_url, product.hover_image_url])
  const gallery = images.length ? images : [cardImageFallback]
  const categoryName = getCategoryName(product)
  const formattedPrice = getProductPrice(product).toLocaleString()
  const isWishlisted = wishlistItems.some((item) => String(item.id) === String(product.id))

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product.id, gallery.length])

  useEffect(() => {
    if (!isHovered || gallery.length < 2) return undefined

    const interval = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % gallery.length)
    }, 2500)

    return () => window.clearInterval(interval)
  }, [gallery.length, isHovered, timerKey])

  useEffect(() => {
    const element = cardRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsHovered(true)
      else setIsHovered(false)
    }, { threshold: 0.65 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const changeImage = (direction) => {
    setTimerKey((key) => key + 1)
    setActiveImageIndex(
      (currentIndex) => (currentIndex + direction + gallery.length) % gallery.length,
    )
  }

  return (
    <article
      ref={cardRef}
      className="group mx-auto w-[92vw] max-w-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-primary)] transition-all duration-300 ease-out hover:shadow-lg md:w-full"
      onClick={() => onProductClick ? onProductClick(product) : navigate(`/product/${product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full max-w-full overflow-hidden bg-[var(--surface-primary)]" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX }} onTouchEnd={(event) => { if (touchStartX.current === null) return; const distance = event.changedTouches[0].clientX - touchStartX.current; if (Math.abs(distance) > 35 && gallery.length > 1) changeImage(distance < 0 ? 1 : -1); touchStartX.current = null }}>
        {product.is_new && (
          <span className="absolute left-4 top-4 z-10 text-[10px] uppercase tracking-[0.2em] text-white">
        {t('new')}
          </span>
        )}
        <ImageWithSkeleton
          key={`${gallery[activeImageIndex]}-${activeImageIndex}`}
          src={gallery[activeImageIndex]}
          alt={product.name || t('jewelryCreation')}
          onError={replaceWithFallback}
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        <button
          type="button"
          aria-label={`${isWishlisted ? t('remove') : t('addToWishlist')} ${product.name || 'creation'} ${t('wishlist')}`}
          onClick={(event) => {
            event.stopPropagation()
            if (isWishlisted) removeFromWishlist(product.id)
            else addToWishlist(product)
          }}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 p-2 backdrop-blur-md transition-transform duration-300 ease-out hover:scale-110"
        >
          <Heart
            size={19}
            strokeWidth={1.25}
            className={
              isWishlisted
                ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                : 'text-white/80 hover:text-white'
            }
          />
        </button>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t('previousProductImage')}
              onClick={(event) => {
                event.stopPropagation()
                changeImage(-1)
              }}
              className="absolute left-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white opacity-100 transition-all duration-300 ease-out hover:text-[var(--accent-gold)] md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft size={19} strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label={t('nextProductImage')}
              onClick={(event) => {
                event.stopPropagation()
                changeImage(1)
              }}
              className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white opacity-100 transition-all duration-300 ease-out hover:text-[var(--accent-gold)] md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight size={19} strokeWidth={1.25} />
            </button>
          </>
        )}

        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {gallery.map((image, index) => (
            <button
              type="button"
              key={`${image}-indicator`}
              aria-label={`Show product image ${index + 1}`}
              onClick={(event) => { event.stopPropagation(); setActiveImageIndex(index); setTimerKey((key) => key + 1) }}
              className={`transition-all duration-300 ${
                index === activeImageIndex
                  ? 'h-[2px] w-8 rounded-full bg-[var(--text-primary)]'
                  : 'h-1.5 w-1.5 rounded-full bg-gray-400/50'
              }`}
            />
          ))}
        </div>

      </div>

      <div className="hidden space-y-2 p-4 text-left md:block">
        <p className="font-serif text-xs uppercase tracking-widest text-[var(--text-primary)]">
          {product.collection_name || categoryName}
        </p>
        <div className="relative flex h-10 items-center">
          <p className="flex items-center text-xs uppercase tracking-[0.12em] text-[var(--text-primary)] opacity-60 transition-all duration-200 group-hover:-translate-y-2 group-hover:opacity-0">
            {product.subtitle || product.material || categoryName}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (onProductClick) onProductClick(product)
              else navigate(`/product/${product.id}`)
            }}
            className="absolute inset-x-0 flex h-10 items-center justify-center bg-black py-2.5 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-black"
          >
            {t('discover')}
          </button>
        </div>
        <p className="text-xs tracking-[0.08em] text-[var(--text-primary)] opacity-80">
          {t('priceInDh')}: {formattedPrice} {config.currency_symbol || 'MAD'}
        </p>
      </div>
      <div className="space-y-1 p-3 text-left md:hidden">
        <p className="mt-2 truncate text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          {product.subtitle || product.material || categoryName}
        </p>
        <p className="truncate font-serif text-sm font-medium uppercase text-[var(--text-primary)]">
          {product.collection_name || product.name || categoryName}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
          {t('priceInDh')}: {formattedPrice} {config.currency_symbol || 'MAD'}
        </p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/product/${product.id}`)
          }}
          className="mt-3 flex min-h-11 w-full items-center justify-center border border-[var(--text-primary)] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-primary)] transition-colors active:bg-[var(--text-primary)] active:text-[var(--surface-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--surface-primary)]"
        >
          {t('discover')}
        </button>
      </div>
    </article>
  )
}
