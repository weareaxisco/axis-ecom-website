import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useSiteConfigSettings } from '../context/SiteConfigContext'
import { useLanguage } from '../context/LanguageContext'

const statuses = ['pending_confirmation', 'requested', 'confirmed', 'rescheduled', 'completed', 'cancelled']
const kenitraSlots = ['10:30', '11:30', '14:30', '16:00', '17:30']

export default function AdminAppointments({ onError, onCount, profile }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { siteConfig } = useSiteConfigSettings()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState('rescheduled')
  const [openStatusId, setOpenStatusId] = useState(null)
  const currentUser = user || profile
  const canManageAppointments = ['super_admin', 'admin'].includes(currentUser?.role)
    || currentUser?.can_manage_appointments === true
    || currentUser?.permissions?.can_manage_appointments === true
  const statusClass = (value) => value === 'confirmed' || value === 'completed'
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
    : value === 'cancelled' ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
      : value === 'pending_confirmation' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
        : 'border-neutral-700 bg-neutral-900 text-neutral-300'

  useEffect(() => {
    if (!canManageAppointments) return undefined
    let active = true
    supabase.from('appointments').select('*').order('appointment_date', { ascending: true }).then(({ data, error }) => {
      if (!active) return
      if (error) onError(error.message)
      const nextAppointments = data || []
      setAppointments(nextAppointments)
      onCount?.(nextAppointments.length)
      setLoading(false)
    })
    const channel = supabase.channel('admin_appointments_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        const appointmentId = payload.new?.id || payload.old?.id
        if (!active || !appointmentId) return
        setAppointments((current) => {
          const nextAppointments = payload.eventType === 'DELETE'
          ? current.filter((item) => item.id !== appointmentId)
          : [payload.new, ...current.filter((item) => item.id !== appointmentId)]
          onCount?.(nextAppointments.length)
          return nextAppointments
        })
      })
      .subscribe()
    return () => { active = false; supabase.removeChannel(channel) }
  }, [canManageAppointments, onError, onCount])

  const updateStatus = async (id, status) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) onError(error.message)
    if (!error && (status === 'confirmed' || status === 'rescheduled')) {
      const appointment = appointments.find((item) => item.id === id)
      if (appointment) syncCalendar(appointment, status)
    }
  }

  const syncCalendar = async (appointment, status = appointment.status) => {
    if (!siteConfig.calendar_api_url) return
    const response = await fetch(siteConfig.calendar_api_url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...appointment, status }) })
    if (!response.ok) onError(`${t('calendarSyncFailed')} (${response.status})`)
  }

  const exportIcal = (appointment) => {
    const start = `${appointment.appointment_date.replaceAll('-', '')}T${appointment.time_slot.replace(':', '')}00`
    const escape = (value) => String(value || '').replaceAll(',', '\\,').replaceAll(';', '\\;')
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Maison//Appointments//EN\r\nBEGIN:VEVENT\r\nUID:${appointment.id}@maison\r\nDTSTART:${start}\r\nDTEND:${start}\r\nSUMMARY:${escape(appointment.consultation_type)}\r\nLOCATION:${escape(appointment.boutique_location)}\r\nDESCRIPTION:${escape(`Guests: ${appointment.guests}`)}\r\nEND:VEVENT\r\nEND:VCALENDAR`
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `appointment-${appointment.id}.ics`
    link.click()
    URL.revokeObjectURL(url)
    syncCalendar(appointment)
  }

  const openReschedule = (appointment) => {
    setRescheduling(appointment)
    setDate(appointment.appointment_date)
    setTime(appointment.time_slot)
    setStatus(appointment.status || 'pending_confirmation')
  }

  const saveReschedule = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('appointments').update({
      appointment_date: date,
      time_slot: time,
      status,
    }).eq('id', rescheduling.id)
    if (error) {
      onError(error.message)
      return
    }
    setAppointments((current) => current.map((item) => item.id === rescheduling.id
      ? { ...item, appointment_date: date, time_slot: time, status }
      : item))
    syncCalendar({ ...rescheduling, appointment_date: date, time_slot: time, status }, status)
    setRescheduling(null)
  }

  if (loading) return <p className="py-16 text-center text-sm text-neutral-500">{t('loadingAppointments')}</p>

  return (
    <>
      <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500">
            <tr>{[t('boutique'), 'Date & Créneau de Visite', 'Contact', t('focus'), t('adminStatus'), t('actions')].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="text-sm">
                <td className="px-5 py-5">{appointment.boutique_location || 'Maison Diamiss — Kénitra'}</td>
                <td className="px-5 py-5"><div className="font-medium text-amber-400">{appointment.appointment_date}</div><div className="text-xs text-neutral-400">{appointment.time_slot}</div></td>
                <td className="px-5 py-5 text-xs text-neutral-400"><div>{appointment.client_name || '—'}</div><div>{appointment.email || appointment.phone || '—'}</div></td>
                <td className="px-5 py-5 text-neutral-400">{appointment.consultation_type || appointment.service_type}</td>
                <td className="px-5 py-5">
                  <div className="relative inline-block"><button type="button" aria-expanded={openStatusId === appointment.id} onClick={() => setOpenStatusId((current) => current === appointment.id ? null : appointment.id)} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${statusClass(appointment.status)}`}>{appointment.status}</button>{openStatusId === appointment.id && <div className="absolute right-0 z-20 mt-2 min-w-44 border border-neutral-700 bg-neutral-950 p-1 shadow-xl">{statuses.map((value) => <button type="button" key={value} onClick={() => { updateStatus(appointment.id, value); setOpenStatusId(null) }} className={`block w-full border px-2 py-2 text-left text-[10px] uppercase tracking-widest ${statusClass(value)} mb-1 last:mb-0`}>{value}</button>)}</div>}</div>
                </td>
                <td className="px-5 py-5">
                  <div className="flex gap-2"><button type="button" onClick={() => openReschedule(appointment)} className="border border-amber-500/50 px-3 py-2 text-[10px] uppercase tracking-widest text-amber-300">{t('reschedule')}</button>{appointment.status === 'confirmed' && <button type="button" onClick={() => exportIcal(appointment)} className="border border-neutral-700 px-3 py-2 text-[10px] uppercase tracking-widest text-neutral-300">{t('exportIcalSync')}</button>}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!appointments.length && <p className="p-10 text-center text-sm text-neutral-500">{t('noAppointmentsFound')}</p>}
      </div>
      {rescheduling && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
          <form onSubmit={saveReschedule} className="w-full max-w-md border border-neutral-800 bg-neutral-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl uppercase tracking-widest">{t('rescheduleAppointment')}</h2>
              <button type="button" onClick={() => setRescheduling(null)} aria-label={t('close')} className="text-neutral-400">×</button>
            </div>
            <p className="mt-3 text-xs text-neutral-500">{rescheduling.boutique_location}</p>
            <label className="mt-6 block text-[10px] uppercase tracking-widest text-neutral-400">{t('date')}
              <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm" />
            </label>
            <fieldset className="mt-4">
              <legend className="text-[10px] uppercase tracking-widest text-neutral-400">{t('time')}</legend>
              <div className="mt-2 flex flex-wrap gap-2">{kenitraSlots.map((slot) => <button key={slot} type="button" onClick={() => setTime(slot)} className={`border px-3 py-2 text-xs ${time === slot ? 'border-amber-500 text-amber-300' : 'border-neutral-800 text-neutral-400'}`}>{slot}</button>)}</div>
            </fieldset>
            <label className="mt-4 block text-[10px] uppercase tracking-widest text-neutral-400">Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm">{statuses.map((value) => <option key={value}>{value}</option>)}</select>
            </label>
            <button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">{t('saveReschedule')}</button>
          </form>
        </div>
      )}
    </>
  )
}
