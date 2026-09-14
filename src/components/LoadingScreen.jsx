import BrandLogo from './common/BrandLogo'

export default function LoadingScreen() {
  return <main role="status" aria-live="polite" aria-label="Loading" className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center">
    <BrandLogo className="animate-pulse" textClassName="font-serif text-lg uppercase tracking-[0.35em] text-amber-400 sm:text-xl" />
  </main>
}
