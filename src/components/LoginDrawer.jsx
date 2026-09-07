import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function LoginDrawer({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const validate = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setSubmitError(error.message)
  }

  return (
    <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isOpen}>
      <button type="button" aria-label="Close login" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <aside className={`absolute inset-0 flex h-full w-full max-w-md transform flex-col border border-amber-500/30 bg-neutral-950 p-6 text-[var(--text-primary)] shadow-2xl transition-transform duration-300 md:inset-y-0 md:left-auto md:right-0 md:border-y-0 md:border-r-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <h2 className="font-serif text-xl uppercase tracking-widest">Login</h2>
          <button type="button" aria-label="Close login" onClick={onClose} className="p-2 opacity-70 hover:text-[var(--accent-gold)]"><X size={20} strokeWidth={1.25} /></button>
        </div>
        <form className="mt-10 space-y-5" onSubmit={validate}>
          <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">Email<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: '' })) }} className="mt-1.5 w-full rounded-none border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200 outline-none transition-all focus:border-amber-500/70 focus:bg-neutral-900" /><span className="block min-h-[18px] pt-1 text-[11px] text-rose-400">{errors.email || ''}</span></label>
          <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">Password<div className="relative mt-1.5"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })) }} className="w-full rounded-none border border-neutral-800 bg-neutral-900/60 px-4 py-3 pr-12 text-sm text-neutral-200 outline-none transition-all focus:border-amber-500/70 focus:bg-neutral-900" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-neutral-400 hover:text-amber-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><span className="block min-h-[18px] pt-1 text-[11px] text-rose-400">{errors.password || ''}</span></label>
          <button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">Forgot Password?</button>
          <button type="submit" className="w-full bg-[var(--accent-gold)] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black">Login</button>
          {submitError && <p className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{submitError}</p>}
        </form>
        <Link to="/register" onClick={onClose} className="mt-auto border border-[var(--border-subtle)] py-4 text-center text-[10px] uppercase tracking-widest transition-colors hover:border-[var(--accent-gold)]">Don't have an account yet? Register</Link>
      </aside>
    </div>
  )
}
