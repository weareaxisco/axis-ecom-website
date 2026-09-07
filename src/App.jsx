import Hero from './components/Hero'
import Navbar from './components/Navbar'
import ProductCatalog from './components/ProductCatalog'
import ProductDetailPage from './components/ProductDetailPage'
import { ConfigProvider } from './context/ConfigContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
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
