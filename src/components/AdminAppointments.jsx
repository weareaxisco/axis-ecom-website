import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const statuses = ['requested', 'confirmed', 'completed', 'cancelled']

export default function AdminAppointments({ onError }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
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
  if (loading) return <p className="py-16 text-center text-sm text-neutral-500">Loading appointments...</p>
  return <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500"><tr>{['Boutique', 'Date', 'Time', 'Guests', 'Focus', 'Status'].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-neutral-800">{appointments.map((appointment) => <tr key={appointment.id} className="text-sm"><td className="px-5 py-5">{appointment.boutique_location}</td><td className="px-5 py-5 text-neutral-400">{appointment.appointment_date}</td><td className="px-5 py-5 text-neutral-400">{appointment.time_slot}</td><td className="px-5 py-5">{appointment.guests}</td><td className="px-5 py-5 text-neutral-400">{appointment.consultation_type}</td><td className="px-5 py-5"><select aria-label={`Status for appointment ${appointment.id}`} value={appointment.status} onChange={(event) => updateStatus(appointment.id, event.target.value)} className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>{!appointments.length && <p className="p-10 text-center text-sm text-neutral-500">No appointments found.</p>}</div>
}
