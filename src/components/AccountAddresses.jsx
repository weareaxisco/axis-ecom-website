import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const fallbackCities = ['Casablanca', 'Rabat / Salé / Kénitra', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 'Oujda', 'Laâyoune', 'Dakhla']

export default function AccountAddresses({ userId }) {
  const [cities, setCities] = useState(fallbackCities)
  const [form, setForm] = useState({ fullName: '', address: '', city: 'Casablanca', phone: '+212 ' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch('/data/ameex_cities.csv').then((response) => response.text()).then((text) => setCities(text.split(/\r?\n/).slice(1).filter(Boolean).map((row) => row.split(',')[1]))).catch(() => {})
  }, [])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const saveAddress = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('addresses').upsert({ user_id: userId, ...form, is_default: true })
    setNotice(error ? error.message : 'Your default address has been saved.')
  }
  const requestData = async (action) => {
    const { error } = await supabase.from('privacy_requests').insert({ user_id: userId, request_type: action })
    setNotice(error ? error.message : `Your CNDP ${action} request has been recorded.`)
  }
  const input = 'mt-1 w-full border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm outline-none focus:border-amber-500'

  return <div className="space-y-8"><form onSubmit={saveAddress} className="border border-neutral-800 p-6"><h2 className="font-serif text-xl uppercase tracking-widest">Default Address</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Full Name<input value={form.fullName} onChange={update('fullName')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Phone<input value={form.phone} onChange={update('phone')} className={input} /></label><label className="sm:col-span-2 text-[10px] uppercase tracking-widest text-neutral-400">Address<input value={form.address} onChange={update('address')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">City<select value={form.city} onChange={update('city')} className={input}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label></div><button type="submit" className="mt-6 bg-amber-500 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-black">Save Address</button></form><section className="border border-neutral-800 p-6"><h2 className="font-serif text-xl uppercase tracking-widest">CNDP Privacy & Security</h2><p className="mt-3 text-sm leading-6 text-neutral-400">Manage your personal data rights under Moroccan Law 09-08.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => requestData('export')} className="border border-neutral-700 px-5 py-3 text-[10px] uppercase tracking-widest hover:border-amber-400">Export My Data</button><button type="button" onClick={() => requestData('deletion')} className="border border-rose-500/40 px-5 py-3 text-[10px] uppercase tracking-widest text-rose-300">Request Data Deletion</button></div></section>{notice && <p className="text-xs text-amber-300">{notice}</p>}</div>
}
