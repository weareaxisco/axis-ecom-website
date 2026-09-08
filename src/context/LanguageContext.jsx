import { createContext, useContext, useMemo, useState } from 'react'

const dictionaries = {
  fr: {
    highJewelry: 'Haute Joaillerie', timepieces: 'Horlogerie', concierge: 'Concierge',
    addToBag: 'Ajouter au panier', checkout: 'Acheter', delivery: 'Livraison gratuite au Maroc',
    priceInDh: 'Prix en DH', cod: 'Paiement à la livraison',
  },
  en: {
    highJewelry: 'High Jewelry', timepieces: 'Timepieces', concierge: 'Concierge',
    addToBag: 'Add to Shopping Bag', checkout: 'Checkout', delivery: 'Complimentary Delivery across Morocco',
    priceInDh: 'Price in DH', cod: 'Cash on Delivery',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => window.localStorage.getItem('maison_language') || 'fr')
  const changeLanguage = (next) => {
    setLanguage(next)
    window.localStorage.setItem('maison_language', next)
  }
  const value = useMemo(() => ({ language, setLanguage: changeLanguage, t: (key) => dictionaries[language][key] || key }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
