import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, Mail, Star, X } from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const imageFallback =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000'

function replaceWithFallback(event) {
  if (event.currentTarget.src !== imageFallback) {
    event.currentTarget.src = imageFallback
  }
}

function getCategoryName(product) {
  if (typeof product.category === 'string') return product.category
  return product.category?.name || product.categories?.name || product.category_name || 'Fine Jewelry'
}

function getSpec(product, keys, fallback) {
  const value = keys.map((key) => product[key]).find(Boolean)
  return value || fallback
}

export default function ProductDetailModal({ product, onClose }) {
  const { t } = useLanguage()
  const { config } = useSiteConfig()
  const [activeImage, setActiveImage] = useState(product?.main_image_url || imageFallback)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    if (!product) return undefined

    setActiveImage(product.main_image_url || imageFallback)
    let isMounted = true

    async function fetchReviews() {
      setReviewsLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (!isMounted) return
      if (error) {
        console.warn(`Supabase reviews fallback: ${error.message}`)
        setReviews([])
      } else {
        setReviews(data || [])
      }
      setReviewsLoading(false)
    }

    fetchReviews()
    return () => {
      isMounted = false
    }
  }, [product])

  useEffect(() => {
    if (!product) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, product])

  const gallery = useMemo(
    () => [...new Set([product?.main_image_url, product?.hover_image_url].filter(Boolean))],
    [product],
  )

  if (!product) return null

  const productName = product.name || product.title || t('curatingCreation')
  const reference = product.reference_code || product.reference || product.id
  const price = Number(product.price)
  const whatsappMessage = `Greetings, I would like to inquire about the ${productName} (Ref: ${reference}) listed on ${config.store_name}.`
  const whatsappUrl = `https://wa.me/${config.whatsapp_number}?text=${encodeURIComponent(whatsappMessage)}`
  const emailUrl = `mailto:${config.concierge_email || ''}?subject=${encodeURIComponent(`Private Concierge: ${productName}`)}&body=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 p-4 backdrop-blur-md md:p-8" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
      <button
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <div className="scrollbar-thin relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-none border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-2xl md:flex-row">
        <button
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 transition-all duration-300 ease-out hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
        >
          <X size={20} strokeWidth={1.25} />
        </button>

        <div className="w-full bg-[var(--surface-primary)] p-5 md:w-1/2 md:p-8">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={activeImage}
              alt={productName}
              onError={replaceWithFallback}
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`h-20 w-16 overflow-hidden border transition-all duration-300 ease-out ${
                    activeImage === image
                      ? 'border-[var(--accent-gold)]'
                      : 'border-[var(--border-subtle)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" onError={replaceWithFallback} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full space-y-8 p-6 md:w-1/2 md:p-10 lg:p-14">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] opacity-60">{getCategoryName(product)}</p>
            <h2 id="product-detail-title" className="mt-4 font-serif text-2xl md:text-3xl">{productName}</h2>
            <p className="mt-5 text-sm tracking-[0.12em] text-[var(--accent-gold)]">
              {Number.isFinite(price) ? `${price.toLocaleString()} ${config.currency_symbol || 'MAD'}` : '—'}
            </p>
          </div>

          <p className="max-w-lg text-sm leading-8 opacity-75">
            {product.description || `${t('signatureCreation')} ${config.store_name}.`}
          </p>

          <div className="border-y border-[var(--border-subtle)]">
            {[
              [t('metal'), getSpec(product, ['material', 'materials'], t('preciousMetal'))],
              ['Carat weight', getSpec(product, ['carat_weight', 'carat'], t('availableOnRequest'))],
              ['Reference', reference],
              [t('origin'), getSpec(product, ['origin', 'country_of_origin'], config.location_city)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 border-b border-[var(--border-subtle)] py-3 text-xs last:border-b-0">
                <span className="uppercase tracking-[0.18em] opacity-60">{label}</span>
                <span className="text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-3 bg-[var(--accent-gold)] px-6 py-4 text-center text-xs uppercase tracking-[0.18em] text-[var(--bg-primary)] transition-all duration-300 ease-out hover:opacity-85">
              {t('inquirePrivateConcierge')}
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a href={emailUrl} className="flex items-center justify-center gap-2 border border-[var(--border-subtle)] px-4 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ease-out hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]">
                <Mail size={15} strokeWidth={1.25} /> {t('emailConcierge')}
              </a>
              <a href={`mailto:${config.concierge_email || ''}?subject=${encodeURIComponent(`Appointment request: ${productName}`)}`} className="flex items-center justify-center gap-2 border border-[var(--border-subtle)] px-4 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ease-out hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]">
                <CalendarDays size={15} strokeWidth={1.25} /> {t('bookAppointment')}
              </a>
            </div>
          </div>

          <section className="border-t border-[var(--border-subtle)] pt-6">
            <h3 className="font-serif text-xl">{t('testimonials')}</h3>
            {reviewsLoading ? (
              <p className="mt-4 text-xs opacity-60">{t('curatingTestimonials')}</p>
            ) : reviews.length ? (
              <div className="mt-5 space-y-5">
                {reviews.map((review) => (
                  <blockquote key={review.id} className="border-b border-[var(--border-subtle)] pb-5 last:border-0">
                    <div className="flex gap-1 text-[var(--accent-gold)]">
                      {Array.from({ length: Math.min(5, Math.max(0, Number(review.rating) || 5)) }, (_, index) => (
                        <Star key={index} size={13} fill="currentColor" strokeWidth={1.25} />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-7 opacity-80">“{review.comment || review.content}”</p>
                    <footer className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] opacity-60">
                      {review.reviewer_name || review.name || t('privateClient')}
                      <span className="inline-flex items-center gap-1 text-[var(--accent-gold)]"><Check size={12} strokeWidth={1.25} /> {t('verified')}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 opacity-60">{t('firstTestimonial')}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
