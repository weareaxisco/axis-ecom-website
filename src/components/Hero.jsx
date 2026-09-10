import { ArrowRight, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSiteConfig } from '../context/ConfigContext'
import { useLanguage } from '../context/LanguageContext'

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=90'
const secondaryHeroImage =
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2400&q=90'

export default function Hero() {
  const { config, loading } = useSiteConfig()
  const { t } = useLanguage()
  const [activeSlide, setActiveSlide] = useState(0)
  const touchStartX = useRef(null)
  const heroImages = [config.hero_image_url || fallbackHeroImage, secondaryHeroImage]
  const headline = config.hero_title || config.store_name
  const description =
    config.hero_description ||
    config.brand_tagline ||
    `Discover the ${config.store_name} perspective on modern luxury.`

  const showSlide = (index) => {
    setActiveSlide((index + heroImages.length) % heroImages.length)
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const distance = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < 50) return
    showSlide(activeSlide + (distance < 0 ? 1 : -1))
  }

  return (
    <section
      className="relative flex h-[85vh] w-full touch-pan-y items-center justify-center overflow-hidden md:h-[92vh]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={heroImages[activeSlide]}
        alt={headline}
        className="absolute inset-0 h-full w-full scale-105 object-cover motion-safe:animate-[hero-pulse_16s_ease-in-out_infinite_alternate]"
      />
      <div className="absolute inset-0 bg-[var(--bg-primary)]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]/30" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center text-[var(--text-primary)]">
        <div className="mb-4 flex items-center gap-2 font-light uppercase tracking-[0.3em] text-xs text-[var(--accent-gold)] md:text-sm">
          <Sparkles aria-hidden="true" size={14} strokeWidth={1.25} />
          <span>{loading ? config.brand_tagline : config.brand_tagline || config.location_city}</span>
        </div>
        <h1 className="max-w-4xl font-serif text-3xl font-normal leading-tight tracking-wide md:text-6xl lg:text-7xl">
          {headline}
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 opacity-80 md:text-base">
          {description}
        </p>
        <div className="mt-9 flex items-center justify-center">
          <a
            href="/catalog"
            className="group inline-flex items-center gap-3 border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-8 py-4 text-xs uppercase tracking-[0.2em] text-[var(--bg-primary)] transition-all duration-300 ease-out hover:bg-transparent hover:text-[var(--accent-gold)]"
          >
            {t('exploreHighJewelry')}
            <ArrowRight
              aria-hidden="true"
              size={16}
              strokeWidth={1.25}
              className="transition-transform duration-300 ease-out group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3" aria-label="Hero slides">
        {heroImages.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Show hero slide ${index + 1}`}
            aria-current={activeSlide === index ? 'true' : undefined}
            onClick={() => showSlide(index)}
            className={`h-1 transition-all duration-300 ${activeSlide === index ? 'w-8 bg-[var(--accent-gold)]' : 'w-4 bg-[var(--text-primary)]/50'}`}
          />
        ))}
      </div>
    </section>
  )
}
