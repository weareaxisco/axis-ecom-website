import { useState } from 'react'
import { supabase } from '../supabaseClient'
import AppointmentModal from '../components/AppointmentModal'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'

const locations = [{ key: 'boutiqueCasablanca', value: 'Casablanca - Boulevard d’Anfa' }, { key: 'boutiqueMarrakech', value: 'Marrakech - Hivernage' }, { key: 'boutiqueRabat', value: 'Rabat - Souissi' }]
const slots = [{ key: 'morningSlot', value: '10:00' }, { key: 'afternoonSlot', value: '14:00' }, { key: 'eveningSlot', value: '17:00' }]
const focuses = [{ key: 'highJewelryFocus', value: 'High Jewelry' }, { key: 'bespokeEngagementFocus', value: 'Bespoke Engagement' }, { key: 'watchComplicationsFocus', value: 'Watch Complications' }]

export default function Concierge() {
  const [form, setForm] = useState({ location: locations[0].value, date: '', time: '10:00', guests: '1', focus: focuses[0].value })
  const [confirmation, setConfirmation] = useState(null)
  const [error, setError] = useState('')
  const { siteConfig } = useSiteConfigSettings()
  const { t } = useLanguage()
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError(t('privateAppointmentSignIn'))
      return
    }
    const { error: insertError } = await supabase.from('appointments').insert({
      user_id: user.id,
      boutique_location: form.location,
      appointment_date: form.date,
      time_slot: form.time,
      consultation_type: form.focus,
      guests: Number(form.guests),
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setConfirmation(form)
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500'

  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-5xl"><header className="text-center"><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{siteConfig.site_name}</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest md:text-5xl">{t('privateConciergeTitle')}</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-400">{t('privateConciergeIntro')}</p></header><form onSubmit={submit} className="mx-auto mt-14 max-w-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-10"><fieldset><legend className="text-[11px] uppercase tracking-widest text-neutral-400">{t('chooseBoutique')}</legend><div className="mt-4 grid gap-3 md:grid-cols-3">{locations.map((location) => <label key={location.value} className={`cursor-pointer border p-4 text-xs leading-5 transition-colors ${form.location === location.value ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}><input type="radio" name="location" value={location.value} checked={form.location === location.value} onChange={update('location')} className="sr-only" />{t(location.key)}</label>)}</div></fieldset><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-[11px] uppercase tracking-widest text-neutral-400">{t('preferredDate')}<input required type="date" value={form.date} onChange={update('date')} className={input} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">{t('timeSlot')}<select value={form.time} onChange={update('time')} className={input}>{slots.map((slot) => <option key={slot.value} value={slot.value}>{t(slot.key)}</option>)}</select></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">{t('guests')}<select value={form.guests} onChange={update('guests')} className={input}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} {t('guest')}</option>)}</select></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">{t('consultationFocus')}<select value={form.focus} onChange={update('focus')} className={input}>{focuses.map((focus) => <option key={focus.value} value={focus.value}>{t(focus.key)}</option>)}</select></label></div>{error && <p className="mt-5 border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{error}</p>}<button type="submit" className="mt-8 w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black hover:bg-amber-400">{t('requestAppointment')}</button></form></div><AppointmentModal appointment={confirmation} onClose={() => setConfirmation(null)} /></main>
}
