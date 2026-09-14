import { useEffect, useState } from 'react'
import { useSiteConfigSettings } from '../context/SiteConfigContext'

export default function LoadingScreen() {
  const { siteConfig, loading } = useSiteConfigSettings()
  const [storedName, setStoredName] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') setStoredName(window.localStorage.getItem('site_name')?.trim() || '')
  }, [])
  const brand = loading ? (storedName || siteConfig.site_name) : (siteConfig.site_name || storedName)
  return <main role="status" aria-live="polite" aria-label="Loading" className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center">
    <p className="animate-pulse font-serif text-lg uppercase tracking-[0.35em] text-amber-400 sm:text-xl">{brand}</p>
  </main>
}
