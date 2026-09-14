import BrandLogo from './common/BrandLogo'

export default function LoadingScreen() {
  return <main role="status" aria-live="polite" aria-label="Loading" className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center">
    <BrandLogo className="mx-auto mb-4 h-12 w-auto max-w-[220px] animate-pulse object-contain" textClassName="font-serif text-2xl uppercase tracking-[0.25em] text-amber-200" />
  </main>
}
