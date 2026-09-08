import { useLanguage } from '../context/LanguageContext'

export default function LegalPrivacy() {
  const { t } = useLanguage()
  const sections = [
    ['privacyDataHeading', 'privacyDataBody'],
    ['privacyRightsHeading', 'privacyRightsBody'],
    ['privacySecurityHeading', 'privacySecurityBody'],
  ]
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><article className="mx-auto max-w-3xl"><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{t('legalPrivacyEyebrow')}</p><h1 className="mt-4 font-serif text-5xl uppercase tracking-widest">{t('privacyPolicyTitle')}</h1><div className="mt-10 space-y-8 text-sm leading-7 text-neutral-400">{sections.map(([heading, body]) => <section key={heading}><h2 className="font-serif text-2xl text-white">{t(heading)}</h2><p className="mt-3">{t(body)}</p></section>)}</div></article></main>
}
