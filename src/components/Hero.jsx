import { ArrowRight, Sparkles } from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'
import { useLanguage } from '../context/LanguageContext'

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=90'

export default function Hero() {
  const { config, loading } = useSiteConfig()
  const { t } = useLanguage()
  const heroImage = config.hero_image_url || fallbackHeroImage
  const headline = config.hero_title || config.store_name
  const description =
    config.hero_description ||
    config.brand_tagline ||
    `Discover the ${config.store_name} perspective on modern luxury.`
  const conciergeUrl = config.whatsapp_number
    ? `https://wa.me/${config.whatsapp_number}`
    : `tel:${config.phone_number}`

  return (
    <section className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden md:h-[92vh]">
      <img
        src={heroImage}
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
        <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row">
          <a
            href="#high-jewelry"
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
          <a
            href={conciergeUrl}
            target={config.whatsapp_number ? '_blank' : undefined}
            rel={config.whatsapp_number ? 'noreferrer' : undefined}
            className="border-b border-[var(--accent-gold)]/70 pb-1 text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)] transition-all duration-300 ease-out hover:border-[var(--accent-gold)]"
          >
            {t('privateConcierge')}
          </a>
        </div>
      </div>
    </section>
  )
}
