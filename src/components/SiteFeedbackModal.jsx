import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function SiteFeedbackModal({ onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.user_metadata?.full_name || '', email: user?.email || '', rating: 5, feedback_type: 'experience', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    const { error: insertError } = await supabase.from('site_feedback').insert({ ...form, rating: Number(form.rating), user_id: user?.id || null })
    if (insertError) { setError(insertError.message); return }
    setSubmitted(true)
  }
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-lg border border-neutral-800 bg-neutral-950 p-6 text-white">{submitted ? <div className="py-10 text-center"><p className="text-amber-400">Merci pour votre retour.</p><h2 className="mt-3 font-serif text-3xl">Experience received</h2><button type="button" onClick={onClose} className="mt-8 border border-amber-400 px-6 py-3 text-xs uppercase tracking-widest text-amber-300">Close</button></div> : <form onSubmit={submit}><h2 className="font-serif text-3xl">Avis &amp; Experience Client</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><input required value={form.name} onChange={update('name')} placeholder="Name" className="border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><input required type="email" value={form.email} onChange={update('email')} placeholder="Email" className="border border-neutral-800 bg-transparent px-4 py-3 text-sm" /><select value={form.feedback_type} onChange={update('feedback_type')} className="border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm"><option value="experience">Experience</option><option value="bug">Website issue</option><option value="service">Service</option></select><select value={form.rating} onChange={update('rating')} className="border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></div><textarea required value={form.message} onChange={update('message')} placeholder="Your feedback" className="mt-4 h-32 w-full border border-neutral-800 bg-transparent px-4 py-3 text-sm" />{error && <p className="mt-3 text-xs text-rose-300">{error}</p>}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="border border-neutral-700 px-5 py-3 text-xs uppercase tracking-widest">Cancel</button><button type="submit" className="bg-amber-400 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-black">Send feedback</button></div></form>}</div></div>
}
