import { useSiteConfigSettings } from '../context/SiteConfigContext'

export default function Careers() {
  const { siteConfig } = useSiteConfigSettings()
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10">
    <div className="mx-auto max-w-5xl">
      <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Join the Maison</p>
      <h1 className="mt-4 font-serif text-5xl uppercase tracking-widest">Careers</h1>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-400">Build a future of exceptional craft, thoughtful service, and timeless Moroccan luxury with {siteConfig.site_name}.</p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section className="border border-neutral-800 p-6"><h2 className="font-serif text-2xl">Boutique opportunities</h2><ul className="mt-6 space-y-4 text-sm text-neutral-400"><li>Client Advisor - Casablanca</li><li>Jewellery Specialist - Casablanca</li><li>Client Experience Intern - Casablanca</li></ul></section>
        <form className="border border-neutral-800 p-6"><h2 className="font-serif text-2xl">Express your interest</h2><div className="mt-6 space-y-4"><input required aria-label="Name" placeholder="Name" className="w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><input required type="email" aria-label="Email" placeholder="Email" className="w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><textarea required aria-label="Message" placeholder="Tell us about your experience" className="h-32 w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><button type="submit" className="bg-amber-400 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black">Send application</button></div></form>
      </div>
    </div>
  </main>
}
