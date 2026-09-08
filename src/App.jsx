import { useEffect } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import ProductCatalog from './components/ProductCatalog'
import SearchResults from './components/SearchResults'
import Footer from './components/Footer'
import Register from './pages/Register'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import Account from './pages/Account'
import Concierge from './pages/Concierge'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Careers from './pages/Careers'
import LegalPrivacy from './pages/LegalPrivacy'
import LegalTerms from './pages/LegalTerms'
import Boutique from './pages/Boutique'
import BagDrawer from './components/BagDrawer'
import WhatsAppConcierge from './components/WhatsAppConcierge'
import WishlistDrawer from './components/WishlistDrawer'
import SEOHead from './components/SEOHead'
import { ConfigProvider } from './context/ConfigContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { SiteConfigProvider } from './context/SiteConfigContext'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import GlobalLoader from './components/GlobalLoader'
import CookieConsent from './components/CookieConsent'
import { trackEvent } from './utils/analytics'
import MaisonInformation from './pages/MaisonInformation'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    trackEvent('page_view', { path: pathname }).catch(() => {})
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <LanguageProvider>
        <AuthProvider>
        <WishlistProvider>
        <SiteConfigProvider>
        <CartProvider>
          <ScrollToTop />
          <GlobalLoader />
          <div className="min-h-screen overflow-x-clip bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
          <SEOHead />
          <div className="fixed left-0 right-0 top-0 z-50">
            <Navbar />
          </div>
          <Routes>
            <Route path="/" element={<main className="overflow-x-clip"><Hero /><ProductCatalog /></main>} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/account" element={<Account />} />
            <Route path="/concierge" element={<Concierge />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/legal/privacy" element={<LegalPrivacy />} />
            <Route path="/legal/terms" element={<LegalTerms />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/care-guide" element={<MaisonInformation page="care" />} />
            <Route path="/delivery-returns" element={<MaisonInformation page="delivery" />} />
            <Route path="/our-story" element={<MaisonInformation page="story" />} />
            <Route path="/craftsmanship" element={<MaisonInformation page="craftsmanship" />} />
            <Route path="/legal/cookies" element={<MaisonInformation page="cookies" />} />
            <Route path="/legal/modern-slavery" element={<MaisonInformation page="slavery" />} />
          </Routes>
          <Footer />
            <BagDrawer />
            <WhatsAppConcierge />
            <WishlistDrawer />
            <CookieConsent />
          </div>
        </CartProvider>
        </SiteConfigProvider>
        </WishlistProvider>
        </AuthProvider>
        </LanguageProvider>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App
