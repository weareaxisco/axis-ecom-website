import { useEffect } from 'react'
import { useSiteConfig } from '../context/ConfigContext'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import BrandLogo from './common/BrandLogo'

const fallbackHeroImage = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=90'

function preloadImage(url) {
  if (!url) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = resolve
    image.onerror = reject
    image.src = url
  })
}

export default function LoadingScreen({ fading = false, onPreloadComplete }) {
  const { config } = useSiteConfig()
  const { siteConfig } = useSiteConfigSettings()

  useEffect(() => {
    const cachedLogoUrl = typeof window !== 'undefined'
      ? window.localStorage.getItem('diamiss_logo_url')?.trim()
      : ''
    const logoUrl = cachedLogoUrl || siteConfig.logo_image_url
    const heroUrl = config.hero_image_url || fallbackHeroImage
    Promise.allSettled([preloadImage(logoUrl), preloadImage(heroUrl)]).then(() => {
      onPreloadComplete?.()
    })
  }, [config.hero_image_url, onPreloadComplete, siteConfig.logo_image_url])

  return <div role="status" aria-live="polite" aria-label="Loading" className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 transition-opacity duration-[400ms] ${fading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
    <BrandLogo className="mb-6 h-16 w-auto max-w-[240px] animate-pulse object-contain" textClassName="font-serif text-2xl uppercase tracking-[0.25em] text-amber-200" />
    <div className="h-0.5 w-24 animate-pulse bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
  </div>
}
