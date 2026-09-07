import { useEffect, useState } from 'react'
import {
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
  X,
  ChevronRight,
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

function MobileDrawer({ config, isOpen, onClose, themeMode, toggleTheme }) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-40 md:hidden ${isOpen ? 'visible' : 'invisible'}`} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`pointer-events-auto fixed bottom-0 left-0 right-0 top-14 z-30 h-[calc(100dvh-3.5rem)] bg-black/70 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside className={`pointer-events-auto fixed bottom-0 left-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] w-[85vw] max-w-sm transform flex-col overflow-y-auto bg-[var(--surface-primary)] px-0 pt-0 text-[var(--text-primary)] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex flex-1 flex-col" aria-label="Mobile navigation">
          {navigationLinks.map((link) => (
            <a
              key={link}
              href="#"
              onClick={onClose}
              className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5 text-sm uppercase tracking-[0.18em] transition-all duration-300 ease-out first:pt-6 hover:text-[var(--accent-gold)]"
            >
              {link}
              <ChevronRight size={16} strokeWidth={1.25} />
            </a>
          ))}
        </nav>

        <div className="space-y-4 bg-[var(--bg-primary)]/30 p-4 text-[10px] uppercase tracking-[0.18em]">
          <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between">
            Theme Toggle
            {themeMode === 'dark' ? <Sun size={16} strokeWidth={1.25} /> : <Moon size={16} strokeWidth={1.25} />}
          </button>
          <a href="#" onClick={onClose} className="flex items-center justify-between">Favorites <span className="flex items-center gap-2"><Heart size={16} strokeWidth={1.25} />{config.favorite_count ?? 0}</span></a>
          <a href="#" onClick={onClose} className="flex items-center justify-between">Sign In / Account <User size={16} strokeWidth={1.25} /></a>
          <div className="space-y-1 border-t border-[var(--border-subtle)] pt-4 opacity-70">
            <p>{config.location_city} | {config.phone_number}</p>
            <a href={`https://wa.me/${config.whatsapp_number}`}>Boutique Concierge</a>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function Navbar() {
  const { config, themeMode, toggleTheme } = useSiteConfig()
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('up')
  const [isMobileHeaderVisible, setIsMobileHeaderVisible] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 20)
      setScrollY(currentScrollY)
      const nextDirection = currentScrollY < lastScrollY ? 'up' : 'down'
      setScrollDirection(nextDirection)
      setIsMobileHeaderVisible(currentScrollY <= 20 || nextDirection === 'up')
      lastScrollY = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = isDrawerOpen ? 'hidden' : ''
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  const cartCount = config.cart_item_count ?? config.cart_count ?? 0

  return (
    <>
      <header
        data-scroll-y={scrollY}
        data-scroll-direction={scrollDirection}
        className={`sticky top-0 z-50 w-full border-b border-transparent bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-300 ease-out md:z-40 ${
          isScrolled
            ? 'border-[var(--border-subtle)]/80 bg-[var(--bg-primary)]/90 shadow-sm backdrop-blur-md'
            : ''
        }`}
      >
        <div className={`relative z-50 md:hidden transition-transform duration-300 ease-out ${isMobileHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="relative z-50 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] px-4">
            <IconButton label={isDrawerOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setIsDrawerOpen((open) => !open)}>
              {isDrawerOpen ? <X className="h-5 w-5" strokeWidth={1.25} /> : <Menu className="h-5 w-5" strokeWidth={1.25} />}
            </IconButton>
            <a href="/" className="truncate px-2 text-center font-serif text-sm tracking-widest">
              {config.store_name}
            </a>
            <IconButton label="Shopping bag" className="relative">
              <ShoppingBag strokeWidth={1.25} size={19} />
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[9px] text-[var(--bg-primary)]">{cartCount}</span>}
            </IconButton>
          </div>
          <div className="relative z-40 h-12 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2">
            <div className="relative">
              <Search size={16} strokeWidth={1.25} className="absolute left-3 top-2.5 text-[var(--text-primary)] opacity-60" />
              <input type="search" placeholder="Search creations" className="w-full rounded-full bg-[var(--bg-primary)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-primary)] placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" />
            </div>
          </div>
        </div>
        <div className="mx-auto hidden max-w-7xl px-5 sm:px-8 md:block lg:px-10">
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
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />
    </>
  )
}
