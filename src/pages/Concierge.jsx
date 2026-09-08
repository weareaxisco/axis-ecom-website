import { useState } from 'react'
import { supabase } from '../supabaseClient'
import AppointmentModal from '../components/AppointmentModal'

const locations = ['Casablanca - Boulevard d’Anfa', 'Marrakech - Hivernage', 'Rabat - Souissi']
const slots = [{ label: '10:00 AM', value: '10:00' }, { label: '02:00 PM', value: '14:00' }, { label: '05:00 PM', value: '17:00' }]
const focuses = ['High Jewelry', 'Bespoke Engagement', 'Watch Complications']

export default function Concierge() {
  const [form, setForm] = useState({ location: locations[0], date: '', time: '10:00', guests: '1', focus: focuses[0] })
  const [confirmation, setConfirmation] = useState(null)
  const [error, setError] = useState('')
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const { error: insertError } = await supabase.from('appointments').insert({ location: form.location, appointment_date: form.date, appointment_time: form.time, guests: Number(form.guests), consultation_focus: form.focus })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setConfirmation(form)
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500'

  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-5xl"><header className="text-center"><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">The Maison</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest md:text-5xl">Private Concierge</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-400">Reserve an intimate consultation with our jewelry and horology advisors.</p></header><form onSubmit={submit} className="mx-auto mt-14 max-w-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-10"><fieldset><legend className="text-[11px] uppercase tracking-widest text-neutral-400">Choose your flagship boutique</legend><div className="mt-4 grid gap-3 md:grid-cols-3">{locations.map((location) => <label key={location} className={`cursor-pointer border p-4 text-xs leading-5 transition-colors ${form.location === location ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}><input type="radio" name="location" value={location} checked={form.location === location} onChange={update('location')} className="sr-only" />{location}</label>)}</div></fieldset><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-[11px] uppercase tracking-widest text-neutral-400">Preferred date<input required type="date" value={form.date} onChange={update('date')} className={input} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Time slot<select value={form.time} onChange={update('time')} className={input}>{slots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Guests<select value={form.guests} onChange={update('guests')} className={input}><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Consultation focus<select value={form.focus} onChange={update('focus')} className={input}>{focuses.map((focus) => <option key={focus}>{focus}</option>)}</select></label></div>{error && <p className="mt-5 border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{error}</p>}<button type="submit" className="mt-8 w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black hover:bg-amber-400">Request Private Appointment</button></form></div><AppointmentModal appointment={confirmation} onClose={() => setConfirmation(null)} /></main>
}
