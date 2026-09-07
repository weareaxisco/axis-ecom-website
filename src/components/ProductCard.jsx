import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Heart, ShoppingBag } from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'

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

export default function ProductCard({ product, onSelect }) {
  const { config } = useSiteConfig()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const images = useMemo(
    () => [...new Set([product.main_image_url, product.hover_image_url].filter(Boolean))],
    [product.main_image_url, product.hover_image_url],
  )
  const gallery = images.length ? images : [cardImageFallback]
  const categoryName = getCategoryName(product)
  const price = Number(product.price)
  const formattedPrice = Number.isFinite(price) ? price.toLocaleString() : '—'

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product.id, gallery.length])

  useEffect(() => {
    if (!isHovered || gallery.length < 2) return undefined

    const interval = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % gallery.length)
    }, 2500)

    return () => window.clearInterval(interval)
  }, [gallery.length, isHovered])

  const changeImage = (direction) => {
    setActiveImageIndex(
      (currentIndex) => (currentIndex + direction + gallery.length) % gallery.length,
    )
  }

  return (
    <article
      className="group overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-primary)] transition-all duration-300 ease-out hover:shadow-lg"
      onClick={() => onSelect?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface-primary)]">
        {gallery.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={index === 0 ? product.name || 'Jewelry creation' : ''}
            aria-hidden={index !== 0}
            onError={replaceWithFallback}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              activeImageIndex === index
                ? 'scale-105 opacity-100'
                : 'scale-100 opacity-0'
            }`}
          />
        ))}

        <button
          type="button"
          aria-label={`Add ${product.name || 'creation'} to wishlist`}
          onClick={(event) => event.stopPropagation()}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center text-[var(--text-primary)] opacity-0 transition-all duration-300 ease-out hover:text-[var(--accent-gold)] group-hover:opacity-100"
        >
          <Heart size={19} strokeWidth={1.25} />
        </button>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={(event) => {
                event.stopPropagation()
                changeImage(-1)
              }}
              className="absolute left-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white opacity-0 transition-all duration-300 ease-out hover:text-[var(--accent-gold)] group-hover:opacity-100"
            >
              <ChevronLeft size={19} strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={(event) => {
                event.stopPropagation()
                changeImage(1)
              }}
              className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white opacity-0 transition-all duration-300 ease-out hover:text-[var(--accent-gold)] group-hover:opacity-100"
            >
              <ChevronRight size={19} strokeWidth={1.25} />
            </button>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-1 px-4 pb-16 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100">
          {gallery.map((image, index) => (
            <span
              key={`${image}-indicator`}
              className={`h-[2px] flex-1 transition-all duration-300 ${
                index === activeImageIndex
                  ? 'bg-[var(--accent-gold)]'
                  : 'bg-[var(--text-primary)]/40'
              }`}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center justify-center gap-2 bg-[var(--bg-primary)]/95 px-4 py-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(product)
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 border border-[var(--accent-gold)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)] transition-all duration-300 ease-out hover:bg-[var(--accent-gold)] hover:text-[var(--bg-primary)]"
          >
            <Eye size={15} strokeWidth={1.25} />
            Discover
          </button>
          <button
            type="button"
            aria-label={`Add ${product.name || 'creation'} to shopping bag`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-9 w-9 items-center justify-center border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all duration-300 ease-out hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
          >
            <ShoppingBag size={16} strokeWidth={1.25} />
          </button>
        </div>
      </div>

      <div className="space-y-2 p-4 text-left">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-primary)] opacity-60">
          {categoryName}
        </p>
        <h3 className="font-serif text-sm tracking-wide text-[var(--text-primary)] md:text-base">
          {product.name || product.title || 'Untitled creation'}
        </h3>
        <p className="text-xs tracking-[0.08em] text-[var(--text-primary)] opacity-80">
          {config.currency_symbol || 'MAD'} {formattedPrice}
        </p>
      </div>
    </article>
  )
}
