import { useEffect, useState } from 'react'
import { Edit3, Shield, Trash2, UserPlus, X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const permissionOptions = [
  ['can_manage_orders', 'Orders'],
  ['can_manage_inventory', 'Inventory'],
  ['can_manage_taxonomies', 'Taxonomies'],
  ['can_manage_appointments', 'Appointments'],
  ['can_manage_settings', 'Settings'],
  ['can_manage_staff', 'Staff'],
]
const toStoredPermissions = (permissions = {}) => permissionOptions.reduce((result, [key]) => {
  const legacyKey = key.replace('can_', '')
  result[legacyKey] = Boolean(permissions[key] ?? permissions[legacyKey])
  return result
}, {})
const roleLabel = { super_admin: 'Super Admin', admin: 'Manager', staff_catalog: 'Staff', staff_orders: 'Staff' }
const emptyForm = { id: null, full_name: '', email: '', password: '', role: 'staff_catalog', permissions: {} }

export default function AdminStaff() {
  const { session } = useAuth()
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [mode, setMode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const load = async () => {
    const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, permissions').in('role', ['super_admin', 'admin', 'staff_catalog', 'staff_orders']).order('full_name')
    if (error) setMessage(error.message)
    setStaff(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  const openCreate = () => { setForm({ ...emptyForm }); setMode('edit') }
  const openEdit = (member) => { setForm({ ...member, password: '', permissions: toStoredPermissions(member.permissions) }); setMode('edit') }
  const closeModal = () => { setMode(null); setForm({ ...emptyForm }) }
  const functionOptions = async (body) => {
    const accessToken = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token
    return supabase.functions.invoke('manage-staff', {
      body,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
  }
  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (form.id) {
        const updateBody = { action: 'update', id: form.id, full_name: form.full_name, email: form.email, role: form.role, permissions: form.permissions }
        const { error } = await functionOptions(updateBody)
        if (error) {
          const { error: fallbackError } = await supabase.from('profiles').update({ full_name: form.full_name, email: form.email, role: form.role, permissions: form.permissions }).eq('id', form.id)
          if (fallbackError) throw new Error(`${error.message}. ${fallbackError.message}`)
        }
      } else {
        if (!form.password) throw new Error('A temporary password is required.')
        const { error } = await functionOptions({ action: 'create', ...form, permissions: form.permissions })
        if (error) throw new Error('Veuillez déployer l’Edge Function manage-staff avant de créer un compte.')
      }
      await load()
      closeModal()
    } catch (error) {
      setMessage(error.message || 'Unable to save staff member.')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (member) => {
    if (!window.confirm(`Delete ${member.full_name || member.email}?`)) return
    const { error } = await functionOptions({ action: 'delete', id: member.id })
    if (error) setMessage(error.message)
    else setStaff((current) => current.filter((item) => item.id !== member.id))
  }
  const togglePermission = (key) => setForm((current) => ({ ...current, permissions: { ...current.permissions, [key]: !current.permissions[key] } }))
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-amber-500'
  return <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Access control</p><h2 className="mt-2 font-serif text-3xl uppercase tracking-widest">Staff &amp; Permissions</h2></div><button type="button" onClick={openCreate} className="inline-flex items-center gap-2 bg-amber-500 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-black"><UserPlus size={15} /> Add staff</button></div>
    {message && <p role="alert" className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{message}</p>}
    <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Permissions</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-neutral-800">{!loading && staff.map((member) => <tr key={member.id}><td className="px-5 py-5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-serif text-amber-300">{(member.full_name || member.email || '?').charAt(0).toUpperCase()}</span><span><strong className="block text-sm text-white">{member.full_name || 'Unnamed member'}</strong><span className="text-xs text-neutral-500">{member.email || 'No email recorded'}</span></span></div></td><td className="px-5 py-5 text-xs text-amber-300">{roleLabel[member.role] || member.role}</td><td className="px-5 py-5"><div className="flex max-w-sm flex-wrap gap-1.5">{member.role === 'admin' || member.role === 'super_admin' ? <span className="border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-300">All modules</span> : permissionOptions.filter(([key]) => member.permissions?.[key] || member.permissions?.[key.replace('can_', '')]).map(([key, label]) => <span key={key} className="border border-neutral-700 px-2 py-1 text-[10px] text-neutral-300">{label}</span>)}</div></td><td className="px-5 py-5"><div className="flex gap-2"><button type="button" aria-label={`Edit ${member.full_name || member.email}`} onClick={() => openEdit(member)} className="border border-neutral-700 p-2 text-neutral-300 hover:border-amber-500 hover:text-amber-300"><Edit3 size={14} /></button><button type="button" aria-label={`Delete ${member.full_name || member.email}`} onClick={() => remove(member)} className="border border-neutral-700 p-2 text-neutral-300 hover:border-rose-500 hover:text-rose-300"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table>{loading && <p className="p-10 text-center text-sm text-neutral-500">Loading staff...</p>}{!loading && !staff.length && <p className="p-10 text-center text-sm text-neutral-500">No staff members found.</p>}</div>
    {mode === 'edit' && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-amber-500/30 bg-neutral-950 p-6 shadow-2xl md:p-8"><div className="flex items-center justify-between"><h3 className="font-serif text-2xl uppercase tracking-widest">{form.id ? 'Edit staff member' : 'Create staff member'}</h3><button type="button" onClick={closeModal} aria-label="Close"><X size={18} /></button></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Full name<input required value={form.full_name || ''} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Email<input required type="email" value={form.email || ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={input} /></label>{!form.id && <label className="text-[10px] uppercase tracking-widest text-neutral-400">Temporary password<input required minLength="8" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className={input} /></label>}<label className="text-[10px] uppercase tracking-widest text-neutral-400">Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className={input}><option value="staff_catalog">Staff</option><option value="staff_orders">Staff — Orders</option><option value="admin">Manager</option></select></label></div><fieldset className="mt-8"><legend className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400"><Shield size={14} /> Module permissions</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{permissionOptions.map(([key, label]) => <label key={key} className="flex items-center gap-3 border border-neutral-800 p-3 text-xs text-neutral-300"><input type="checkbox" checked={Boolean(form.permissions[key])} onChange={() => togglePermission(key)} className="accent-amber-500" />{label}</label>)}</div></fieldset><button disabled={saving} type="submit" className="mt-8 w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-50">{saving ? 'Saving...' : 'Save staff member'}</button></form></div>}
  </div>
}
