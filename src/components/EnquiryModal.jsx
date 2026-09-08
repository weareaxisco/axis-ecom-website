import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function EnquiryModal({ product, onClose }) {
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
    setNotice('Your bespoke enquiry has been sent to the Maison.')
    setTimeout(onClose, 1200)
  }
  const input = 'mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm'
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"><form onSubmit={submit} className="w-full max-w-lg border border-neutral-800 bg-neutral-950 p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-widest text-amber-400">Bespoke service</p><h2 className="mt-2 font-serif text-2xl uppercase tracking-widest">Inquire About Customization</h2></div><button type="button" onClick={onClose} aria-label="Close enquiry dialog"><X /></button></div><p className="mt-4 text-sm text-neutral-400">{product.name}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Name<input required value={form.customer_name} onChange={update('customer_name')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Email<input required type="email" value={form.customer_email} onChange={update('customer_email')} className={input} /></label><label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Phone<input value={form.phone} onChange={update('phone')} className={input} /></label></div><label className="mt-4 block text-[10px] uppercase tracking-widest text-neutral-400">Message<textarea required value={form.message} onChange={update('message')} className={`${input} h-28`} /></label>{notice && <p className="mt-4 text-xs text-amber-300">{notice}</p>}<button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">Send Enquiry</button></form></div>
}
