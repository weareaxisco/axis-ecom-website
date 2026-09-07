import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-12">
      <div className="mx-auto max-w-3xl">
        <header className="text-center"><p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">The Maison</p><h1 className="mt-3 font-serif text-3xl uppercase tracking-widest md:text-5xl">Create your account</h1></header>
        <form className="mt-12 space-y-8" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-widest">Title<select className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none"><option>Mrs</option><option>Mr</option></select></label>
            <span />
            <label className="text-[10px] uppercase tracking-widest">First name<input required className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /></label>
            <label className="text-[10px] uppercase tracking-widest">Last name<input required className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /></label>
            <label className="text-[10px] uppercase tracking-widest">Email<input type="email" required className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /></label>
            <label className="text-[10px] uppercase tracking-widest">Confirm email<input type="email" required className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-widest">Country / region<select className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none"><option>Morocco (+212)</option></select></label>
            <label className="text-[10px] uppercase tracking-widest">Phone<input type="tel" placeholder="+212 6XX-XXXXXX" className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /><small className="mt-2 block normal-case tracking-normal opacity-60">Format: +212 6XX-XXXXXX / +212 7XX-XXXXXX</small></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-widest">Password<div className="mt-2 flex border-b border-[var(--border-subtle)]"><input type={showPassword ? 'text' : 'password'} required className="w-full bg-transparent py-3 outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <label className="text-[10px] uppercase tracking-widest">Confirm password<div className="mt-2 flex border-b border-[var(--border-subtle)]"><input type={showConfirmPassword ? 'text' : 'password'} required className="w-full bg-transparent py-3 outline-none" /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          </div>
          <label className="flex gap-3 text-xs leading-relaxed opacity-80"><input type="checkbox" required className="mt-1 accent-[var(--accent-gold)]" />I consent to the processing of my personal data under Moroccan Law 09-08 and CNDP requirements.</label>
          <button type="submit" className="w-full bg-[var(--accent-gold)] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black">Create account</button>
        </form>
        <div className="mt-16 border-t border-[var(--border-subtle)] py-8 text-center"><h2 className="font-serif text-lg uppercase tracking-widest">Subscribe to our newsletter</h2><div className="mx-auto mt-5 flex max-w-md border-b border-[var(--border-subtle)]"><input type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">Sign up</button></div></div>
      </div>
    </main>
  )
}
