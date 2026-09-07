import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginDrawer({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isOpen}>
      <button type="button" aria-label="Close login" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <aside className={`absolute inset-y-0 right-0 flex h-full w-full max-w-md transform flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 text-[var(--text-primary)] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <h2 className="font-serif text-xl uppercase tracking-widest">Login</h2>
          <button type="button" aria-label="Close login" onClick={onClose} className="p-2 opacity-70 hover:text-[var(--accent-gold)]"><X size={20} strokeWidth={1.25} /></button>
        </div>
        <form className="mt-10 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-[10px] uppercase tracking-widest">Email<input type="email" required className="mt-2 w-full border-b border-[var(--border-subtle)] bg-transparent px-0 py-3 text-sm outline-none focus:border-[var(--accent-gold)]" /></label>
          <label className="block text-[10px] uppercase tracking-widest">Password<div className="mt-2 flex items-center border-b border-[var(--border-subtle)]"><input type={showPassword ? 'text' : 'password'} required className="w-full bg-transparent px-0 py-3 text-sm outline-none focus:border-[var(--accent-gold)]" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">Forgot Password?</button>
          <button type="submit" className="w-full bg-[var(--accent-gold)] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black">Login</button>
        </form>
        <Link to="/register" onClick={onClose} className="mt-auto border border-[var(--border-subtle)] py-4 text-center text-[10px] uppercase tracking-widest transition-colors hover:border-[var(--accent-gold)]">Don't have an account yet? Register</Link>
      </aside>
    </div>
  )
}
