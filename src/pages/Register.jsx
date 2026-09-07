import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [title, setTitle] = useState('Mrs.')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const validate = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    setErrors(nextErrors)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-12">
      <div className="mx-auto max-w-3xl">
        <header className="text-center"><p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">The Maison</p><h1 className="mt-3 font-serif text-3xl uppercase tracking-widest md:text-5xl">Create your account</h1></header>
        <form className="mt-12 space-y-8" onSubmit={validate}>
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset className="text-[10px] uppercase tracking-widest"><legend>Title</legend><div className="mt-3 flex gap-5"><label className="flex items-center gap-2"><input type="radio" name="title" value="Mrs." checked={title === 'Mrs.'} onChange={(event) => setTitle(event.target.value)} className="accent-[var(--accent-gold)]" />Mrs.</label><label className="flex items-center gap-2"><input type="radio" name="title" value="Mr." checked={title === 'Mr.'} onChange={(event) => setTitle(event.target.value)} className="accent-[var(--accent-gold)]" />Mr.</label></div></fieldset>
            <span />
            {['First name', 'Last name'].map((label) => <label key={label} className="text-[10px] uppercase tracking-widest">{label}<input required className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /></label>)}
            <label className="relative pb-4 text-[10px] uppercase tracking-widest">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" />{errors.email && <span className="absolute bottom-0 text-[11px] font-mono text-rose-400">{errors.email}</span>}</label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-widest">Country / region<select className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none"><option>Morocco (+212)</option></select></label>
            <label className="text-[10px] uppercase tracking-widest">Phone<input type="tel" placeholder="+212 6XX-XXXXXX" className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 outline-none focus:border-[var(--accent-gold)]" /><small className="mt-2 block normal-case tracking-normal opacity-60">Format: +212 6XX-XXXXXX / +212 7XX-XXXXXX</small></label>
          </div>
          <label className="relative block pb-4 text-[10px] uppercase tracking-widest">Password<div className="mt-2 flex border-b border-[var(--border-subtle)]"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3 outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <span className="absolute bottom-0 text-[11px] font-mono text-rose-400">{errors.password}</span>}</label>
          <label className="flex gap-3 text-xs leading-relaxed opacity-80"><input type="checkbox" required className="mt-1 accent-[var(--accent-gold)]" />I consent to the processing of my personal data under Moroccan Law 09-08 and CNDP requirements.</label>
          <button type="submit" className="w-full bg-[var(--accent-gold)] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black">Create account</button>
        </form>
        <div className="mt-16 border-t border-[var(--border-subtle)] py-8 text-center"><h2 className="font-serif text-lg uppercase tracking-widest">Subscribe to our newsletter</h2><div className="mx-auto mt-5 flex max-w-md border-b border-[var(--border-subtle)]"><input type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">Sign up</button></div></div>
      </div>
    </main>
  )
}
