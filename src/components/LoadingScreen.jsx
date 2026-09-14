import BrandLogo from './common/BrandLogo'

export default function LoadingScreen() {
  return <div role="status" aria-live="polite" aria-label="Loading" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950">
    <BrandLogo className="mb-6 h-16 w-auto max-w-[240px] animate-pulse object-contain" textClassName="font-serif text-2xl uppercase tracking-[0.25em] text-amber-200" />
    <div className="h-0.5 w-24 animate-pulse bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
  </div>
}
