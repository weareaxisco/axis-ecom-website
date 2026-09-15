import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const fallback = { site_name: "Maison de L'Élégance", business_name: "Maison de L'Élégance", logo_type: 'text', logo_image_url: '', favicon_url: '', contact_email: '', contact_phone: '+212 522 000 000', contact_address: 'Casablanca, Morocco', currency_label: 'DH', instagram_url: '', tiktok_url: '', whatsapp_number: '', map_embed_url: '', opening_hours: 'Monday - Saturday, 10:00 - 19:00', boutique_image_url: '', ga_tracking_id: '', calendar_api_url: '' }
const SiteConfigContext = createContext(null)
const getInitialSiteConfig = () => {
  if (typeof window === 'undefined') return fallback
  const storage = window.localStorage
  const businessName = storage.getItem('diamiss_business_name')?.trim() || storage.getItem('site_name')?.trim()
  const logoType = storage.getItem('diamiss_logo_type')?.trim()
  const logoUrl = storage.getItem('diamiss_logo_url')?.trim()
  return {
    ...fallback,
    ...(businessName ? { site_name: businessName, business_name: businessName } : {}),
    ...(logoType ? { logo_type: logoType } : {}),
    ...(logoUrl ? { logo_image_url: logoUrl } : {}),
  }
}

export function SiteConfigProvider({ children }) {
  const [siteConfig, setSiteConfig] = useState(getInitialSiteConfig)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let isMounted = true
    const timeout = window.setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 2500)
    supabase.from('site_config').select('*').eq('id', 1).maybeSingle().then(({ data, error }) => {
      if (!isMounted) return
      if (error) console.warn(`Site settings fallback: ${error.message}`)
      if (data) {
        setSiteConfig((current) => ({ ...current, ...data, business_name: data.business_name || data.site_name || current.business_name }))
        if (typeof window !== 'undefined') {
          if (data.business_name || data.site_name) {
            const businessName = data.business_name || data.site_name
            window.localStorage.setItem('site_name', businessName)
            window.localStorage.setItem('diamiss_business_name', businessName)
          }
          if (data.logo_type) window.localStorage.setItem('diamiss_logo_type', data.logo_type)
          if (data.logo_image_url) window.localStorage.setItem('diamiss_logo_url', data.logo_image_url)
        }
      }
      setLoading(false)
    })
    const handleStorage = (event) => {
      if (!event.newValue) return
      if (event.key === 'site_name' || event.key === 'diamiss_business_name') {
        setSiteConfig((current) => ({ ...current, site_name: event.newValue, business_name: event.newValue }))
      }
      if (event.key === 'diamiss_logo_type') setSiteConfig((current) => ({ ...current, logo_type: event.newValue }))
      if (event.key === 'diamiss_logo_url') setSiteConfig((current) => ({ ...current, logo_image_url: event.newValue }))
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      isMounted = false
      window.clearTimeout(timeout)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const favicon = siteConfig.favicon_url?.trim()
    const icons = [...document.head.querySelectorAll("link[rel*='icon']")]
    if (!favicon) {
      document.head.querySelectorAll('link[data-dynamic-favicon]').forEach((icon) => icon.remove())
      const defaultIcon = document.head.querySelector('link[data-default-favicon]')
      if (defaultIcon) defaultIcon.href = '/favicon.svg'
      return undefined
    }
    if (!icons.length) {
      const icon = document.createElement('link')
      icon.rel = 'icon'
      icon.dataset.dynamicFavicon = 'true'
      document.head.appendChild(icon)
      icons.push(icon)
    }
    icons.forEach((icon) => { icon.href = favicon })
    return undefined
  }, [siteConfig.favicon_url])
  const updateSiteConfig = (updates) => {
    setSiteConfig((current) => ({ ...current, ...updates, business_name: updates.business_name || updates.site_name || current.business_name }))
    if (typeof window !== 'undefined') {
      const businessName = (updates.business_name || updates.site_name)?.trim()
      if (businessName) {
        window.localStorage.setItem('site_name', businessName)
        window.localStorage.setItem('diamiss_business_name', businessName)
      }
      if (updates.logo_type) window.localStorage.setItem('diamiss_logo_type', updates.logo_type)
      if (updates.logo_image_url) window.localStorage.setItem('diamiss_logo_url', updates.logo_image_url)
    }
  }
  const value = useMemo(() => ({ siteConfig, businessName: siteConfig.business_name || siteConfig.site_name, updateSiteConfig, loading }), [siteConfig, loading])
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfigSettings() {
  const context = useContext(SiteConfigContext)
  if (!context) throw new Error('useSiteConfigSettings must be used within SiteConfigProvider')
  return context
}

export function useOptionalSiteConfigSettings() {
  return useContext(SiteConfigContext)
}
