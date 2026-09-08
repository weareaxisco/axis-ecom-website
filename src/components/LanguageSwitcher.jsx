import { useLanguage } from '../context/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  return <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em]" aria-label="Language"><button type="button" onClick={() => setLanguage('fr')} className={language === 'fr' ? 'text-amber-400' : 'text-neutral-500'}>FR</button><span className="text-neutral-700">|</span><button type="button" onClick={() => setLanguage('en')} className={language === 'en' ? 'text-amber-400' : 'text-neutral-500'}>EN</button></div>
}
