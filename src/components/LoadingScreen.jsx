import { useSiteConfigSettings } from '../context/SiteConfigContext'

export default function LoadingScreen() {
  const { siteConfig } = useSiteConfigSettings()
  const brand = siteConfig.site_name || 'Maison Diamiss'
  return <main role="status" aria-live="polite" aria-label="Loading" className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-center">
    <p className="font-serif text-2xl uppercase tracking-[0.3em] text-amber-400">{brand}</p>
    <div className="relative mt-8 h-0.5 w-48 overflow-hidden rounded-full bg-amber-500/20">
      <span className="loading-shimmer absolute inset-y-0 left-0 w-1/2 rounded-full bg-amber-400" />
    </div>
  </main>
}
