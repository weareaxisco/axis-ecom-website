import { useState } from 'react'
import { supabase } from '../supabaseClient'

const permissions = [
  ['manage_products', 'Manage products', 'Edit catalogue, stock, and prices.'],
  ['manage_orders', 'Manage orders', 'Update order status and shipping details.'],
  ['manage_appointments', 'Manage appointments', 'Manage concierge bookings.'],
  ['manage_settings', 'Manage settings', 'Modify site configuration and social links.'],
]

export default function AdminStaff() {
  const [form, setForm] = useState({ email: '', password: '', role: 'staff_catalog', permissions: { manage_products: true } })
  const [message, setMessage] = useState('')
  const updatePermission = (key) => setForm((current) => ({ ...current, permissions: { ...current.permissions, [key]: !current.permissions[key] } }))
  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    const { error } = await supabase.functions.invoke('create-staff', { body: form })
    if (error) { setMessage(error.message); return }
    setMessage('Staff account created. The temporary password must be changed after first sign-in.')
    setForm({ email: '', password: '', role: 'staff_catalog', permissions: { manage_products: true } })
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-amber-500'
  return <form onSubmit={submit} className="max-w-2xl border border-neutral-800 bg-neutral-950/70 p-6 md:p-8"><h2 className="font-serif text-2xl uppercase tracking-widest">Staff &amp; Permissions</h2><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Staff email<input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Temporary password<input required minLength="8" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className={input}><option value="staff_catalog">Catalog staff</option><option value="staff_orders">Orders staff</option></select></label></div><fieldset className="mt-8 space-y-4"><legend className="text-[10px] uppercase tracking-widest text-neutral-400">Granular permissions</legend>{permissions.map(([key, label, description]) => <label key={key} className="flex items-start gap-3 border-b border-neutral-800 pb-4 text-sm"><input type="checkbox" checked={Boolean(form.permissions[key])} onChange={() => updatePermission(key)} className="mt-1 accent-amber-500" /><span><strong className="font-medium">{label}</strong><span className="mt-1 block text-xs text-neutral-500">{description}</span></span></label>)}</fieldset>{message && <p className="mt-5 text-xs text-amber-300">{message}</p>}<button type="submit" className="mt-8 bg-amber-500 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-black">Create staff account</button></form>
}
