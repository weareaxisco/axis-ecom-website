import { useCallback, useEffect, useMemo, useState } from 'react'
import { LogOut, Package, ShieldCheck, ShoppingBag } from 'lucide-react'
import { mockProducts } from '../components/ProductCatalog'
import AdminProductTable from '../components/AdminProductTable'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import AdminSettings from '../components/AdminSettings'
import AdminAddProductModal from '../components/AdminAddProductModal'
import { useLanguage } from '../context/LanguageContext'
import AdminAppointments from '../components/AdminAppointments'

const ADMIN_SESSION_KEY = 'maison_admin_session'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'maison-admin'
const orderStatuses = ['Pending Confirmation', 'Deposit Received', 'In Preparation', 'Dispatched via Ameex', 'Out for Delivery', 'Completed', 'Cancelled']
const mockOrders = [
  { id: 'ORD-1001', customer_name: 'Nadia El Mansouri', city: 'Casablanca', payment_method: 'COD', total: 185000, status: 'Pending Confirmation' },
  { id: 'ORD-1002', customer_name: 'Youssef Bennani', city: 'Rabat', payment_method: 'CMI / Stripe', total: 320000, status: 'In Preparation' },
]

function LoginGate({ onAuthenticated }) {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (password !== ADMIN_PASSWORD) {
      setError(t('invalidCredentials'))
      return
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated')
    onAuthenticated()
  }
  return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white"><form onSubmit={submit} className="w-full max-w-sm border border-neutral-800 bg-neutral-900/70 p-8"><ShieldCheck className="text-amber-400" size={28} /><h1 className="mt-5 font-serif text-2xl uppercase tracking-widest">Maison Admin</h1><p className="mt-2 text-xs text-neutral-500">{t('secureConsole')}</p><label className="mt-8 block text-[10px] uppercase tracking-widest text-neutral-400">{t('adminPassword')}<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} className="mt-2 w-full border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500" /></label>{error && <p className="mt-2 text-xs text-rose-400">{error}</p>}<button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">{t('enterDashboard')}</button>{import.meta.env.DEV && <button type="button" onClick={() => { sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated'); onAuthenticated() }} className="mt-4 w-full border border-neutral-700 py-3 text-[10px] uppercase tracking-widest text-neutral-400">{t('useDevAccess')}</button>}</form></main>
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated')
  const [tab, setTab] = useState('orders')
  const [products, setProducts] = useState(mockProducts)
  const [orders, setOrders] = useState(mockOrders)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)

  const isAdmin = user?.role === 'admin'
  useEffect(() => {
    if (!authenticated && !isAdmin) return undefined
    let active = true
    Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]).then(([productResult, orderResult]) => {
      if (!active) return
      if (productResult.data?.length) setProducts(productResult.data)
      if (orderResult.data?.length) setOrders(orderResult.data)
      if (productResult.error || orderResult.error) setNotice('Some live data is unavailable; showing the latest local catalogue.')
      setLoading(false)
    }).catch((error) => {
      if (active) {
        setNotice(error.message)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [authenticated, isAdmin])

  const updateOnsiteOnly = async (id, onsiteOnly) => {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, onsite_only: onsiteOnly } : product))
    const { error } = await supabase.from('products').update({ onsite_only: onsiteOnly }).eq('id', id)
    if (error) setNotice(`Unable to save product restriction: ${error.message}`)
  }

  const updateOrderStatus = async (id, status) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) setNotice(`Unable to save order status: ${error.message}`)
  }
  const handleAppointmentError = useCallback((message) => setNotice(`Unable to load appointment: ${message}`), [])

  const counts = useMemo(() => ({ products: products.length, orders: orders.length }), [products, orders])
  if (authLoading) return <main className="min-h-screen bg-neutral-950 p-20 text-center text-sm text-neutral-500">{t('loading')}</main>
  if (!isAdmin && !authenticated) return <LoginGate onAuthenticated={() => setAuthenticated(true)} />

  return <main className="min-h-screen bg-neutral-950 px-4 pb-20 pt-12 text-white md:px-10"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-6 border-b border-neutral-800 pb-8"><div><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Maison de l'Élégance</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">Operations</h1></div><button type="button" onClick={() => { sessionStorage.removeItem(ADMIN_SESSION_KEY); setAuthenticated(false) }} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 hover:text-amber-400"><LogOut size={15} /> Sign out</button></header>
    <nav className="mt-8 flex flex-wrap gap-2 border-b border-neutral-800"><button type="button" onClick={() => setTab('orders')} className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${tab === 'orders' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}><ShoppingBag size={15} /> {t('myOrders')} ({counts.orders})</button><button type="button" onClick={() => setTab('inventory')} className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${tab === 'inventory' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}><Package size={15} /> {t('inventory')} ({counts.products})</button><button type="button" onClick={() => setTab('appointments')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${tab === 'appointments' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>Appointments</button><button type="button" onClick={() => setTab('settings')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${tab === 'settings' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>{t('settings')}</button></nav>
    {notice && <p className="mt-5 border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300">{notice}</p>}
    <section className="mt-8">{tab === 'settings' ? <AdminSettings /> : tab === 'appointments' ? <AdminAppointments onError={handleAppointmentError} /> : loading ? <p className="py-16 text-center text-sm text-neutral-500">Loading operations data...</p> : tab === 'inventory' ? <AdminProductTable products={products} onToggleOnsiteOnly={updateOnsiteOnly} onAddProduct={() => setShowProductModal(true)} /> : <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr>{['Order ID', 'Customer Name', 'City', 'Payment Method', 'Total (DH)', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-neutral-800/80">{orders.map((order) => <tr key={order.id} className="text-sm"><td className="px-5 py-5 font-mono text-amber-400">{order.id}</td><td className="px-5 py-5">{order.customer_name || order.customer?.name || '—'}</td><td className="px-5 py-5 text-neutral-400">{order.city || '—'}</td><td className="px-5 py-5 text-xs text-neutral-400">{order.payment_method || order.payment || '—'}</td><td className="px-5 py-5">{Number(order.total || 0).toLocaleString()} DH</td><td className="px-5 py-5"><span className="text-xs text-amber-300">{order.status}</span></td><td className="px-5 py-5"><select aria-label={`Update status for ${order.id}`} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-500">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}</section>{showProductModal && <AdminAddProductModal onClose={() => setShowProductModal(false)} onCreated={(product) => setProducts((current) => [product, ...current])} />}
  </div></main>
}
