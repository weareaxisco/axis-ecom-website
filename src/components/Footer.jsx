import { useState } from 'react'
import { ChevronDown, Heart, MessageCircle, Play } from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'
import { useSiteConfigSettings } from '../context/SiteConfigContext'

const sections = [
  { title: 'Contact', links: ['Boutique Concierge', 'Find a boutique', 'Contact us'] },
  { title: 'Service & Support', links: ['Delivery & returns', 'Care guide', 'Book an appointment'] },
  { title: 'Our Maison', links: ['Our story', 'Craftsmanship', 'Careers'] },
]

function SectionLinks({ title, links, mobile = false }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={mobile ? 'border-b border-[var(--border-subtle)]' : ''}>
      <button type="button" onClick={() => setIsOpen((open) => !open)} className={`${mobile ? 'flex w-full items-center justify-between py-4' : 'mb-5 block cursor-default text-left'} text-[10px] uppercase tracking-[0.2em]`}>
        {title}
        {mobile && <ChevronDown size={15} strokeWidth={1.25} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      <div className={`${mobile ? `grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}` : ''}`}>
        <ul className={`${mobile ? 'overflow-hidden pb-0' : ''} space-y-3 text-xs opacity-70`}>
          {links.map((link) => <li key={link}><a href="#">{link}</a></li>)}
        </ul>
      </div>
    </div>
  )
}

export default function Footer() {
  const { config } = useSiteConfig()
  const { siteConfig } = useSiteConfigSettings()
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <div className="hidden border-b border-[var(--border-subtle)] px-8 py-3 text-[10px] uppercase tracking-widest opacity-70 md:flex md:justify-between">
        <span>International</span>
        <span className="flex gap-6"><button type="button">Enable high contrast</button><button type="button">Disable animations</button></span>
      </div>
      <div className="hidden mx-auto max-w-7xl grid-cols-4 gap-12 px-8 py-14 md:grid">
        {sections.map((section) => <SectionLinks key={section.title} {...section} />)}
        <div>
          <p className="mb-5 text-[10px] uppercase tracking-[0.2em]">Stay up to date</p>
          <p className="mb-5 text-xs opacity-70">Discover new creations and maison news.</p>
          <button type="button" className="border border-[var(--border-subtle)] px-5 py-3 text-[10px] uppercase tracking-widest">Subscribe to newsletter</button>
          <div className="mt-6 flex gap-4"><Heart size={16} strokeWidth={1.25} /><MessageCircle size={16} strokeWidth={1.25} /><Play size={16} strokeWidth={1.25} /></div>
        </div>
      </div>
      <div className="md:hidden">
        <div className="border-b border-[var(--border-subtle)] px-4 py-3 text-[10px] uppercase tracking-widest opacity-60">Home / Collections / Fine Jewelry</div>
        <div className="px-4">{sections.map((section) => <SectionLinks key={section.title} {...section} mobile />)}</div>
        <div className="space-y-5 px-4 py-8">
          <button type="button" className="w-full border border-[var(--border-subtle)] py-3 text-[10px] uppercase tracking-widest">Subscribe to newsletter</button>
          <div className="flex justify-center gap-6"><Heart size={17} strokeWidth={1.25} /><MessageCircle size={17} strokeWidth={1.25} /><Play size={17} strokeWidth={1.25} /></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-4 py-5 text-center text-[9px] uppercase tracking-widest opacity-60 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-wrap justify-center gap-4 md:justify-start"><a href="#">Privacy Policy</a><a href="#">Cookies Policy</a><a href="#">Terms</a><a href="#">Modern Slavery Act</a></div>
        <span>© 2026 {siteConfig.site_name || config.store_name || "Maison de L'Élégance"} - {siteConfig.contact_phone} · All rights reserved</span>
      </div>
    </footer>
  )
}
