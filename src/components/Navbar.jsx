import { useEffect, useState } from 'react'
import {
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'

const navigationLinks = [
  'High Jewelry',
  'Fine Jewelry',
  'Timepieces',
  'Collections',
  'The Maison',
  'Concierge',
]

function IconButton({ label, children, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center text-[var(--text-primary)] transition-all duration-300 ease-out hover:text-[var(--accent-gold)] ${className}`}
    >
      {children}
    </button>
  )
}

function MobileDrawer({ config, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
      />
      <aside className="relative flex h-full w-[min(88vw,24rem)] flex-col bg-[var(--bg-primary)] px-6 py-5 text-[var(--text-primary)] shadow-2xl transition-all duration-300 ease-out">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <span className="font-serif text-sm uppercase tracking-[0.15em]">
            {config.store_name}
          </span>
          <IconButton label="Close navigation" onClick={onClose}>
            <X strokeWidth={1.25} size={21} />
          </IconButton>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-6" aria-label="Mobile navigation">
          {navigationLinks.map((link) => (
            <a
              key={link}
              href="#"
              onClick={onClose}
              className="font-serif text-xl tracking-[0.08em] transition-all duration-300 ease-out hover:text-[var(--accent-gold)]"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="space-y-3 border-t border-[var(--border-subtle)] pt-5 text-[10px] uppercase tracking-[0.2em] opacity-70">
          <p>{config.location_city}</p>
          <a href={`tel:${config.phone_number}`}>{config.phone_number}</a>
          <a href={`https://wa.me/${config.whatsapp_number}`}>WhatsApp</a>
        </div>
      </aside>
    </div>
  )
}

export default function Navbar() {
  const { config, themeMode, toggleTheme } = useSiteConfig()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  const cartCount = config.cart_item_count ?? config.cart_count ?? 0

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-transparent bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-300 ease-out ${
          isScrolled
            ? 'border-[var(--border-subtle)]/80 bg-[var(--bg-primary)]/90 shadow-sm backdrop-blur-md'
            : ''
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex h-8 items-center justify-center border-b border-[var(--border-subtle)]/50 text-center">
            <Sparkles
              aria-hidden="true"
              className="mr-2 text-[var(--accent-gold)]"
              size={11}
              strokeWidth={1.25}
            />
            <span className="tracking-[0.25em] text-[10px] uppercase opacity-70">
              {config.brand_tagline || config.location_city}
            </span>
          </div>

          <div className="relative flex h-[4.5rem] items-center justify-between">
            <div className="flex items-center gap-1">
              <IconButton
                label="Open navigation"
                className="md:hidden"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Menu strokeWidth={1.25} size={21} />
              </IconButton>
              <IconButton label="Search">
                <Search strokeWidth={1.25} size={20} />
              </IconButton>
            </div>

            <a
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-center font-serif uppercase tracking-[0.15em] text-xl transition-all duration-300 ease-out hover:text-[var(--accent-gold)] md:text-2xl"
            >
              {config.logo_url ? (
                <img src={config.logo_url} alt={config.store_name} className="max-h-10 max-w-48 object-contain" />
              ) : (
                config.store_name
              )}
            </a>

            <div className="flex items-center gap-1">
              <IconButton
                label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
                onClick={toggleTheme}
              >
                {themeMode === 'dark' ? (
                  <Sun strokeWidth={1.25} size={19} />
                ) : (
                  <Moon strokeWidth={1.25} size={19} />
                )}
              </IconButton>
              <IconButton label="Wishlist" className="hidden sm:inline-flex">
                <Heart strokeWidth={1.25} size={19} />
              </IconButton>
              <IconButton label="Shopping bag" className="relative">
                <ShoppingBag strokeWidth={1.25} size={20} />
                {cartCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[9px] text-[var(--bg-primary)]">
                    {cartCount}
                  </span>
                )}
              </IconButton>
            </div>
          </div>

          <nav className="hidden h-12 items-center justify-center gap-8 lg:flex" aria-label="Main navigation">
            {navigationLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="group relative flex h-full items-center text-[10px] uppercase tracking-[0.2em] opacity-80 transition-all duration-300 ease-out hover:text-[var(--accent-gold)] hover:opacity-100"
              >
                {link}
                <span className="absolute bottom-2 left-0 h-px w-0 bg-[var(--accent-gold)] transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>
      </header>
      <MobileDrawer
        config={config}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}
