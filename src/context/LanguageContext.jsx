import { createContext, useContext, useMemo, useState } from 'react'
import fr from '../locales/fr'
import en from '../locales/en'

const dictionaries = { fr, en }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = window.localStorage.getItem('maison_language')
    return stored === 'en' ? 'en' : 'fr'
  })
  const changeLanguage = (next) => {
    setLanguage(next)
    window.localStorage.setItem('maison_language', next)
  }
  const value = useMemo(() => ({
    language,
    setLanguage: changeLanguage,
    t: (key, fallback = key) => dictionaries[language][key] || dictionaries.en[key] || fallback,
  }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
