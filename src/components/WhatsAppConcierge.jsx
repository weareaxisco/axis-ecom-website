import { MessageCircle } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { useSiteConfig } from '../context/ConfigContext'
import { useSiteConfigSettings } from '../context/SiteConfigContext'

export default function WhatsAppConcierge() {
  const location = useLocation()
  const { id } = useParams()
  const { config } = useSiteConfig()
  const { siteConfig } = useSiteConfigSettings()
  const phone = (siteConfig.contact_phone || config.whatsapp_number || '212600000000').replace(/\D/g, '')
  let message = 'Bonjour Maison de l’Élégance, I would like to speak with a personal jewelry advisor.'
  if (location.pathname.startsWith('/product/')) message = `Bonjour, I would like to inquire about creation ${id} (Ref: ${id}).`
  if (location.pathname.startsWith('/checkout') || location.pathname.startsWith('/account')) message = 'Bonjour, I need assistance regarding my order.'
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label="Speak with a WhatsApp jewelry advisor" className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full border border-amber-500/60 bg-neutral-950 px-4 py-3 text-xs uppercase tracking-widest text-white shadow-[0_0_24px_rgba(245,158,11,0.2)] transition-all hover:border-amber-300 hover:text-amber-300">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/50 text-amber-400"><span className="absolute inset-0 animate-ping rounded-full border border-amber-400/30" /><MessageCircle size={17} /></span>
      <span className="hidden sm:inline">Private Concierge</span>
    </a>
  )
}
