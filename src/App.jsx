import { useEffect } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import ProductCatalog from './components/ProductCatalog'
import SearchResults from './components/SearchResults'
import Footer from './components/Footer'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import Account from './pages/Account'
import Concierge from './pages/Concierge'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import BagDrawer from './components/BagDrawer'
import WhatsAppConcierge from './components/WhatsAppConcierge'
import SEOHead from './components/SEOHead'
import { ConfigProvider } from './context/ConfigContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <CartProvider>
          <ScrollToTop />
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
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/account" element={<Account />} />
            <Route path="/concierge" element={<Concierge />} />
            <Route path="/catalog" element={<Catalog />} />
          </Routes>
          <Footer />
            <BagDrawer />
            <WhatsAppConcierge />
          </div>
        </CartProvider>
        </WishlistProvider>
        </AuthProvider>
        </LanguageProvider>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App
