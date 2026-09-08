import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'

export default function GlobalLoader() {
  const { siteConfig, loading } = useSiteConfigSettings()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [routeLoading, setRouteLoading] = useState(false)
  useEffect(() => {
    if (!loading) {
      setRouteLoading(true)
      const timer = window.setTimeout(() => setRouteLoading(false), 220)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [pathname, loading])
  if (!loading && !routeLoading) return null
  return <div role="status" aria-live="polite" aria-label={t('loadingLabel')} className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)] text-center"><div><p className="text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('maison')}</p><p className="mt-5 font-serif text-3xl uppercase tracking-[0.2em] text-[var(--text-primary)]">{siteConfig.site_name}</p><span className="mx-auto mt-8 block h-px w-20 bg-amber-400/70" /></div></div>
}
