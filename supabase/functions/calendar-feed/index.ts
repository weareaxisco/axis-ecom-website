import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const escape = (value: unknown) => String(value || '')
  .replaceAll('\\', '\\\\')
  .replaceAll(';', '\\;')
  .replaceAll(',', '\\,')
  .replaceAll('\r\n', '\\n')
  .replaceAll('\n', '\\n')

const calendarDate = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

Deno.serve(async (request) => {
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('appointments').select('id, client_name, email, phone, appointment_date, time_slot, consultation_type, service_type, boutique_location, status').order('appointment_date', { ascending: true })
  if (error) return new Response('Unable to load calendar appointments', { status: 500 })
  const events = (data || []).map((appointment) => {
    const start = calendarDate(appointment.appointment_date, appointment.time_slot)
    const endDate = new Date(`${appointment.appointment_date}T${appointment.time_slot}:00Z`)
    endDate.setUTCHours(endDate.getUTCHours() + 1)
    const end = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    const description = `Client: ${appointment.client_name || ''} (${appointment.email || ''}, ${appointment.phone || ''})\\nFocus: ${appointment.consultation_type || appointment.service_type || ''}\\nStatus: ${appointment.status || ''}`
    return ['BEGIN:VEVENT', `UID:${escape(appointment.id)}@maison-diamiss`, `DTSTART:${start}`, `DTEND:${end}`, 'SUMMARY:Private Visit - Maison Diamiss', 'LOCATION:Maison Diamiss Joaillerie, Kénitra, Morocco', `DESCRIPTION:${escape(description)}`, 'END:VEVENT'].join('\r\n')
  })
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maison Diamiss//Appointments//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'].join('\r\n')
  return new Response(`${ics}\r\n`, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } })
})
