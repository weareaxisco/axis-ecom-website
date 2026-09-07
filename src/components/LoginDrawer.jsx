import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginDrawer({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const validate = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    setErrors(nextErrors)
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
          <label className="block text-[10px] uppercase tracking-widest">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border-b border-amber-500/30 bg-transparent px-0 py-3 text-sm outline-none focus:border-amber-500" />{errors.email && <span className="mt-1 block text-[11px] text-rose-400">{errors.email}</span>}</label>
          <label className="block text-[10px] uppercase tracking-widest">Password<div className="mt-2 flex items-center border-b border-amber-500/30"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent px-0 py-3 text-sm outline-none focus:border-amber-500" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <span className="mt-1 block text-[11px] text-rose-400">{errors.password}</span>}</label>
          <button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">Forgot Password?</button>
          <button type="submit" className="w-full bg-[var(--accent-gold)] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black">Login</button>
        </form>
        <Link to="/register" onClick={onClose} className="mt-auto border border-[var(--border-subtle)] py-4 text-center text-[10px] uppercase tracking-widest transition-colors hover:border-[var(--accent-gold)]">Don't have an account yet? Register</Link>
      </aside>
    </div>
  )
}
