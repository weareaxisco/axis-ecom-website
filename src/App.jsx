import Hero from './components/Hero'
import Navbar from './components/Navbar'
import { ConfigProvider } from './context/ConfigContext'
import './App.css'

function App() {
  return (
    <ConfigProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Navbar />
        <main>
          <Hero />
        </main>
      </div>
    </ConfigProvider>
  )
}

export default App
