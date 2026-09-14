import { useEffect, useRef, useState } from 'react'
import { Check, ImageOff, LoaderCircle, RefreshCw, Trash2, Upload } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { isSafeMapEmbedUrl } from '../utils/maps'
import { validateSiteConfig } from '../utils/siteConfigValidation'
import { useLanguage } from '../context/LanguageContext'

const luxuryInput = 'mt-2 w-full rounded-md border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 disabled:cursor-not-allowed disabled:opacity-50'
const helper = 'mt-2 text-[10px] leading-5 tracking-normal text-neutral-500'

function AssetPlaceholder({ label }) {
  return <div className="flex h-24 items-center justify-center gap-2 rounded-md border border-dashed border-neutral-700 bg-neutral-950/70 text-[10px] uppercase tracking-widest text-neutral-600"><ImageOff size={15} strokeWidth={1.25} /> {label}</div>
}

function AssetDropzone({ label, currentUrl, fileName, uploading, accept, onUpload, onRemove, preview, emptyLabel }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const chooseFile = (event) => {
    const [file] = event.target.files || []
    if (file) onUpload(file)
    event.target.value = ''
  }
  const dropFile = (event) => {
    event.preventDefault()
    setDragOver(false)
    const [file] = event.dataTransfer.files || []
    if (file) onUpload(file)
  }
  return <div className="mt-3">
    <input ref={inputRef} type="file" accept={accept} onChange={chooseFile} className="hidden" />
    {currentUrl ? <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {preview}
          <div className="min-w-0"><p className="truncate text-xs text-neutral-200">{fileName || 'Asset distant'}</p><p className="text-[10px] uppercase tracking-widest text-emerald-400">Actif</p></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 border border-neutral-700 px-3 py-2 text-[10px] uppercase tracking-widest text-neutral-300 transition-colors hover:border-amber-500 hover:text-amber-300"><RefreshCw size={13} /> Remplacer</button>
          <button type="button" onClick={onRemove} disabled={uploading} className="inline-flex items-center gap-1.5 border border-rose-500/40 px-3 py-2 text-[10px] uppercase tracking-widest text-rose-300 transition-colors hover:border-rose-400"><Trash2 size={13} /> Supprimer</button>
        </div>
      </div>
    </div> : <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={dropFile} disabled={uploading} className={`flex min-h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${dragOver ? 'scale-[1.01] border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10' : 'border-neutral-800 bg-neutral-950/60 hover:border-amber-500/50 hover:bg-neutral-900/40'} ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}>{uploading ? <><LoaderCircle className="animate-spin text-amber-400" size={22} strokeWidth={1.25} /><span className="mt-3 text-[10px] uppercase tracking-widest text-amber-300">Téléversement en cours...</span></> : <><Upload className="text-neutral-500" size={22} strokeWidth={1.25} /><span className="mt-3 text-[10px] uppercase tracking-widest text-neutral-300">Déposer ou choisir un fichier</span><span className="mt-2 text-[10px] text-neutral-600">{label} · max {emptyLabel}</span></>}</button>}
  </div>
}

export default function AdminSettings() {
  const { t } = useLanguage()
  const { siteConfig, updateSiteConfig } = useSiteConfigSettings()
  const [form, setForm] = useState(siteConfig)
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState(false)
  const [feedCopied, setFeedCopied] = useState(false)
  const [logoPreviewError, setLogoPreviewError] = useState(false)
  const [faviconPreviewError, setFaviconPreviewError] = useState(false)
  const [uploadingAsset, setUploadingAsset] = useState('')

  useEffect(() => setForm(siteConfig), [siteConfig])
  useEffect(() => {
    setLogoPreviewError(false)
    setFaviconPreviewError(false)
  }, [form.logo_image_url, form.favicon_url])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const uploadAsset = async (kind, file) => {
    const rules = kind === 'logo'
      ? { extensions: ['png', 'svg', 'webp', 'jpg'], maxSize: 2 * 1024 * 1024, label: 'PNG, SVG, WEBP ou JPG' }
      : { extensions: ['ico', 'png', 'svg'], maxSize: 512 * 1024, label: 'ICO, PNG ou SVG' }
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !rules.extensions.includes(extension)) {
      setMessage(`Format invalide. Utilisez : ${rules.label}.`)
      return
    }
    if (file.size > rules.maxSize) {
      setMessage(kind === 'logo' ? 'Le logo doit faire 2 Mo maximum.' : 'Le favicon doit faire 512 Ko maximum.')
      return
    }
    setUploadingAsset(kind)
    setMessage('')
    const filePath = `${kind}_${Date.now()}.${extension}`
    const { error } = await supabase.storage.from('site-assets').upload(filePath, file, { upsert: false, contentType: file.type || undefined })
    if (error) {
      setUploadingAsset('')
      setMessage(`Téléversement impossible : ${error.message}`)
      return
    }
    const { data } = supabase.storage.from('site-assets').getPublicUrl(filePath)
    setForm((current) => ({ ...current, [kind === 'logo' ? 'logo_image_url' : 'favicon_url']: data.publicUrl }))
    if (kind === 'logo') setLogoPreviewError(false)
    else setFaviconPreviewError(false)
    setUploadingAsset('')
    setMessage('Asset téléversé. Enregistrez les modifications pour le publier.')
  }
  const removeLogo = () => {
    setForm((current) => ({ ...current, logo_image_url: '', logo_type: 'text' }))
    setMessage('Logotype image supprimé. Mode texte activé par défaut.')
  }
  const removeFavicon = () => {
    setForm((current) => ({ ...current, favicon_url: '' }))
    setMessage('Favicon supprimé. L’icône par défaut du navigateur sera restaurée après enregistrement.')
  }
  const save = async (event) => {
    event.preventDefault()
    const validationErrors = validateSiteConfig(form)
    if (validationErrors.length) {
      setMessage(validationErrors.join(' '))
      return
    }
    const payload = { id: 1, ...form, site_name: form.business_name?.trim() || form.site_name, business_name: form.business_name?.trim() || form.site_name }
    const { error } = await supabase.from('site_config').upsert(payload)
    if (error) { setMessage(error.message); return }
    updateSiteConfig(payload)
    window.localStorage.setItem('site_name', payload.business_name.trim())
    setMessage(t('siteSettingsSaved'))
  }

  const input = luxuryInput
  const validationErrors = validateSiteConfig(form)
  const calendarFeedUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-feed`
  const copyFeedUrl = async () => {
    await navigator.clipboard.writeText(calendarFeedUrl)
    setFeedCopied(true)
    window.setTimeout(() => setFeedCopied(false), 2000)
  }
  const hasLogoPreview = form.logo_type === 'image' && form.logo_image_url && !logoPreviewError
  const hasFaviconPreview = form.favicon_url && !faviconPreviewError

  return <form onSubmit={save} className="mx-auto w-full max-w-3xl border border-neutral-800 bg-neutral-950/70 p-6 md:p-8">
    <h2 className="font-serif text-2xl uppercase tracking-widest">{t('siteSettingsTitle')}</h2>

    <section className="mt-8 rounded-xl border border-amber-500/20 bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/10 p-5 shadow-2xl md:p-6">
      <div className="border-b border-neutral-800 pb-5">
        <p className="font-serif text-xl tracking-wide text-amber-300">IDENTITÉ &amp; LOGOTYPE</p>
        <p className="mt-2 text-xs leading-5 text-neutral-400">Gérez le logotype public, l&apos;icône de navigateur et l&apos;identité de marque.</p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">NOM DE LA MAISON
          <input value={form.business_name || form.site_name || ''} onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value, site_name: event.target.value }))} className={input} placeholder="Maison de l'Élégance" />
          <span className={helper}>Ce nom apparaît dans le logo texte et les titres de page.</span>
        </label>
        <fieldset className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          <legend>FORMAT DU LOGO</legend>
          <div className="mt-2 flex gap-1 rounded-lg border border-neutral-800 bg-neutral-950/80 p-1">
            {['text', 'image'].map((type) => {
              const active = (form.logo_type || 'text') === type
              return <button key={type} type="button" onClick={() => setForm((current) => ({ ...current, logo_type: type }))} aria-pressed={active} className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-3 text-[10px] uppercase tracking-widest transition-all ${active ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-sm' : 'border-transparent text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`}>{active && <Check size={13} strokeWidth={1.5} />}{type === 'text' ? 'Logo texte' : 'Logo image'}</button>
            })}
          </div>
        </fieldset>
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 sm:col-span-2">IMAGE DU LOGOTYPE
          <input type="url" value={form.logo_image_url || ''} onChange={update('logo_image_url')} className={input} placeholder="https://..." disabled={form.logo_type !== 'image'} />
          <span className={helper}>Format recommandé : PNG fond transparent, max 200px de hauteur.</span>
          <AssetDropzone label="PNG, SVG, WEBP ou JPG" currentUrl={form.logo_image_url} fileName={form.logo_image_url?.split('/').pop()} uploading={uploadingAsset === 'logo'} accept=".png,.svg,.webp,.jpg,image/png,image/svg+xml,image/webp,image/jpeg" onUpload={(file) => uploadAsset('logo', file)} onRemove={removeLogo} emptyLabel="2 Mo" preview={hasLogoPreview ? <img src={form.logo_image_url} alt="" onError={() => setLogoPreviewError(true)} className="h-16 w-28 object-contain" /> : <span className="flex h-16 w-28 items-center justify-center border border-dashed border-neutral-700"><ImageOff size={16} /></span>} />
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">APERÇU EN DIRECT · LOGO</p>
          <div className="mt-2 rounded-lg border border-neutral-800 bg-neutral-950 p-5" style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,.03) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.03) 50%, rgba(255,255,255,.03) 75%, transparent 75%)', backgroundSize: '12px 12px' }}>
            {hasLogoPreview ? <img src={form.logo_image_url} alt="Aperçu du logo" onError={() => setLogoPreviewError(true)} className="mx-auto h-20 max-w-full object-contain" /> : <AssetPlaceholder label="Aucune image configurée" />}
          </div>
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 sm:col-span-2">ICÔNE DE NAVIGATEUR (FAVICON)
          <input type="url" value={form.favicon_url || ''} onChange={update('favicon_url')} className={input} placeholder="https://..." />
          <span className={helper}>Format recommandé : PNG ou SVG carré, 32 × 32 px minimum.</span>
          <AssetDropzone label="ICO, PNG ou SVG" currentUrl={form.favicon_url} fileName={form.favicon_url?.split('/').pop()} uploading={uploadingAsset === 'favicon'} accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml" onUpload={(file) => uploadAsset('favicon', file)} onRemove={removeFavicon} emptyLabel="512 Ko" preview={hasFaviconPreview ? <img src={form.favicon_url} alt="" onError={() => setFaviconPreviewError(true)} className="h-8 w-8 object-contain" /> : <span className="flex h-8 w-8 items-center justify-center border border-dashed border-neutral-700"><ImageOff size={13} /></span>} />
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">APERÇU EN DIRECT · FAVICON</p>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
              {hasFaviconPreview ? <img src={form.favicon_url} alt="Aperçu du favicon" onError={() => setFaviconPreviewError(true)} className="h-4 w-4 shrink-0 object-contain" /> : <span className="h-4 w-4 shrink-0 rounded-sm border border-dashed border-neutral-700" />}
              <span className="truncate text-xs text-neutral-300">{form.business_name || form.site_name || 'Maison de l’Élégance'}</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400">Onglet actif</span>
          </div>
        </div>
      </div>
    </section>

    <div className="mt-8 rounded-lg border border-amber-500/20 bg-neutral-900/70 p-5">
      <p className="font-serif text-xl text-amber-300">Sync Calendar Feed</p>
      <p className="mt-2 text-xs leading-5 text-neutral-400">Subscribe to this live RFC5545 feed from Zoho Calendar or Google Calendar.</p>
      <div className="mt-4 flex gap-2"><input readOnly value={calendarFeedUrl} className="min-w-0 flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300" /><button type="button" onClick={copyFeedUrl} className="border border-amber-500 px-3 py-2 text-[10px] uppercase tracking-widest text-amber-300">{feedCopied ? 'Copied' : 'Copy'}</button></div>
      <div className="mt-4 border-t border-neutral-800 pt-4 text-xs leading-6 text-neutral-400"><p><strong className="text-neutral-200">Zoho:</strong> Settings → Calendars → Subscribe via URL.</p><p><strong className="text-neutral-200">Google:</strong> Other calendars → From URL.</p></div>
    </div>

    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('websiteName')}<input value={form.site_name} onChange={update('site_name')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('contactEmail')}<input type="email" value={form.contact_email} onChange={update('contact_email')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('moroccanPhone')}<input pattern="\+212\s?[67]\d{2}[-\s]?\d{6}" value={form.contact_phone} onChange={update('contact_phone')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('boutiqueAddress')}<input value={form.contact_address} onChange={update('contact_address')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">Instagram URL<input type="url" value={form.instagram_url || ''} onChange={update('instagram_url')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">TikTok URL<input type="url" value={form.tiktok_url || ''} onChange={update('tiktok_url')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('whatsappNumber')}<input value={form.whatsapp_number || ''} onChange={update('whatsapp_number')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('ga4TrackingId')}<input value={form.ga_tracking_id || ''} onChange={update('ga_tracking_id')} className={input} placeholder="G-XXXXXXXXXX" /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('calendarWebhookUrl')}<input type="url" value={form.calendar_api_url || ''} onChange={update('calendar_api_url')} className={input} placeholder="https://calendar.example.com/webhook" /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('openingHours')}<input value={form.opening_hours || ''} onChange={update('opening_hours')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('googleMapsUrl')}<input type="url" value={form.map_embed_url || ''} onChange={update('map_embed_url')} className={input} /></label>
      <label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('boutiqueImageUrl')}<input type="url" value={form.boutique_image_url || ''} onChange={update('boutique_image_url')} className={input} /></label>
    </div>
    {validationErrors.length > 0 && <div className="mt-5 border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-200"><p className="font-semibold uppercase tracking-widest">{t('previewValidation')}</p><ul className="mt-2 list-disc space-y-1 pl-4">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
    {message && <p className="mt-5 text-xs text-amber-300">{message}</p>}
    <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => setPreview((value) => !value)} className="border border-neutral-700 px-6 py-4 text-xs uppercase tracking-widest text-neutral-200">{preview ? t('closePreview') : t('previewPublicSettings')}</button><button type="submit" className="bg-amber-500 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-black">{t('saveChanges')}</button></div>
    {preview && <div className="mt-6 border border-neutral-800 bg-neutral-900/50 p-5"><p className="font-serif text-xl">{form.site_name || t('websiteNameFallback')}</p><p className="mt-2 text-sm text-neutral-400">{form.contact_address || t('boutiqueAddressFallback')} · {form.contact_phone || t('phone')} · {form.opening_hours || t('openingHoursFallback')}</p><div className="mt-4 flex gap-3 text-xs text-amber-300">{form.instagram_url && <a href={form.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}{form.tiktok_url && <a href={form.tiktok_url} target="_blank" rel="noreferrer">TikTok</a>}{form.whatsapp_number && <span>WhatsApp</span>}</div>{isSafeMapEmbedUrl(form.map_embed_url) && <iframe title={t('boutiqueMap')} src={form.map_embed_url} className="mt-5 h-48 w-full border-0" loading="lazy" />}</div>}
  </form>
}
