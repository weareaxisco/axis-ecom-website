import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ResendVerificationModal({ email, onClose }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const resend = async () => {
    setSending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin } })
    setSending(false)
    setMessage(error ? error.message : 'Verification email sent. Check your inbox.')
  }
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-sm border border-neutral-800 bg-neutral-950 p-6 text-white"><h2 className="font-serif text-2xl">Verify your email</h2><p className="mt-3 text-sm text-neutral-400">Resend a verification link to {email}.</p>{message && <p className="mt-4 text-xs text-amber-300">{message}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="flex-1 border border-neutral-700 py-3 text-xs uppercase tracking-widest">Close</button><button type="button" disabled={sending} onClick={resend} className="flex-1 bg-amber-400 py-3 text-xs font-semibold uppercase tracking-widest text-black">{sending ? 'Sending...' : 'Resend email'}</button></div></div></div>
}
