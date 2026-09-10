import { useState } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function ResendVerificationModal({ email, onClose }) {
  const { t } = useLanguage()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const resend = async () => {
    setSending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin } })
    setSending(false)
    setMessage(error ? error.message : t('verificationSent'))
  }
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div role="dialog" aria-modal="true" aria-labelledby="verify-email-title" className="relative w-full max-w-sm border border-neutral-800 bg-neutral-950 p-6 text-white"><button type="button" onClick={onClose} aria-label={t('close')} className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center text-neutral-300 transition-colors hover:text-amber-400"><X size={20} strokeWidth={1.5} /></button><h2 id="verify-email-title" className="pr-10 font-serif text-2xl">{t('verifyEmailTitle')}</h2><p className="mt-3 text-sm text-neutral-400">{t('resendVerificationDescription')} {email}.</p>{message && <p className="mt-4 text-xs text-amber-300">{message}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="flex-1 border border-neutral-700 py-3 text-xs uppercase tracking-widest">{t('close')}</button><button type="button" disabled={sending} onClick={resend} className="flex-1 bg-amber-400 py-3 text-xs font-semibold uppercase tracking-widest text-black">{sending ? t('sending') : t('resendEmail')}</button></div></div></div>
}
