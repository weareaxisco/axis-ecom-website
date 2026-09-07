import { Eye, Heart, ShoppingBag } from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'

const cardImageFallback =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85'

function getCategoryName(product) {
  if (typeof product.category === 'string') return product.category
  return product.category?.name || product.categories?.name || product.category_name || 'Fine Jewelry'
}

export default function ProductCard({ product, onSelect }) {
  const { config } = useSiteConfig()
  const categoryName = getCategoryName(product)
  const price = Number(product.price)
  const formattedPrice = Number.isFinite(price) ? price.toLocaleString() : '—'

  return (
    <article className="group overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-primary)] transition-all duration-300 ease-out hover:shadow-lg" onClick={() => onSelect?.(product)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface-primary)]">
        <img
          src={product.main_image_url || product.image_url}
          alt={product.name || 'Jewelry creation'}
          onError={(event) => {
            event.currentTarget.src = cardImageFallback
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {product.hover_image_url && (
          <img
            src={product.hover_image_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-center gap-2 bg-[var(--bg-primary)]/90 px-4 py-3 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Quick view ${product.name || 'creation'}`}
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(product)
            }}
            className="inline-flex items-center gap-2 border border-[var(--border-subtle)] px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-[var(--text-primary)] transition-all duration-300 ease-out hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
          >
            <Eye size={15} strokeWidth={1.25} />
            Quick View
          </button>
          <button
            type="button"
            aria-label={`Add ${product.name || 'creation'} to wishlist`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-9 w-9 items-center justify-center border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all duration-300 ease-out hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
          >
            <Heart size={16} strokeWidth={1.25} />
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
