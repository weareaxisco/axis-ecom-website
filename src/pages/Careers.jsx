import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'

export default function Careers() {
  const { siteConfig } = useSiteConfigSettings()
  const { t } = useLanguage()
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10">
    <div className="mx-auto max-w-5xl">
      <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{t('joinMaison')}</p>
      <h1 className="mt-4 font-serif text-5xl uppercase tracking-widest">{t('careers')}</h1>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-400">{t('careersIntro')} {siteConfig.site_name}.</p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section className="border border-neutral-800 p-6"><h2 className="font-serif text-2xl">{t('boutiqueOpportunities')}</h2><ul className="mt-6 space-y-4 text-sm text-neutral-400"><li>{t('clientAdvisor')}</li><li>{t('jewellerySpecialist')}</li><li>{t('clientExperienceIntern')}</li></ul></section>
        <form className="border border-neutral-800 p-6"><h2 className="font-serif text-2xl">{t('expressInterest')}</h2><div className="mt-6 space-y-4"><input required aria-label={t('name')} placeholder={t('name')} className="w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><input required type="email" aria-label={t('email')} placeholder={t('email')} className="w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><textarea required aria-label={t('experienceMessage')} placeholder={t('experienceMessage')} className="h-32 w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><button type="submit" className="bg-amber-400 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black">{t('sendApplication')}</button></div></form>
      </div>
    </div>
  </main>
}
