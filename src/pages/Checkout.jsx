import { useState } from 'react'
import { useCart } from '../context/CartContext'

const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 'Oujda', 'Tetouan']
const money = (value) => `${Number(value || 0).toLocaleString()} MAD`

export default function Checkout() {
  const { cartItems, subtotal } = useCart()
  const [step, setStep] = useState(1)
  const [payment, setPayment] = useState('cod')
  const [form, setForm] = useState({ fullName: '', address: '', city: 'Casablanca', postalCode: '', phone: '+212 ' })
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const total = subtotal
  const inputClass = 'mt-1 w-full border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70'

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="text-center"><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">Maison de l'Élégance</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">Checkout</h1></header>
        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between text-[10px] uppercase tracking-widest">{['Delivery', 'Payment', 'Confirmation'].map((label, index) => <div key={label} className={`flex items-center gap-2 ${step === index + 1 ? 'text-amber-400' : 'text-neutral-500'}`}><span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">{index + 1}</span>{label}</div>)}</div>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
          <section className="border-t border-neutral-800 pt-8">
            {step === 1 && <div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2 text-[11px] uppercase tracking-widest text-neutral-400">Full Name<input value={form.fullName} onChange={update('fullName')} className={inputClass} /></label><label className="sm:col-span-2 text-[11px] uppercase tracking-widest text-neutral-400">Address<input value={form.address} onChange={update('address')} className={inputClass} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">City<select value={form.city} onChange={update('city')} className={inputClass}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Postal Code<input value={form.postalCode} onChange={update('postalCode')} className={inputClass} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Phone (+212)<input value={form.phone} onChange={update('phone')} className={inputClass} /></label></div>}
            {step === 2 && <div className="space-y-3">{[['cod', 'Cash on Delivery', 'Pay securely upon delivery in Morocco.'], ['card', 'Credit Card', 'CMI / Stripe secure payment placeholder.'], ['wire', 'Wire Transfer / Bank Deposit', 'Bank details will be provided after confirmation.']].map(([value, title, description]) => <label key={value} className={`block cursor-pointer border p-5 ${payment === value ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-800'}`}><input type="radio" name="payment" value={value} checked={payment === value} onChange={(event) => setPayment(event.target.value)} className="mr-3 accent-amber-500" /><span className="text-sm uppercase tracking-widest">{title}</span><p className="mt-2 pl-6 text-xs text-neutral-500">{description}</p></label>)}</div>}
            {step === 3 && <div className="border border-amber-500/40 bg-neutral-900/50 p-8 text-center"><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">Thank you</p><h2 className="mt-4 font-serif text-2xl uppercase tracking-widest">Your order is being prepared</h2><p className="mt-4 text-sm text-neutral-400">Our concierge team will contact you to confirm delivery.</p></div>}
            {step < 3 && <button type="button" onClick={() => setStep(step + 1)} className="mt-8 bg-amber-500 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-black">{step === 1 ? 'Continue to Payment' : 'Review Order'}</button>}
          </section>
          <aside className="h-fit border border-neutral-800 bg-neutral-950/60 p-6 lg:sticky lg:top-32"><h2 className="font-serif text-xl uppercase tracking-widest">Order Summary</h2><div className="mt-6 space-y-4">{cartItems.map((item) => <div key={item.cartKey} className="flex justify-between gap-4 text-xs"><span>{item.name} × {item.quantity}</span><span>{money(Number(item.price) * item.quantity)}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-neutral-800 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between text-neutral-500"><span>Tax</span><span>Included</span></div><div className="flex justify-between text-amber-400"><span>Shipping</span><span>Complimentary</span></div><div className="flex justify-between border-t border-neutral-800 pt-4 text-base font-semibold"><span>Total</span><span>{money(total)}</span></div></div></aside>
        </div>
      </div>
    </main>
  )
}
