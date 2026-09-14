import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const fallback = { site_name: "Maison de L'Élégance", contact_email: '', contact_phone: '+212 522 000 000', contact_address: 'Casablanca, Morocco', currency_label: 'DH', instagram_url: '', tiktok_url: '', whatsapp_number: '', map_embed_url: '', opening_hours: 'Monday - Saturday, 10:00 - 19:00', boutique_image_url: '', ga_tracking_id: '', calendar_api_url: '' }
const SiteConfigContext = createContext(null)
const getInitialSiteConfig = () => {
  if (typeof window === 'undefined') return fallback
  const siteName = window.localStorage.getItem('site_name')?.trim()
  return siteName ? { ...fallback, site_name: siteName } : fallback
}

export function SiteConfigProvider({ children }) {
  const [siteConfig, setSiteConfig] = useState(getInitialSiteConfig)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('site_config').select('*').eq('id', 1).maybeSingle().then(({ data, error }) => {
      if (error) console.warn(`Site settings fallback: ${error.message}`)
      if (data) {
        setSiteConfig((current) => ({ ...current, ...data }))
        if (typeof window !== 'undefined' && data.site_name) window.localStorage.setItem('site_name', data.site_name)
      }
      setLoading(false)
    })
    const handleStorage = (event) => {
      if (event.key === 'site_name' && event.newValue) setSiteConfig((current) => ({ ...current, site_name: event.newValue }))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])
  const updateSiteConfig = (updates) => {
    setSiteConfig((current) => ({ ...current, ...updates }))
    if (typeof window !== 'undefined' && updates.site_name?.trim()) window.localStorage.setItem('site_name', updates.site_name.trim())
  }
  const value = useMemo(() => ({ siteConfig, updateSiteConfig, loading }), [siteConfig, loading])
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfigSettings() {
  const context = useContext(SiteConfigContext)
  if (!context) throw new Error('useSiteConfigSettings must be used within SiteConfigProvider')
  return context
}
