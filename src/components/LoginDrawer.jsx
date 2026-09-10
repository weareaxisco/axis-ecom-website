import { useLayoutEffect, useRef, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function LoginDrawer({ isOpen, onClose, onSuccess }) {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const drawerRef = useRef(null)
  useLayoutEffect(() => {
    if (!isOpen && drawerRef.current?.contains(document.activeElement)) document.activeElement.blur()
  }, [isOpen])
  const validate = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t('invalidEmail')
    if (password.length < 6) nextErrors.password = t('passwordMinLength')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setSubmitError(error.message)
        return
      }
      onSuccess?.()
    } catch (error) {
      setSubmitError(error.message || t('loginFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div inert={!isOpen} className={`fixed inset-0 z-[90] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isOpen}>
      <button type="button" aria-label={t('closeLogin')} onClick={onClose} className="absolute inset-0 top-[60px] bg-black/70 backdrop-blur-sm md:inset-0" />
      <aside ref={drawerRef} className={`absolute inset-x-0 bottom-0 top-[60px] flex h-[calc(100dvh-60px)] w-full max-w-md transform flex-col border border-amber-500/30 bg-neutral-950 p-6 text-[var(--text-primary)] shadow-2xl transition-transform duration-300 md:inset-y-0 md:left-auto md:right-0 md:h-full md:border-y-0 md:border-r-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="relative z-50 flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <h2 className="font-serif text-xl uppercase tracking-widest">{t('login')}</h2>
          <button type="button" aria-label={t('closeLogin')} onClick={onClose} className="p-2 opacity-70 hover:text-[var(--accent-gold)]"><X size={22} strokeWidth={1.25} /></button>
        </div>
        <form className="mt-10 space-y-5" onSubmit={validate}>
          <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">{t('email')}<input type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: '' })) }} className="mt-1.5 w-full rounded-none border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200 outline-none transition-all focus:border-amber-500/70 focus:bg-neutral-900" /><span className="block min-h-[18px] pt-1 text-[11px] text-rose-400">{errors.email || ''}</span></label>
          <label className="block text-[11px] font-medium uppercase tracking-widest text-neutral-400">{t('password')}<div className="relative mt-1.5"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })) }} className="w-full rounded-none border border-neutral-800 bg-neutral-900/60 px-4 py-3 pr-12 text-sm text-neutral-200 outline-none transition-all focus:border-amber-500/70 focus:bg-neutral-900" /><button type="button" aria-label={t('togglePassword')} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-neutral-400 hover:text-amber-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><span className="block min-h-[18px] pt-1 text-[11px] text-rose-400">{errors.password || ''}</span></label>
          <button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">{t('forgotPassword')}</button>
          <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--accent-gold)] py-4 text-xs font-semibold tracking-[0.2em] text-black disabled:cursor-wait disabled:opacity-60">{isSubmitting ? t('signingIn') : t('login')}</button>
          {submitError && <p className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{submitError}</p>}
        </form>
        <Link to="/register" onClick={onClose} className="mt-auto border border-[var(--border-subtle)] py-4 text-center text-[10px] uppercase tracking-widest transition-colors hover:border-[var(--accent-gold)]">{t('noAccount')} {t('register')}</Link>
      </aside>
    </div>
  )
}
