import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

const pageKeys = {
  care: ['careGuidePageTitle', 'careGuidePageIntro', 'careGuidePageSections'],
  delivery: ['deliveryReturnsPageTitle', 'deliveryReturnsPageIntro', 'deliveryReturnsPageSections'],
  story: ['ourStoryPageTitle', 'ourStoryPageIntro', 'ourStoryPageSections'],
  craftsmanship: ['craftsmanshipPageTitle', 'craftsmanshipPageIntro', 'craftsmanshipPageSections'],
  cookies: ['cookiesPageTitle', 'cookiesPageIntro', 'cookiesPageSections'],
  slavery: ['modernSlaveryPageTitle', 'modernSlaveryPageIntro', 'modernSlaveryPageSections'],
}

export default function MaisonInformation({ page }) {
  const { t } = useLanguage()
  const [titleKey, introKey, sectionsKey] = pageKeys[page]
  const title = t(titleKey)
  const sections = t(sectionsKey)

  useEffect(() => {
    document.title = `${title} | ${t('maison')}`
    return () => { document.title = t('maison') }
  }, [title, t])

  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><article className="mx-auto max-w-3xl"><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{t('maison')}</p><h1 className="mt-4 font-serif text-5xl uppercase tracking-widest">{title}</h1><p className="mt-8 text-base leading-8 text-neutral-300">{t(introKey)}</p><div className="mt-10 space-y-8 text-sm leading-7 text-neutral-400">{sections.map((section) => <section key={section.heading}><h2 className="font-serif text-2xl text-white">{section.heading}</h2><p className="mt-3">{section.body}</p></section>)}</div></article></main>
}
