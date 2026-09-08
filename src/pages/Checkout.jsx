import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { generateInvoice } from '../utils/generateInvoice'
import { useLanguage } from '../context/LanguageContext'
import { getProductPrice } from '../utils/productUtils'
import { trackEvent } from '../utils/analytics'

const money = (value) => `${Number(value || 0).toLocaleString()} DH`
const fallbackCities = [
  { city_id: 'casablanca', city_name: 'Casablanca', delivery_price_dh: 25, estimated_days: 1, region: 'Grand Casablanca-Settat' },
  { city_id: 'rab-sale-kenitra', city_name: 'Rabat / Salé / Kénitra', delivery_price_dh: 35, estimated_days: 2, region: 'Rabat-Salé-Kénitra' },
  { city_id: 'marrakech', city_name: 'Marrakech', delivery_price_dh: 45, estimated_days: 2, region: 'Marrakech-Safi' },
  { city_id: 'tangier', city_name: 'Tangier', delivery_price_dh: 45, estimated_days: 2, region: 'Tanger-Tetouan-Al Hoceima' },
  { city_id: 'agadir', city_name: 'Agadir', delivery_price_dh: 45, estimated_days: 3, region: 'Souss-Massa' },
  { city_id: 'fes', city_name: 'Fes', delivery_price_dh: 45, estimated_days: 2, region: 'Fès-Meknès' },
  { city_id: 'meknes', city_name: 'Meknes', delivery_price_dh: 45, estimated_days: 2, region: 'Fès-Meknès' },
  { city_id: 'oujda', city_name: 'Oujda', delivery_price_dh: 60, estimated_days: 3, region: 'Oriental' },
  { city_id: 'laayoune', city_name: 'Laâyoune', delivery_price_dh: 60, estimated_days: 4, region: 'Laâyoune-Sakia El Hamra' },
  { city_id: 'dakhla', city_name: 'Dakhla', delivery_price_dh: 60, estimated_days: 5, region: 'Dakhla-Oued Ed-Dahab' },
  { city_id: 'tetouan', city_name: 'Tetouan', delivery_price_dh: 45, estimated_days: 3, region: 'Tanger-Tetouan-Al Hoceima' },
]

function parseCsv(text) {
  const [, ...rows] = text.trim().split(/\r?\n/)
  return rows.map((row) => {
    const [city_id, city_name, delivery_price_dh, estimated_days, region] = row.split(',')
    return { city_id, city_name, delivery_price_dh: Number(delivery_price_dh), estimated_days: Number(estimated_days), region }
  })
}

const codTimeline = [
  'Order Placed',
  'Awaiting Phone Confirmation / Upfront Security Deposit (Direct Pay Option)',
  'Confirmed & Artisan Packing',
  'Dispatched via Ameex',
  'Out for Delivery',
  'Delivered',
]
const onlineTimeline = ['Payment Confirmed', 'Crafting & Preparation', 'Dispatched via Ameex (Tracking Link)', 'Delivered']

