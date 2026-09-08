import { MapPin, Phone, Clock } from 'lucide-react'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { getSafeMapEmbedUrl } from '../utils/maps'
import { useLanguage } from '../context/LanguageContext'

export default function Boutique() {
  const { siteConfig } = useSiteConfigSettings()
  const { t } = useLanguage()
  const mapUrl = getSafeMapEmbedUrl(siteConfig.map_embed_url)
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-6xl"><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{t('visitMaison')}</p><h1 className="mt-4 font-serif text-5xl uppercase tracking-widest">{t('ourBoutique')}</h1><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]"><section className="space-y-6">{siteConfig.boutique_image_url && <img src={siteConfig.boutique_image_url} alt={`${siteConfig.site_name} boutique`} className="h-72 w-full object-cover" />}<div className="space-y-5 border border-neutral-800 p-6"><div className="flex gap-4"><MapPin className="shrink-0 text-amber-400" size={20} /><p>{siteConfig.contact_address}</p></div><div className="flex gap-4"><Phone className="shrink-0 text-amber-400" size={20} /><p>{siteConfig.contact_phone}</p></div><div className="flex gap-4"><Clock className="shrink-0 text-amber-400" size={20} /><p>{siteConfig.opening_hours}</p></div></div></section><iframe title={t('boutiqueMap')} src={mapUrl} className="min-h-[420px] w-full border-0 grayscale" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div></main>
}
