import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

const fallbackCities = ['Casablanca', 'Rabat / Salé / Kénitra', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 'Oujda', 'Laâyoune', 'Dakhla']

export default function AccountAddresses({ userId }) {
  const { t } = useLanguage()
  const { user, updateUserProfile } = useAuth()
  const [cities, setCities] = useState(fallbackCities)
  const [form, setForm] = useState({ fullName: '', address: '', city: 'Casablanca', phone: '+212 ' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch('/data/ameex_cities.csv').then((response) => response.text()).then((text) => setCities(text.split(/\r?\n/).slice(1).filter(Boolean).map((row) => row.split(',')[1]))).catch(() => {})
  }, [])
  useEffect(() => {
    supabase.from('addresses').select('*').eq('user_id', userId).eq('is_default', true).maybeSingle().then(({ data }) => {
      const saved = user?.user_metadata?.saved_address || {}
      if (saved.full_name || saved.address) setForm((current) => ({ ...current, fullName: saved.full_name || current.fullName, phone: saved.phone || current.phone, address: saved.address || current.address, city: saved.city || current.city }))
      else if (data) setForm((current) => ({ ...current, ...data, fullName: data.fullName || data.full_name || current.fullName }))
    }).catch(() => {})
  }, [userId, user])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const saveAddress = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('addresses').upsert({ user_id: userId, ...form, is_default: true })
    try {
      await updateUserProfile({ full_name: form.fullName, phone: form.phone, saved_address: { full_name: form.fullName, phone: form.phone, address: form.address, city: form.city, postal_code: form.postalCode || '' } })
    } catch (profileError) {
      setNotice(profileError.message)
      return
    }
    setNotice(error ? error.message : t('addressSaved'))
  }
  const requestData = async (action) => {
    const { error } = await supabase.from('privacy_requests').insert({ user_id: userId, request_type: action })
    setNotice(error ? error.message : `Your CNDP ${action} request has been recorded.`)
  }
  const input = 'mt-1 w-full border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm outline-none focus:border-amber-500'

  return <div className="space-y-8"><form onSubmit={saveAddress} className="border border-neutral-800 p-6"><h2 className="font-serif text-xl uppercase tracking-widest">{t('defaultAddress')}</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('checkoutFullName')}<input value={form.fullName} onChange={update('fullName')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('phone')}<input value={form.phone} onChange={update('phone')} className={input} /></label><label className="sm:col-span-2 text-[10px] uppercase tracking-widest text-neutral-400">{t('checkoutAddress')}<input value={form.address} onChange={update('address')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('checkoutCity')}<select value={form.city} onChange={update('city')} className={input}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label></div><button type="submit" className="mt-6 bg-amber-500 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-black">{t('saveAddress')}</button></form><section className="border border-neutral-800 p-6"><h2 className="font-serif text-xl uppercase tracking-widest">{t('cndpPrivacySecurity')}</h2><p className="mt-3 text-sm leading-6 text-neutral-400">{t('manageDataRights')}</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => requestData('export')} className="border border-neutral-700 px-5 py-3 text-[10px] uppercase tracking-widest hover:border-amber-400">{t('exportData')}</button><button type="button" onClick={() => requestData('deletion')} className="border border-rose-500/40 px-5 py-3 text-[10px] uppercase tracking-widest text-rose-300">{t('requestDataDeletion')}</button></div></section>{notice && <p className="text-xs text-amber-300">{notice}</p>}</div>
}
