import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const statuses = ['requested', 'confirmed', 'rescheduled', 'completed', 'cancelled']

export default function AdminAppointments({ onError }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    let active = true
    supabase.from('appointments').select('*').order('appointment_date', { ascending: true }).then(({ data, error }) => {
      if (!active) return
      if (error) onError(error.message)
      setAppointments(data || [])
      setLoading(false)
    })
    return () => { active = false }
  }, [onError])

  const updateStatus = async (id, status) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) onError(error.message)
  }

  const openReschedule = (appointment) => {
    setRescheduling(appointment)
    setDate(appointment.appointment_date)
    setTime(appointment.time_slot)
  }

  const saveReschedule = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('appointments').update({
      appointment_date: date,
      time_slot: time,
      status: 'rescheduled',
    }).eq('id', rescheduling.id)
    if (error) {
      onError(error.message)
      return
    }
    setAppointments((current) => current.map((item) => item.id === rescheduling.id
      ? { ...item, appointment_date: date, time_slot: time, status: 'rescheduled' }
      : item))
    setRescheduling(null)
  }

  if (loading) return <p className="py-16 text-center text-sm text-neutral-500">Loading appointments...</p>

  return (
    <>
      <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500">
            <tr>{['Boutique', 'Date', 'Time', 'Guests', 'Focus', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="text-sm">
                <td className="px-5 py-5">{appointment.boutique_location}</td>
                <td className="px-5 py-5 text-neutral-400">{appointment.appointment_date}</td>
                <td className="px-5 py-5 text-neutral-400">{appointment.time_slot}</td>
                <td className="px-5 py-5">{appointment.guests}</td>
                <td className="px-5 py-5 text-neutral-400">{appointment.consultation_type}</td>
                <td className="px-5 py-5">
                  <select aria-label={`Status for appointment ${appointment.id}`} value={appointment.status} onChange={(event) => updateStatus(appointment.id, event.target.value)} className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="px-5 py-5">
                  <button type="button" onClick={() => openReschedule(appointment)} className="border border-amber-500/50 px-3 py-2 text-[10px] uppercase tracking-widest text-amber-300">Reschedule</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!appointments.length && <p className="p-10 text-center text-sm text-neutral-500">No appointments found.</p>}
      </div>
      {rescheduling && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
          <form onSubmit={saveReschedule} className="w-full max-w-md border border-neutral-800 bg-neutral-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl uppercase tracking-widest">Reschedule Appointment</h2>
              <button type="button" onClick={() => setRescheduling(null)} aria-label="Close reschedule dialog" className="text-neutral-400">×</button>
            </div>
            <p className="mt-3 text-xs text-neutral-500">{rescheduling.boutique_location}</p>
            <label className="mt-6 block text-[10px] uppercase tracking-widest text-neutral-400">Date
              <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm" />
            </label>
            <label className="mt-4 block text-[10px] uppercase tracking-widest text-neutral-400">Time
              <input required type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm" />
            </label>
            <button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">Save Reschedule</button>
          </form>
        </div>
      )}
    </>
  )
}
