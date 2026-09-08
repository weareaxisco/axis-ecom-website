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
import SearchDrawer from './SearchDrawer'
import DesktopSearchDropdown from './DesktopSearchDropdown'
import LoginDrawer from './LoginDrawer'
import { useCart } from '../context/CartContext'
import LanguageSwitcher from './LanguageSwitcher'
import { useWishlist } from '../context/WishlistContext'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'

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

function MobileDrawer({ config, isOpen, onClose, themeMode, toggleTheme, onLogin, wishlistCount, onWishlist }) {
  const { t } = useLanguage()
  const mobileLinks = [
    [t('highJewelry'), '/catalog?category=High%20Jewelry'],
    [t('fineJewelry'), '/catalog?category=Fine%20Jewelry'],
    [t('timepieces'), '/catalog?category=Timepieces'],
    [t('menuTheMaison'), '/'],
    [t('concierge'), '/concierge'],
  ]
  return (
    <div className={`pointer-events-none fixed inset-0 z-40 md:hidden ${isOpen ? 'visible' : 'invisible'}`} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed bottom-0 left-0 right-0 top-[60px] z-30 h-[calc(100dvh-60px)] bg-black/75 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'}`}
      />
      <aside className={`fixed bottom-0 left-0 top-[60px] z-40 flex h-auto w-full max-w-full transform flex-col overflow-y-auto bg-[var(--surface-primary)] px-0 pt-0 text-[var(--text-primary)] shadow-2xl transition-transform duration-300 ease-in-out sm:w-[400px] ${isOpen ? 'visible pointer-events-auto translate-x-0' : 'invisible pointer-events-none -translate-x-full'}`}>
        <nav className="flex flex-1 flex-col" aria-label={t('navigation')}>
          {mobileLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5 text-sm uppercase tracking-[0.18em] transition-all duration-300 ease-out first:pt-4 hover:text-[var(--accent-gold)]"
            >
              {label}
              <ChevronRight size={16} strokeWidth={1.25} />
            </a>
          ))}
        </nav>

        <div className="space-y-4 bg-[var(--bg-primary)]/30 p-4 text-[10px] uppercase tracking-[0.18em]">
          <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between">
            {t('themeToggle')}
            {themeMode === 'dark' ? <Sun size={16} strokeWidth={1.25} /> : <Moon size={16} strokeWidth={1.25} />}
          </button>
          <div className="flex items-center justify-between">
            <span>{t('language')}</span>
            <LanguageSwitcher />
          </div>
          <button type="button" onClick={() => { onClose(); onWishlist() }} className="flex w-full items-center justify-between text-left">{t('favorites')} <span className="flex items-center gap-2"><span className="font-medium text-amber-400">{wishlistCount}</span><Heart size={16} strokeWidth={1.25} className="fill-amber-400 text-amber-400" /></span></button>
          <button type="button" onClick={() => { onClose(); onLogin() }} className="flex w-full items-center justify-between text-left">{t('signInAccount')} <User size={16} strokeWidth={1.25} /></button>
          <div className="space-y-1 border-t border-[var(--border-subtle)] pt-4 opacity-70">
            <p>{config.location_city} | {config.phone_number}</p>
            <a href={`https://wa.me/${config.whatsapp_number}`}>{t('boutiqueConcierge')}</a>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function Navbar() {
  const { config, themeMode, toggleTheme } = useSiteConfig()
  const { siteConfig } = useSiteConfigSettings()
  const brandName = siteConfig.site_name || config.store_name
  const { cartItems, setIsBagOpen } = useCart()
  const { wishlistItems, setIsWishlistOpen } = useWishlist()
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('up')
  const [isDesktopHeaderVisible, setIsDesktopHeaderVisible] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let revealTimer
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY
      if (Math.abs(delta) < 6 && currentScrollY > 20) return
      setIsScrolled(currentScrollY > 20)
      setScrollY(currentScrollY)
      const nextDirection = delta < 0 ? 'up' : 'down'
      setScrollDirection(nextDirection)
      setIsDesktopHeaderVisible(currentScrollY <= 20 || nextDirection === 'up')
      lastScrollY = currentScrollY
      window.clearTimeout(revealTimer)
      revealTimer = window.setTimeout(() => setIsDesktopHeaderVisible(true), 220)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.clearTimeout(revealTimer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', '60px')
    document.documentElement.style.setProperty('--header-stack-height', '104px')
    return () => {
      document.documentElement.style.removeProperty('--header-height')
      document.documentElement.style.removeProperty('--header-stack-height')
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--desktop-navbar-offset', isDesktopHeaderVisible ? '152px' : '0px')
    document.documentElement.style.setProperty('--mobile-navbar-offset', '104px')
  }, [isDesktopHeaderVisible])

  useEffect(() => {
    const isOverlayOpen = isDrawerOpen || isSearchOpen
    document.documentElement.style.overflow = isOverlayOpen ? 'hidden' : ''
    document.body.style.overflow = isOverlayOpen ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen, isSearchOpen])

  useEffect(() => {
    if (!isDrawerOpen && !isSearchOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false)
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, isSearchOpen])

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const toggleDesktopSearch = () => {
    setIsDrawerOpen(false)
    setIsSearchOpen((open) => !open)
  }
  const handleLeftIconClick = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
    } else if (isDrawerOpen) {
      setIsDrawerOpen(false)
    } else {
      setIsDrawerOpen(true)
    }
  }
  return (
    <>
      <header
        data-scroll-y={scrollY}
        data-scroll-direction={scrollDirection}
        className={`relative z-50 w-full border-b border-transparent bg-transparent text-[var(--text-primary)] transition-all duration-300 ease-out md:fixed md:left-0 md:right-0 md:top-0 md:z-50 md:bg-[var(--bg-primary)] ${isDesktopHeaderVisible ? 'md:translate-y-0' : 'md:-translate-y-full'} ${
          isScrolled
            ? 'border-[var(--border-subtle)]/80 bg-[var(--bg-primary)]/90 shadow-sm backdrop-blur-md'
            : ''
        }`}
      >
        <div className="fixed left-0 right-0 top-0 z-50 md:hidden">
          <div className="relative z-50 flex h-[60px] w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4">
            <div className="flex w-[60px] items-center justify-start">
              <IconButton label={isDrawerOpen || isSearchOpen ? t('closeOverlay') : t('openNavigation')} onClick={handleLeftIconClick}>
                {isDrawerOpen || isSearchOpen ? <X className="h-5 w-5" strokeWidth={1.25} /> : <Menu className="h-5 w-5" strokeWidth={1.25} />}
              </IconButton>
            </div>
            <a href="/" className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate px-2 text-center font-serif text-sm tracking-widest">
              {brandName}
            </a>
            <div className="flex w-[60px] items-center justify-end">
              <IconButton label={t('shoppingBag')} className="relative" onClick={() => setIsBagOpen(true)}>
              <ShoppingBag strokeWidth={1.25} size={19} />
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[9px] text-[var(--bg-primary)]">{cartCount}</span>}
              </IconButton>
            </div>
          </div>
        </div>
        <div className={`fixed left-0 right-0 top-[60px] z-20 h-12 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 md:hidden ${!isDrawerOpen && !isSearchOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className="relative">
            <Search size={16} strokeWidth={1.25} className="pointer-events-none absolute left-3 top-2.5 text-[var(--text-primary)] opacity-60" />
            <input type="search" readOnly onClick={() => setIsSearchOpen(true)} onFocus={() => setIsSearchOpen(true)} placeholder={t('search')} aria-label={t('search')} className="relative z-20 w-full rounded-full bg-[var(--bg-primary)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-primary)] placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" />
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
                label={t('openNavigation')}
                className="md:hidden"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Menu strokeWidth={1.25} size={21} />
              </IconButton>
              <div className="relative flex h-10 w-10 shrink-0 select-none items-center justify-center">
                  <IconButton label={isSearchOpen ? t('closeSearch') : t('search')} onClick={toggleDesktopSearch} className="relative h-9 w-9 shrink-0">
                    <Search className={`absolute inset-0 m-auto h-5 w-5 transition-all duration-200 ease-out ${isSearchOpen ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}`} strokeWidth={1.25} />
                    <X className={`absolute inset-0 m-auto h-5 w-5 transition-all duration-200 ease-out ${isSearchOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} strokeWidth={1.25} />
                  </IconButton>
              </div>
            </div>

            <a
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-center font-serif uppercase tracking-[0.15em] text-xl transition-all duration-300 ease-out hover:text-[var(--accent-gold)] md:text-2xl"
            >
              {config.logo_url ? (
                <img src={config.logo_url} alt={brandName} className="max-h-10 max-w-48 object-contain" />
              ) : (
                brandName
              )}
            </a>

            <div className="flex h-10 items-center gap-1">
            <LanguageSwitcher />
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
              <IconButton label={t('wishlist')} className="relative hidden sm:inline-flex" onClick={() => setIsWishlistOpen(true)}>
                <Heart strokeWidth={1.25} size={19} />
                {wishlistItems.length > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[9px] text-[var(--bg-primary)]">{wishlistItems.length}</span>}
              </IconButton>
              <IconButton label={t('account')} className="hidden sm:inline-flex">
                <span onClick={() => setIsLoginOpen(true)} className="flex h-full w-full items-center justify-center">
                <User strokeWidth={1.25} size={19} />
                </span>
              </IconButton>
              <IconButton label={t('shoppingBag')} className="relative" onClick={() => setIsBagOpen(true)}>
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
            {[
              [t('highJewelry'), '/catalog?category=High%20Jewelry'],
              [t('fineJewelry'), '/catalog?category=Fine%20Jewelry'],
              [t('timepieces'), '/catalog?category=Timepieces'],
              [t('menuTheMaison'), '/'],
              [t('concierge'), '/concierge'],
            ].map(([link, href]) => (
              <a
                key={link}
                href={href}
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
        onLogin={() => setIsLoginOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlist={() => setIsWishlistOpen(true)}
      />
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <DesktopSearchDropdown
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LoginDrawer isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  )
}
