import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useSiteConfigSettings } from '../context/SiteConfigContext'

export default function AdminSettings() {
  const { siteConfig, updateSiteConfig } = useSiteConfigSettings()
  const [form, setForm] = useState(siteConfig)
  const [message, setMessage] = useState('')
  useEffect(() => setForm(siteConfig), [siteConfig])
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const save = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('site_config').upsert({ id: 1, ...form })
    if (error) { setMessage(error.message); return }
    updateSiteConfig(form)
    setMessage('Site settings saved.')
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-amber-500'
  return <form onSubmit={save} className="max-w-2xl border border-neutral-800 bg-neutral-950/70 p-6 md:p-8"><h2 className="font-serif text-2xl uppercase tracking-widest">Site Settings</h2><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Website Name<input value={form.site_name} onChange={update('site_name')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Contact Email<input type="email" value={form.contact_email} onChange={update('contact_email')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Moroccan Phone<input pattern="\+212\s?[67]\d{2}[-\s]?\d{6}" value={form.contact_phone} onChange={update('contact_phone')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Boutique Address<input value={form.contact_address} onChange={update('contact_address')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Instagram URL<input type="url" value={form.instagram_url || ''} onChange={update('instagram_url')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">TikTok URL<input type="url" value={form.tiktok_url || ''} onChange={update('tiktok_url')} className={input} /></label>  <label className="text-[10px] uppercase tracking-widest text-neutral-400">WhatsApp Number<input value={form.whatsapp_number || ''} onChange={update('whatsapp_number')} className={input} /></label>  <label className="text-[10px] uppercase tracking-widest text-neutral-400">GA4 Tracking ID<input value={form.ga_tracking_id || ''} onChange={update('ga_tracking_id')} className={input} placeholder="G-XXXXXXXXXX" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Calendar iCal / API Webhook URL<input type="url" value={form.calendar_api_url || ''} onChange={update('calendar_api_url')} className={input} placeholder="https://calendar.example.com/webhook" /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Opening Hours<input value={form.opening_hours || ''} onChange={update('opening_hours')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Google Maps Embed URL<input type="url" value={form.map_embed_url || ''} onChange={update('map_embed_url')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Boutique Image URL<input type="url" value={form.boutique_image_url || ''} onChange={update('boutique_image_url')} className={input} /></label></div>{message && <p className="mt-5 text-xs text-amber-300">{message}</p>}<button type="submit" className="mt-8 bg-amber-500 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-black">Save Changes</button></form>
}
