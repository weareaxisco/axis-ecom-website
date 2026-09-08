import { Check, X } from 'lucide-react'

function createCalendarFile(appointment) {
  const start = new Date(`${appointment.date}T${appointment.time}:00`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const format = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maison de lElegance//Concierge//EN', 'BEGIN:VEVENT', `DTSTART:${format(start)}`, `DTEND:${format(end)}`, `SUMMARY:Maison de l'Élégance Private Appointment`, `LOCATION:${appointment.location}`, `DESCRIPTION:${appointment.focus} consultation for ${appointment.guests} guest(s).`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'maison-concierge-appointment.ics'
  link.click()
  URL.revokeObjectURL(url)
}

export default function AppointmentModal({ appointment, onClose }) {
  if (!appointment) return null
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"><section className="w-full max-w-lg border border-amber-500/40 bg-neutral-950 p-8 text-white shadow-2xl"><div className="flex justify-end"><button type="button" aria-label="Close confirmation" onClick={onClose}><X size={18} /></button></div><Check className="mx-auto text-amber-400" size={38} /><p className="mt-5 text-center text-[10px] uppercase tracking-[0.25em] text-amber-400">Reservation confirmed</p><h2 className="mt-3 text-center font-serif text-2xl uppercase tracking-widest">Your private visit</h2><div className="mt-6 space-y-2 border-y border-neutral-800 py-5 text-sm text-neutral-300"><p>{appointment.location}</p><p>{appointment.date} · {appointment.time}</p><p>{appointment.guests} guest(s) · {appointment.focus}</p></div><button type="button" onClick={() => createCalendarFile(appointment)} className="mt-6 w-full border border-amber-500 py-3 text-xs uppercase tracking-widest text-amber-300 hover:bg-amber-500 hover:text-black">Download Calendar Invitation</button></section></div>
}
