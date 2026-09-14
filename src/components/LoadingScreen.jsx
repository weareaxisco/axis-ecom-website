import { useSiteConfigSettings } from '../context/SiteConfigContext'

export default function LoadingScreen() {
  const { siteConfig } = useSiteConfigSettings()
  const brand = siteConfig.site_name
  return <main role="status" aria-live="polite" aria-label="Loading" className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center">
    <p className="animate-pulse font-serif text-lg uppercase tracking-[0.35em] text-amber-400 sm:text-xl">{brand}</p>
  </main>
}
