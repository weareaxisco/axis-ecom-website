import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { isSafeMapEmbedUrl } from '../utils/maps'
import { validateSiteConfig } from '../utils/siteConfigValidation'

export default function AdminSettings() {
  const { siteConfig, updateSiteConfig } = useSiteConfigSettings()
  const [form, setForm] = useState(siteConfig)
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState(false)
  useEffect(() => setForm(siteConfig), [siteConfig])
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const save = async (event) => {
    event.preventDefault()
    const validationErrors = validateSiteConfig(form)
    if (validationErrors.length) {
      setMessage(validationErrors.join(' '))
      return
    }
    const { error } = await supabase.from('site_config').upsert({ id: 1, ...form })
    if (error) { setMessage(error.message); return }
    updateSiteConfig(form)
    setMessage('Site settings saved.')
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-amber-500'
  const validationErrors = validateSiteConfig(form)
  return <form onSubmit={save} className="max-w-2xl border border-neutral-800 bg-neutral-950/70 p-6 md:p-8"><h2 className="font-serif text-2xl uppercase tracking-widest">Site Settings</h2><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Website Name<input value={form.site_name} onChange={update('site_name')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Contact Email<input type="email" value={form.contact_email} onChange={update('contact_email')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Moroccan Phone<input pattern="\+212\s?[67]\d{2}[-\s]?\d{6}" value={form.contact_phone} onChange={update('contact_phone')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Boutique Address<input value={form.contact_address} onChange={update('contact_address')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Instagram URL<input type="url" value={form.instagram_url || ''} onChange={update('instagram_url')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">TikTok URL<input type="url" value={form.tiktok_url || ''} onChange={update('tiktok_url')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">WhatsApp Number<input value={form.whatsapp_number || ''} onChange={update('whatsapp_number')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">GA4 Tracking ID<input value={form.ga_tracking_id || ''} onChange={update('ga_tracking_id')} className={input} placeholder="G-XXXXXXXXXX" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Calendar iCal / API Webhook URL<input type="url" value={form.calendar_api_url || ''} onChange={update('calendar_api_url')} className={input} placeholder="https://calendar.example.com/webhook" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Opening Hours<input value={form.opening_hours || ''} onChange={update('opening_hours')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Google Maps Embed URL<input type="url" value={form.map_embed_url || ''} onChange={update('map_embed_url')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Boutique Image URL<input type="url" value={form.boutique_image_url || ''} onChange={update('boutique_image_url')} className={input} /></label></div>{validationErrors.length > 0 && <div className="mt-5 border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-200"><p className="font-semibold uppercase tracking-widest">Preview validation</p><ul className="mt-2 list-disc space-y-1 pl-4">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}{message && <p className="mt-5 text-xs text-amber-300">{message}</p>}<div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => setPreview((value) => !value)} className="border border-neutral-700 px-6 py-4 text-xs uppercase tracking-widest text-neutral-200">{preview ? 'Close Preview' : 'Preview Public Settings'}</button><button type="submit" className="bg-amber-500 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-black">Save Changes</button></div>{preview && <div className="mt-6 border border-neutral-800 bg-neutral-900/50 p-5"><p className="font-serif text-xl">{form.site_name || 'Website name'}</p><p className="mt-2 text-sm text-neutral-400">{form.contact_address || 'Boutique address'} · {form.contact_phone || 'Phone'} · {form.opening_hours || 'Opening hours'}</p><div className="mt-4 flex gap-3 text-xs text-amber-300">{form.instagram_url && <a href={form.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}{form.tiktok_url && <a href={form.tiktok_url} target="_blank" rel="noreferrer">TikTok</a>}{form.whatsapp_number && <span>WhatsApp</span>}</div>{isSafeMapEmbedUrl(form.map_embed_url) && <iframe title="Map preview" src={form.map_embed_url} className="mt-5 h-48 w-full border-0" loading="lazy" />}</div>}</form>
}
