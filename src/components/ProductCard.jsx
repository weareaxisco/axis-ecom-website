import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

export default function ProductCard({ product }) {
  const { config } = useSiteConfig()
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
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
  }, [gallery.length, isHovered, timerKey])

  const changeImage = (direction) => {
    setTimerKey((key) => key + 1)
    setActiveImageIndex(
      (currentIndex) => (currentIndex + direction + gallery.length) % gallery.length,
    )
  }

  return (
    <article
      className="group overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-primary)] transition-all duration-300 ease-out hover:shadow-lg"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface-primary)]">
        {product.is_new && (
          <span className="absolute left-4 top-4 z-10 text-[10px] uppercase tracking-[0.2em] text-white">
            New
          </span>
        )}
        {gallery.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={index === 0 ? product.name || 'Jewelry creation' : ''}
            aria-hidden={index !== 0}
            onError={replaceWithFallback}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              activeImageIndex === index
                ? 'scale-100 opacity-100 group-hover:scale-[1.03]'
                : 'scale-100 opacity-0'
            }`}
          />
        ))}

        <button
          type="button"
          aria-label={`Add ${product.name || 'creation'} to wishlist`}
          onClick={(event) => {
            event.stopPropagation()
            setIsWishlisted((current) => !current)
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

        <div className="absolute inset-x-0 bottom-14 z-10 flex items-center justify-center gap-2 transition-all duration-300">
          {gallery.map((image, index) => (
            <span
              key={`${image}-indicator`}
              className={`transition-all duration-300 ${
                index === activeImageIndex
                  ? 'h-1 w-8 rounded-full bg-[var(--text-primary)]'
                  : 'h-1.5 w-1.5 rounded-sm bg-gray-400/50 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>

      <div className="space-y-2 p-4 text-left">
        <p className="font-serif text-xs uppercase tracking-widest text-[var(--text-primary)]">
          {product.collection_name || categoryName}
        </p>
        <div className="relative flex h-10 items-center">
          <p className="flex items-center text-xs uppercase tracking-[0.12em] text-[var(--text-primary)] opacity-60 transition-all duration-200 group-hover:-translate-y-2 group-hover:opacity-0">
            {product.subtitle || product.material || categoryName}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/product/${product.id}`)}
            className="absolute inset-x-0 flex h-10 items-center justify-center bg-black py-2.5 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-black"
          >
            Discover
          </button>
        </div>
        <p className="text-xs tracking-[0.08em] text-[var(--text-primary)] opacity-80">
          {config.currency_symbol || 'MAD'} {formattedPrice}
        </p>
      </div>
    </article>
  )
}
