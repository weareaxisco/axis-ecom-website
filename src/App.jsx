import { useEffect } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import ProductCatalog from './components/ProductCatalog'
import ProductDetailPage from './components/ProductDetailPage'
import { ConfigProvider } from './context/ConfigContext'
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
        <ScrollToTop />
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<main><Hero /><ProductCatalog /></main>} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </div>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App
