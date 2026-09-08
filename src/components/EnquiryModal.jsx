import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function EnquiryModal({ product, onClose }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ customer_name: '', customer_email: '', phone: '', message: '' })
  const [notice, setNotice] = useState('')
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('enquiries').insert({ product_id: product.id, ...form })
    if (error) {
      setNotice(error.message)
      return
    }
    setNotice(t('bespokeEnquirySent'))
    setTimeout(onClose, 1200)
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm'
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"><form onSubmit={submit} className="w-full max-w-lg border border-neutral-800 bg-neutral-950 p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-widest text-amber-400">{t('bespokeService')}</p><h2 className="mt-2 font-serif text-2xl uppercase tracking-widest">{t('inquireCustomization')}</h2></div><button type="button" onClick={onClose} aria-label={t('close')}><X /></button></div><p className="mt-4 text-sm text-neutral-400">{product.name}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('name')}<input required value={form.customer_name} onChange={update('customer_name')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">{t('email')}<input required type="email" value={form.customer_email} onChange={update('customer_email')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">{t('phone')}<input value={form.phone} onChange={update('phone')} className={input} /></label></div><label className="mt-4 block text-[10px] uppercase tracking-widest text-neutral-400">{t('message')}<textarea required value={form.message} onChange={update('message')} className={`${input} h-28`} /></label>{notice && <p className="mt-4 text-xs text-amber-300">{notice}</p>}<button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">{t('sendEnquiry')}</button></form></div>
}
