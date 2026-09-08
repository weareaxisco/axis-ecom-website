import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { generateInvoice } from '../utils/generateInvoice'

const statuses = ['Pending Confirmation', 'Deposit Received', 'In Preparation', 'Dispatched via Ameex', 'Out for Delivery', 'Delivered']
const money = (value) => `${Number(value || 0).toLocaleString()} DH`

export default function OrderTracker({ userId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (error) console.warn(`Order history unavailable: ${error.message}`)
      setOrders(data || [])
      setLoading(false)
    })
    return () => { active = false }
  }, [userId])

  if (loading) return <p className="py-12 text-center text-sm text-neutral-500">Loading your private orders...</p>
  if (!orders.length) return <div className="border border-neutral-800 p-10 text-center"><p className="font-serif text-xl">No orders yet</p><p className="mt-2 text-xs text-neutral-500">Your Maison orders will appear here.</p></div>

  return <div className="space-y-8">{orders.map((order) => {
    const currentIndex = Math.max(0, statuses.indexOf(order.status))
    const onsite = order.onsite_only || order.items?.some((item) => item.onsite_only)
    return <article key={order.id} className="border border-neutral-800 bg-neutral-950/60 p-6"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-[10px] uppercase tracking-widest text-amber-400">Order {order.id}</p><p className="mt-2 text-sm text-neutral-400">{order.city || 'Morocco'} · {order.payment_method || 'COD'} · {money(order.total)}</p></div>{order.tracking_reference && <p className="text-xs font-mono text-neutral-400">Ameex: {order.tracking_reference}</p>}</div><div className="mt-8 space-y-4">{statuses.map((status, index) => <div key={status} className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full border ${index <= currentIndex ? 'border-amber-400 bg-amber-400' : 'border-neutral-700'}`} /><span className={`text-xs uppercase tracking-widest ${index <= currentIndex ? 'text-amber-300' : 'text-neutral-600'}`}>{status}</span></div>)}</div>{order.payment_method?.toLowerCase().includes('cod') && <button type="button" className="mt-6 w-full border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-left text-xs text-amber-300">Pay Upfront Security Deposit via Direct Pay to Priority-Ship Your Package</button>}{onsite && <div className="mt-6 border border-amber-500/40 p-4"><p className="text-xs uppercase tracking-widest text-amber-400">Flagship Boutique Pickup</p><p className="mt-2 text-sm text-neutral-300">{order.pickup_location || 'Casablanca Flagship Store'}</p><p className="mt-1 text-xs text-neutral-500">{order.pickup_date || 'Appointment pending'} · {order.pickup_time || 'Time to be confirmed'}</p><a href="https://maps.google.com/?q=Casablanca+Morocco" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400"><MapPin size={13} /> Get Directions</a></div>}<button type="button" onClick={() => generateInvoice(order)} className="mt-6 border border-amber-500/50 px-4 py-3 text-[10px] uppercase tracking-widest text-amber-300">Download Tax Receipt (PDF)</button></article>
  })}</div>
}
