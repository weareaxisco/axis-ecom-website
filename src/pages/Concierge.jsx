import { useState } from 'react'
import { supabase } from '../supabaseClient'
import AppointmentModal from '../components/AppointmentModal'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'

const location = 'Maison Diamiss — Kénitra'
const slotGroups = [{ label: 'Matin', values: ['10:30', '11:30'] }, { label: 'Après-midi', values: ['14:30', '16:00', '17:30'] }]
const focuses = [{ key: 'highJewelryFocus', value: 'High Jewelry' }, { key: 'bespokeEngagementFocus', value: 'Bespoke Engagement' }, { key: 'watchComplicationsFocus', value: 'Watch Complications' }]
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}
const appointmentDateTimes = (appointment) => {
  const [year, month, day] = String(appointment.date || appointment.appointment_date).split('-').map(Number)
  const [hours, minutes] = String(appointment.time || appointment.time_slot).split(':').map(Number)
  const start = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
  return { start, end: new Date(start.getTime() + 60 * 60 * 1000) }
}
const formatCalendarDate = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
export const exportToICS = (appointment) => {
  const escape = (value) => String(value || '').replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n')
  const { start, end } = appointmentDateTimes(appointment)
  const clientName = appointment.fullName || appointment.client_name
  const description = `Client: ${clientName} (${appointment.email}, ${appointment.phone})\nFocus: ${appointment.focus || appointment.service_type}`
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maison Diamiss//Concierge//EN', 'BEGIN:VEVENT', `UID:${appointment.id || generateUUID()}@maison-diamiss`, `DTSTAMP:${formatCalendarDate(new Date())}`, `DTSTART:${formatCalendarDate(start)}`, `DTEND:${formatCalendarDate(end)}`, `SUMMARY:${escape('Private Visit - Maison Diamiss')}`, `LOCATION:${escape('Maison Diamiss Joaillerie, Kénitra, Morocco')}`, `DESCRIPTION:${escape(description)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const url = URL.createObjectURL(new Blob([`${content}\r\n`], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'maison-diamiss-consultation.ics'
  link.click()
  URL.revokeObjectURL(url)
}
export const getGoogleCalendarUrl = (appointment) => {
  const { start, end } = appointmentDateTimes(appointment)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Private Visit - Maison Diamiss',
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    location: 'Maison Diamiss Joaillerie, Kénitra, Morocco',
    details: `Client: ${appointment.fullName || appointment.client_name} (${appointment.email}, ${appointment.phone})\nFocus: ${appointment.focus || appointment.service_type}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default function Concierge() {
  const initialForm = { location, date: '', time: '10:30', focus: focuses[0].value, fullName: '', email: '', phone: '', notes: '' }
  const [form, setForm] = useState(initialForm)
  const [confirmation, setConfirmation] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const { siteConfig } = useSiteConfigSettings()
  const { t } = useLanguage()
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const appointment = {
      id: generateUUID(),
      user_id: user?.id || null,
      client_name: form.fullName,
      email: form.email,
      phone: form.phone,
      service_type: form.focus,
      boutique_location: form.location,
      appointment_date: form.date,
      time_slot: form.time,
      consultation_type: form.focus,
      guests: 1,
      notes: form.notes,
      status: 'pending_confirmation',
    }
    const { error: insertError } = await supabase.from('appointments').insert(appointment)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setConfirmation(form)
    setShowConfirmation(true)
  }
  const closeConfirmation = () => {
    setShowConfirmation(false)
    setConfirmation(null)
    setForm({ ...initialForm })
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500'

  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-5xl"><header className="text-center"><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">{siteConfig.site_name}</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest md:text-5xl">{t('privateConciergeTitle')}</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-400">{t('privateConciergeIntro')}</p></header><form onSubmit={submit} className="mx-auto mt-14 max-w-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-10"><fieldset><legend className="text-[11px] uppercase tracking-widest text-neutral-400">{t('chooseBoutique')}</legend><div className="mt-4 border border-amber-500 bg-amber-500/10 p-5 text-sm text-amber-300"><p className="font-serif text-xl">Maison Diamiss</p><p className="mt-1 text-xs uppercase tracking-widest">Kénitra</p></div></fieldset><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-[11px] uppercase tracking-widest text-neutral-400">Full Name<input required value={form.fullName} onChange={update('fullName')} className={input} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Email<input required type="email" value={form.email} onChange={update('email')} className={input} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Phone Number<input required type="tel" value={form.phone} onChange={update('phone')} className={input} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">{t('preferredDate')}<input required type="date" value={form.date} onChange={update('date')} className={input} /></label></div><fieldset className="mt-8"><legend className="text-[11px] uppercase tracking-widest text-neutral-400">{t('timeSlot')}</legend><div className="mt-4 space-y-5">{slotGroups.map((group) => <div key={group.label}><p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">{group.label}</p><div className="flex flex-wrap gap-3">{group.values.map((slot) => <button key={slot} type="button" onClick={() => setForm((current) => ({ ...current, time: slot }))} className={`border px-5 py-3 text-sm transition-colors ${form.time === slot ? 'border-amber-500 text-amber-400' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}>{slot}</button>)}</div></div>)}</div></fieldset><label className="mt-8 block text-[11px] uppercase tracking-widest text-neutral-400">{t('consultationFocus')}<select value={form.focus} onChange={update('focus')} className={input}>{focuses.map((focus) => <option key={focus.value} value={focus.value}>{t(focus.key)}</option>)}</select></label><label className="mt-5 block text-[11px] uppercase tracking-widest text-neutral-400">Notes<textarea value={form.notes} onChange={update('notes')} className={`${input} min-h-24`} /></label>{error && <p className="mt-5 border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{error}</p>}<button type="submit" className="mt-8 w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black hover:bg-amber-400">{t('requestAppointment')}</button></form></div>{showConfirmation && <AppointmentModal appointment={{ ...confirmation, guests: 1 }} onClose={closeConfirmation} onDownloadCalendar={exportToICS} googleCalendarUrl={getGoogleCalendarUrl(confirmation)} />}</main>
}
