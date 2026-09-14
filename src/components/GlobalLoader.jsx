import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'
import LoadingScreen from './LoadingScreen'

export default function GlobalLoader() {
  const { siteConfig, loading } = useSiteConfigSettings()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [routeLoading, setRouteLoading] = useState(false)
  const hasMounted = useRef(false)
  useEffect(() => {
    if (loading) return undefined
    if (!hasMounted.current) {
      hasMounted.current = true
      return undefined
    }
    setRouteLoading(true)
    const timer = window.setTimeout(() => setRouteLoading(false), 220)
    return () => window.clearTimeout(timer)
  }, [pathname, loading])
  if (!loading && !routeLoading) return null
  return <div className="fixed inset-0 z-[100]"><LoadingScreen /></div>
}
