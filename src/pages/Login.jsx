import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import ResendVerificationModal from '../components/ResendVerificationModal'

export default function Login() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError) {
      setError(signInError.message)
      if (signInError.message.toLowerCase().includes('email not confirmed')) setShowVerification(true)
      return
    }
    navigate(location.state?.from || '/account', { replace: true })
  }
  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)]"><section className="mx-auto max-w-md border border-neutral-800 bg-neutral-950/70 p-8 md:p-12"><p className="text-center text-[10px] uppercase tracking-[0.25em] text-amber-400">{t('maison')}</p><h1 className="mt-3 text-center font-serif text-3xl uppercase tracking-widest">{t('login')}</h1><form onSubmit={submit} className="mt-10 space-y-5"><label className="block text-[10px] uppercase tracking-widest text-neutral-400">{t('email')}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-amber-500" /></label><label className="block text-[10px] uppercase tracking-widest text-neutral-400">{t('password')}<div className="relative mt-2"><input required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-neutral-800 bg-neutral-900 px-4 py-3 pr-12 text-sm outline-none focus:border-amber-500" /><button type="button" aria-label={t('togglePassword')} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-neutral-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <p className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{error}</p>}<button type="submit" className="w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black">{t('login')}</button></form>{error.toLowerCase().includes('confirm') && <button type="button" onClick={() => setShowVerification(true)} className="mt-4 text-xs text-amber-400 underline">{t('resendVerification')}</button>}  <div className="mt-8 border-t border-neutral-800 pt-6 text-center"><p className="text-[10px] uppercase tracking-widest text-neutral-500">{t('alreadyHaveAccount')}</p><Link to="/register" className="mt-3 inline-flex border border-amber-500 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500 hover:text-black">{t('createAccount')}</Link></div></section>{showVerification && <ResendVerificationModal email={email} onClose={() => setShowVerification(false)} />}</main>
}
