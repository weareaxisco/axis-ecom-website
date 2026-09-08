import { useState } from 'react'
import { ChevronDown, MessageCircle, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteConfig } from '../context/ConfigContext'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'
import { useState as useFeedbackState } from 'react'
import SiteFeedbackModal from './SiteFeedbackModal'

function SectionLinks({ title, links, mobile = false }) {
  const [isOpen, setIsOpen] = useState(false)
  return <div className={mobile ? 'border-b border-[var(--border-subtle)]' : ''}><button type="button" onClick={() => setIsOpen((open) => !open)} className={`${mobile ? 'flex w-full items-center justify-between py-4' : 'mb-5 block cursor-default text-left'} text-[10px] uppercase tracking-[0.2em]`}>{title}{mobile && <ChevronDown size={15} strokeWidth={1.25} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}</button><div className={`${mobile ? `grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}` : ''}`}><ul className={`${mobile ? 'overflow-hidden' : ''} space-y-3 text-xs opacity-70`}>{links.map(([label, href]) => <li key={href}><Link to={href} className="hover:text-amber-300">{label}</Link></li>)}</ul></div></div>
}

function SocialLinks({ siteConfig }) {
  const InstagramIcon = ({ size = 17 }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
  const links = [[InstagramIcon, 'Instagram', siteConfig.instagram_url], [Music2, 'TikTok', siteConfig.tiktok_url], [MessageCircle, 'WhatsApp', siteConfig.whatsapp_number ? `https://wa.me/${siteConfig.whatsapp_number.replace(/\D/g, '')}` : '']]
  return <div className="flex gap-4">{links.map(([Icon, label, href]) => href && <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="transition-colors hover:text-amber-300"><Icon size={17} strokeWidth={1.25} /></a>)}</div>
}

export default function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useFeedbackState(false)
  const { config } = useSiteConfig()
  const { siteConfig } = useSiteConfigSettings()
  const { t } = useLanguage()
  const sections = [
    { title: t('contact'), links: [[t('boutiqueConcierge'), '/concierge'], [t('findBoutique'), '/boutique'], [t('contactUs'), '/concierge']] },
    { title: t('serviceSupport'), links: [[t('deliveryReturns'), '/delivery-returns'], [t('careGuide'), '/care-guide'], [t('bookAppointment'), '/concierge']] },
    { title: t('ourMaison'), links: [[t('ourStory'), '/our-story'], [t('craftsmanship'), '/craftsmanship'], [t('careers'), '/careers']] },
  ]
  return <><footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)]"><div className="mx-auto hidden max-w-7xl grid-cols-4 gap-12 px-8 py-14 md:grid">{sections.map((section) => <SectionLinks key={section.title} {...section} />)}<div><p className="mb-5 text-[10px] uppercase tracking-[0.2em]">{t('stayUpdated')}</p><p className="mb-5 text-xs opacity-70">{t('stayUpdatedDescription')}</p><button type="button" className="border border-[var(--border-subtle)] px-5 py-3 text-[10px] uppercase tracking-widest">{t('subscribeNewsletter')}</button><div className="mt-6"><SocialLinks siteConfig={siteConfig} /></div></div></div><div className="md:hidden"><div className="px-4">{sections.map((section) => <SectionLinks key={section.title} {...section} mobile />)}</div><div className="space-y-5 px-4 py-8"><button type="button" className="w-full border border-[var(--border-subtle)] py-3 text-[10px] uppercase tracking-widest">{t('subscribeNewsletter')}</button><div className="flex justify-center"><SocialLinks siteConfig={siteConfig} /></div></div></div><div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-4 py-5 text-center text-[9px] uppercase tracking-widest opacity-60 md:flex-row md:items-center md:justify-between md:px-8"><div className="flex flex-wrap justify-center gap-4 md:justify-start"><Link to="/legal/privacy">{t('privacyPolicy')}</Link><Link to="/legal/cookies">{t('cookiesPolicy')}</Link><Link to="/legal/terms">{t('terms')}</Link><Link to="/legal/modern-slavery">{t('modernSlavery')}</Link><button type="button" onClick={() => setFeedbackOpen(true)} className="hover:text-amber-300">{t('clientExperience')}</button></div><span>© 2026 {siteConfig.site_name || config.store_name || t('maison')} - {siteConfig.contact_phone} · {t('allRightsReserved')}</span></div></footer>{feedbackOpen && <SiteFeedbackModal onClose={() => setFeedbackOpen(false)} />}</>
}
