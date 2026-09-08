import { useEffect, useState } from 'react'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { loadAnalytics } from '../utils/analytics'
import { useLanguage } from '../context/LanguageContext'

const storageKey = 'maison_cookie_preferences'

export default function CookieConsent() {
  const { siteConfig } = useSiteConfigSettings()
  const { t } = useLanguage()
  const [choice, setChoice] = useState(() => localStorage.getItem(storageKey))
  const [customizing, setCustomizing] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [functional, setFunctional] = useState(false)

  useEffect(() => {
    if (!choice) return
    const parsed = JSON.parse(choice)
    setAnalytics(Boolean(parsed.analytics))
    setFunctional(Boolean(parsed.functional))
    if (parsed.analytics && siteConfig.ga_tracking_id) loadAnalytics(siteConfig.ga_tracking_id)
  }, [choice, siteConfig.ga_tracking_id])

  if (choice) return null

  const save = (analyticsValue, functionalValue = false) => {
    const next = JSON.stringify({ necessary: true, analytics: analyticsValue, functional: functionalValue, saved_at: new Date().toISOString() })
    localStorage.setItem(storageKey, next)
    setChoice(next)
  }

  const category = (title, description, value, setter, disabled = false) => (
    <label className={`flex items-start gap-3 border border-neutral-800 p-4 ${disabled ? 'opacity-60' : ''}`}>
      <input type="checkbox" checked={value} onChange={(event) => setter(event.target.checked)} disabled={disabled} className="mt-1 accent-amber-400" />
      <span><strong className="block text-xs uppercase tracking-widest">{title}</strong><span className="mt-1 block text-xs leading-5 text-neutral-400">{description}</span></span>
    </label>
  )

  return <aside className="fixed bottom-0 left-0 right-0 z-[80] border-t border-amber-500/30 bg-neutral-950 p-4 text-white shadow-2xl md:p-5"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><p className="max-w-2xl text-xs leading-6 text-neutral-400">{t('cookieBannerDescription')}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => save(true, true)} className="bg-amber-400 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-black">{t('acceptAll')}</button><button type="button" onClick={() => setCustomizing((value) => !value)} className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-widest">{t('customize')}</button><button type="button" onClick={() => save(false)} className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-widest">{t('reject')}</button></div></div>{customizing && <div className="mt-5 grid gap-3 md:grid-cols-3">{category(t('requiredCookies'), t('requiredCookieDescription'), true, () => {}, true)}{category(t('analyticsCookies'), t('analyticsCookieDescription'), analytics, setAnalytics)}{category(t('functionalCookies'), t('functionalCookieDescription'), functional, setFunctional)}<button type="button" onClick={() => save(analytics, functional)} className="bg-amber-400 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-black md:col-span-3">{t('saveCookiePreferences')}</button></div>}</div></aside>
}