export default function Checkout() {
  const { cartItems, subtotal, hasOnsiteOnly } = useCart()
  const { t } = useLanguage()
  const [cities, setCities] = useState(fallbackCities)
  const [step, setStep] = useState(1)
  const [payment, setPayment] = useState('cod')
  const [fulfillment, setFulfillment] = useState(hasOnsiteOnly ? 'onsite' : 'delivery')
  const [phoneError, setPhoneError] = useState('')
  const [form, setForm] = useState({ fullName: '', address: '', city: 'Casablanca', postalCode: '', phone: '+212 ', pickupDate: '', pickupTime: '' })

  useEffect(() => {
    let active = true
    fetch('/data/ameex_cities.csv')
      .then((response) => {
        if (!response.ok) throw new Error(`Ameex city data request failed: ${response.status}`)
        return response.text()
      })
      .then((text) => {
        if (active) setCities(parseCsv(text))
      })
      .catch((error) => console.warn(`Using fallback Ameex city data: ${error.message}`))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (hasOnsiteOnly) setFulfillment('onsite')
  }, [hasOnsiteOnly])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const selectedCity = cities.find((city) => city.city_name === form.city) || cities[0]
  const shippingFee = fulfillment === 'onsite' ? 0 : Number(selectedCity?.delivery_price_dh || 0)
  const total = subtotal + shippingFee
  const timeline = payment === 'cod' ? codTimeline : onlineTimeline
  const inputClass = 'mt-1 w-full border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500/70'

  const advanceStep = () => {
    if (step === 1 && fulfillment === 'delivery' && !/^\+212\s?[67]\d{2}[-\s]?\d{6}$/.test(form.phone.trim())) {
      setPhoneError('Use +212 6XX-XXXXXX or +212 7XX-XXXXXX.')
      return
    }
    if (step === 1 && fulfillment === 'onsite' && (!form.pickupDate || !form.pickupTime)) return
    setPhoneError('')
    if (step === 1) trackEvent('begin_checkout', { items: cartItems.length, value: total }).catch(() => {})
    if (step === 2) trackEvent('purchase', { items: cartItems.length, value: total, payment }).catch(() => {})
    setStep((current) => current + 1)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="text-center"><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">Maison de l'Élégance</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">{t('checkoutTitle')}</h1></header>
        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between text-[10px] uppercase tracking-widest">{[t('deliveryStep'), t('paymentStep'), t('confirmationStep')].map((label, index) => <div key={label} className={`flex items-center gap-2 ${step === index + 1 ? 'text-amber-400' : 'text-neutral-500'}`}><span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">{index + 1}</span>{label}</div>)}</div>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
          <section className="border-t border-neutral-800 pt-8">
            {step === 1 && <div className="space-y-6">
              {hasOnsiteOnly ? <div className="border border-amber-500/50 bg-amber-500/10 p-5 text-sm leading-6 text-amber-200">This exclusive creation requires private boutique pickup at our Flagship Store.<strong className="mt-2 block text-xs uppercase tracking-widest text-amber-400">Onsite Boutique Pickup — 0 DH</strong></div> : <div className="border border-neutral-800 p-4"><label className="flex items-center gap-3 text-sm"><input type="radio" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} className="accent-amber-500" />Ameex delivery across Morocco</label><p className="mt-2 pl-6 text-xs text-neutral-500">Select your city to calculate delivery pricing.</p></div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2 text-[11px] uppercase tracking-widest text-neutral-400">Full Name<input value={form.fullName} onChange={update('fullName')} className={inputClass} /></label>
                <label className="sm:col-span-2 text-[11px] uppercase tracking-widest text-neutral-400">Address<input value={form.address} onChange={update('address')} className={inputClass} /></label>
                {!hasOnsiteOnly && <label htmlFor="checkout-city" className="text-[11px] uppercase tracking-widest text-neutral-400">City<select id="checkout-city" aria-label="City" value={form.city} onChange={update('city')} className={inputClass}>{cities.map((city) => <option key={city.city_id} value={city.city_name}>{city.city_name} — {city.delivery_price_dh} DH</option>)}</select><span className="mt-1 block text-[10px] font-mono text-amber-400">{selectedCity.delivery_price_dh} DH · {selectedCity.estimated_days} day delivery</span></label>}
                {!hasOnsiteOnly && <label htmlFor="checkout-postal" className="text-[11px] uppercase tracking-widest text-neutral-400">Postal Code<input id="checkout-postal" value={form.postalCode} onChange={update('postalCode')} className={inputClass} /></label>}
                {!hasOnsiteOnly && <label htmlFor="checkout-phone" className="text-[11px] uppercase tracking-widest text-neutral-400">Phone (+212)<input id="checkout-phone" aria-label="Phone (+212)" value={form.phone} onChange={(event) => { update('phone')(event); setPhoneError('') }} className={inputClass} />{phoneError && <span className="mt-1 block text-xs text-rose-400">{phoneError}</span>}</label>}
                {hasOnsiteOnly && <><label className="text-[11px] uppercase tracking-widest text-neutral-400">Pickup Date<input type="date" value={form.pickupDate} onChange={update('pickupDate')} className={inputClass} /></label><label className="text-[11px] uppercase tracking-widest text-neutral-400">Time Slot<select value={form.pickupTime} onChange={update('pickupTime')} className={inputClass}><option value="">Select a time</option><option>10:00 – 12:00</option><option>12:00 – 14:00</option><option>14:00 – 16:00</option><option>16:00 – 18:00</option></select></label></>}
              </div>
            </div>}
            {step === 2 && <div className="space-y-3">{[['cod', t('cod'), 'Pay securely upon delivery in Morocco.'], ['card', 'Credit Card', 'CMI / Stripe secure payment placeholder.'], ['wire', 'Wire Transfer / Bank Deposit', 'Bank details will be provided after confirmation.']].map(([value, title, description]) => <label key={value} className={`block cursor-pointer border p-5 ${payment === value ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-800'}`}><input type="radio" name="payment" value={value} checked={payment === value} onChange={(event) => setPayment(event.target.value)} className="mr-3 accent-amber-500" /><span className="text-sm uppercase tracking-widest">{title}</span><p className="mt-2 pl-6 text-xs text-neutral-500">{description}</p></label>)}</div>}
            {step === 3 && <div className="border border-amber-500/40 bg-neutral-900/50 p-8"><p className="text-center text-[10px] uppercase tracking-[0.25em] text-amber-400">Order Status</p><h2 className="mt-4 text-center font-serif text-2xl uppercase tracking-widest">Your journey with the Maison</h2><div className="mx-auto mt-8 max-w-xl space-y-5">{timeline.map((status, index) => <div key={status} className="flex gap-4"><span className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full border ${index === 0 ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'}`} /><div><p className={`text-xs uppercase tracking-widest ${index === 0 ? 'text-amber-400' : 'text-neutral-400'}`}>{status}</p>{payment === 'cod' && index === 1 && <button type="button" className="mt-2 text-[10px] uppercase tracking-widest text-amber-400 underline">Pay Upfront Deposit to Fast-Track Shipping</button>}</div></div>)}</div><button type="button" onClick={() => generateInvoice({ cartItems, subtotal, shippingFee, city: form.city, address: form.address, fullName: form.fullName, payment_method: payment })} className="mx-auto mt-8 block border border-amber-500/50 px-4 py-3 text-[10px] uppercase tracking-widest text-amber-300">Download Tax Receipt (PDF)</button></div>}
            {step < 3 && <button type="button" onClick={advanceStep} className="mt-8 bg-amber-500 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-black">{step === 1 ? 'Continue to Payment' : t('reviewOrder')}</button>}
          </section>
          <aside className="h-fit border border-neutral-800 bg-neutral-950/60 p-6 lg:sticky lg:top-32"><h2 className="font-serif text-xl uppercase tracking-widest">Order Summary</h2><div className="mt-6 space-y-4">          {cartItems.map((item) => <div key={item.cartKey} className="flex justify-between gap-4 text-xs"><span>{item.name} × {item.quantity}</span><span>{money(getProductPrice(item) * item.quantity)}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-neutral-800 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between text-neutral-500"><span>Tax</span><span>Included</span></div><div className="flex justify-between text-amber-400"><span>Shipping</span><span>{shippingFee ? money(shippingFee) : 'Complimentary'}</span></div><div className="flex justify-between border-t border-neutral-800 pt-4 text-base font-semibold"><span>Total</span><span>{money(total)}</span></div></div></aside>
        </div>
      </div>
    </main>
  )
}
