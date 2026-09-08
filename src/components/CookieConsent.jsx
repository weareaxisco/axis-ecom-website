import { useEffect, useState } from 'react'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { loadAnalytics } from '../utils/analytics'

const storageKey = 'maison_cookie_consent'
export default function CookieConsent() {
  const { siteConfig } = useSiteConfigSettings()
  const [choice, setChoice] = useState(() => localStorage.getItem(storageKey))
  useEffect(() => {
    if (!choice) return
    const parsed = JSON.parse(choice)
    if (parsed.analytics && siteConfig.ga_tracking_id) loadAnalytics(siteConfig.ga_tracking_id)
  }, [choice, siteConfig.ga_tracking_id])
  if (choice) return null
  const save = (analytics) => {
    const next = JSON.stringify({ necessary: true, analytics, saved_at: new Date().toISOString() })
    localStorage.setItem(storageKey, next)
    setChoice(next)
  }
  return <aside className="fixed bottom-0 left-0 right-0 z-[80] border-t border-amber-500/30 bg-neutral-950 p-4 text-white shadow-2xl md:p-5"><div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between"><p className="max-w-2xl text-xs leading-6 text-neutral-400">Nous utilisons des cookies nécessaires et, avec votre accord, des cookies analytiques pour améliorer votre expérience.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => save(true)} className="bg-amber-400 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-black">Accepter tout</button><button type="button" onClick={() => save(false)} className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-widest">Personnaliser</button><button type="button" onClick={() => save(false)} className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-widest">Refuser</button></div></div></aside>
}
