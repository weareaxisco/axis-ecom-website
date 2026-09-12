import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, ShieldCheck, ShoppingBag } from 'lucide-react'
import { mockProducts } from '../components/ProductCatalog'
import AdminProductTable from '../components/AdminProductTable'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import AdminSettings from '../components/AdminSettings'
import AdminAddProductModal from '../components/AdminAddProductModal'
import { useLanguage } from '../context/LanguageContext'
import AdminAppointments from '../components/AdminAppointments'
import AdminStaff from '../components/AdminStaff'
import { ameexDispatchEnabled, createSandboxParcel } from '../services/ameexApi'
import AdminAnalytics from '../components/AdminAnalytics'
import AdminTaxonomyManager from '../components/AdminTaxonomyManager'
import { adminRoles, getAllowedAdminTabs, getPrimaryAdminWorkspace, hasAdminPermission } from '../utils/adminAccess'
import { supabase as analyticsSupabase } from '../supabaseClient'

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-center text-white"><div className="max-w-md border border-amber-500/40 bg-neutral-900/70 p-8"><h1 className="font-serif text-2xl uppercase tracking-widest text-amber-400">Unable to load admin data</h1><p className="mt-4 text-sm text-neutral-400">Please refresh and try again.</p></div></main>
    }
    return this.props.children
  }
}

const orderStatuses = [
  { value: 'pending_confirmation', label: 'Pending Confirmation' },
  { value: 'deposit_received', label: 'Deposit Received' },
  { value: 'in_preparation', label: 'In Preparation' },
  { value: 'dispatched_ameex', label: 'Dispatched via Ameex' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]
const mockOrders = [
  { id: 'ORD-1001', customer_name: 'Nadia El Mansouri', city: 'Casablanca', payment_method: 'COD', total_dh: 185000, status: 'pending_confirmation' },
  { id: 'ORD-1002', customer_name: 'Youssef Bennani', city: 'Rabat', payment_method: 'CMI / Stripe', total_dh: 320000, status: 'in_preparation' },
]

function LoginGate({ onAuthorized }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword(form)
      if (signInError || !data.user) throw signInError || new Error(t('invalidCredentials'))
      const { data: profile, error: profileError } = await supabase.from('profiles').select('role, permissions').eq('id', data.user.id).maybeSingle()
      if (profileError) throw profileError
      console.error('[Admin auth] profile role:', profile?.role || 'missing')
      if (!profile?.role || !adminRoles.includes(profile.role)) {
        const accessError = 'Access Denied: Account lacks admin permissions'
        console.error('[Admin auth] access denied:', { userId: data.user.id, role: profile?.role || null })
        setError(accessError)
        await supabase.auth.signOut()
        return
      }
      onAuthorized({ ...data.user, role: profile.role, permissions: profile.permissions || {} })
    } catch (authError) {
      console.error('[Admin auth] sign-in failed:', authError)
      setError(authError.message || 'Unable to sign in.')
    }
  }
  return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white"><form onSubmit={submit} className="w-full max-w-sm border border-neutral-800 bg-neutral-900/70 p-8"><ShieldCheck className="text-amber-400" size={28} /><h1 className="mt-5 font-serif text-2xl uppercase tracking-widest">{t('adminMaison')}</h1><p className="mt-2 text-xs text-neutral-500">{t('secureConsole')}</p>{error && <div className="mb-4 rounded border border-red-800 bg-red-950/50 p-3 text-xs text-red-300">{error}</div>}<label className="mt-8 block text-[10px] uppercase tracking-widest text-neutral-400">{t('adminEmail')}<input required type="email" value={form.email} onChange={(event) => { setForm((current) => ({ ...current, email: event.target.value })); setError('') }} className="mt-2 w-full border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500" /></label><label className="mt-4 block text-[10px] uppercase tracking-widest text-neutral-400">{t('adminPasswordLabel')}<input required type="password" value={form.password} onChange={(event) => { setForm((current) => ({ ...current, password: event.target.value })); setError('') }} className="mt-2 w-full border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500" /></label><button type="submit" className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">{t('enterDashboard')}</button></form></main>
}

function AdminContent() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [tab, setTab] = useState(() => {
    try {
      return window.sessionStorage.getItem('admin_active_tab') || 'orders'
    } catch {
      return 'orders'
    }
  })
  const [products, setProducts] = useState(mockProducts)
  const [orders, setOrders] = useState(mockOrders)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [authorizedUser, setAuthorizedUser] = useState(null)
  const [analyticsEvents, setAnalyticsEvents] = useState([])
  const [showTabFade, setShowTabFade] = useState(true)
  const mobileTabsRef = useRef(null)

  const activeUser = user || authorizedUser
  const isAdmin = adminRoles.includes(activeUser?.role)
  const can = (permission) => hasAdminPermission(activeUser, permission)
  const allowedTabs = getAllowedAdminTabs(activeUser)
  const allowedTabsKey = allowedTabs.join('|')
  const primaryWorkspace = getPrimaryAdminWorkspace(activeUser)
  const activeTab = allowedTabs.includes(tab) ? tab : primaryWorkspace
  const selectTab = (nextTab) => {
    setTab(nextTab)
    try {
      window.sessionStorage.setItem('admin_active_tab', nextTab)
    } catch {
      // Session persistence is optional when browser storage is unavailable.
    }
  }
  useEffect(() => {
    if (isAdmin && !allowedTabsKey.split('|').includes(tab)) selectTab(primaryWorkspace || 'orders')
  }, [isAdmin, tab, primaryWorkspace, allowedTabsKey])
  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    const element = mobileTabsRef.current
    if (!element) return undefined
    const updateFade = () => setShowTabFade(element.scrollLeft + element.clientWidth < element.scrollWidth - 10)
    updateFade()
    element.addEventListener('scroll', updateFade, { passive: true })
    window.addEventListener('resize', updateFade)
    return () => {
      element.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [])
  useEffect(() => {
    if (!isAdmin) return undefined
    let active = true
    Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      analyticsSupabase.from('analytics_events').select('event_name, visitor_id, metadata, created_at').order('created_at', { ascending: false }).limit(500),
    ]).then(([productResult, orderResult, analyticsResult]) => {
      if (!active) return
      if (Array.isArray(productResult.data) && productResult.data.length) setProducts(productResult.data)
      if (Array.isArray(orderResult.data) && orderResult.data.length) setOrders(orderResult.data)
      if (Array.isArray(analyticsResult.data)) setAnalyticsEvents(analyticsResult.data)
      if (productResult.error || orderResult.error) setNotice('Some live data is unavailable; showing the latest local catalogue.')
      setLoading(false)
    }).catch((error) => {
      if (active) {
        setNotice(error.message)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [isAdmin])

  const updateOnsiteOnly = async (id, onsiteOnly) => {
    if (!can('manage_products')) return
    setProducts((current) => current.map((product) => product.id === id ? { ...product, onsite_only: onsiteOnly } : product))
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      setNotice(t('productUpdated'))
      return
    }
    const { error } = await supabase.from('products').update({ onsite_only: onsiteOnly }).eq('id', id)
    if (error) setNotice(`Unable to save product restriction: ${error.message}`)
  }
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }
  const handleDeleteProduct = async (product) => {
    if (!can('manage_products') || !window.confirm(`Delete ${product.name || product.title}?`)) return
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id)) {
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice(t('productDeleted'))
      return
    }
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) {
      setNotice(error.message)
      return
    }
    setProducts((current) => current.filter((item) => item.id !== product.id))
    setNotice(t('productDeleted'))
  }
  const handleBulkTag = async (ids, tag) => {
    if (!can('manage_products')) return
    const selected = products.filter((product) => ids.includes(product.id))
    await Promise.all(selected.map(async (product) => {
      const currentTags = Array.isArray(product.tags) ? product.tags : product.tags ? [product.tags] : []
      const nextTags = [...new Set([...currentTags, tag])]
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id)) {
        const { error } = await supabase.from('products').update({ tags: nextTags }).eq('id', product.id)
        if (error) throw error
      }
      return { ...product, tags: nextTags }
    })).then((updated) => {
      setProducts((current) => current.map((product) => updated.find((item) => item.id === product.id) || product))
      setNotice(`${tag} assigned to ${ids.length} products`)
    }).catch((error) => setNotice(`Unable to assign tag: ${error.message}`))
  }
  const handleBulkDelete = async (ids) => {
    if (!can('manage_products')) return
    const uuidIds = ids.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    const { error } = uuidIds.length ? await supabase.from('products').delete().in('id', uuidIds) : { error: null }
    if (error) {
      setNotice(error.message)
      return
    }
    setProducts((current) => current.filter((product) => !ids.includes(product.id)))
    setNotice(t('productDeleted'))
  }

  const updateOrderStatus = async (id, status) => {
    if (!can('manage_orders')) return
    if (status === 'dispatched_ameex') {
      setNotice('Use the explicit Dispatch to Ameex button to create a parcel.')
      return
    }
    try {
      const update = { status }
      setOrders((current) => current.map((item) => item.id === id ? { ...item, ...update } : item))
      const { error } = await supabase.from('orders').update(update).eq('id', id)
      if (error) throw new Error(error.message)
    } catch (error) {
      setNotice(`Unable to update order: ${error.message}`)
    }
  }
  const dispatchToAmeex = async (order) => {
    if (!can('manage_orders')) return
      if (!ameexDispatchEnabled) {
        setNotice('Ameex dispatch is disabled by configuration.')
        return
      }
      try {
        const tracking = order.ameex_tracking_id || await createSandboxParcel(order)
        const update = { status: 'dispatched_ameex', ameex_tracking_id: tracking }
        const { error } = await supabase.from('orders').update(update).eq('id', order.id)
        if (error) throw new Error(error.message)
        setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...update } : item))
        setNotice(`Ameex Sandbox parcel created: ${tracking}`)
      } catch (error) {
        setNotice(`Unable to dispatch order: ${error.message}`)
      }
    }
  const handleAppointmentError = useCallback((message) => setNotice(`Unable to load appointment: ${message}`), [])

  const counts = useMemo(() => ({ products: Array.isArray(products) ? products.length : 0, orders: Array.isArray(orders) ? orders.length : 0 }), [products, orders])
  const tabs = [
    ...(can('manage_orders') ? [{ id: 'analytics', label: 'Analytics' }, { id: 'orders', label: `${t('myOrders')} (${counts.orders})` }] : []),
    ...(can('manage_products') ? [{ id: 'inventory', label: `${t('inventory')} (${counts.products})` }, { id: 'taxonomies', label: 'Taxonomies' }] : []),
    ...(can('manage_appointments') ? [{ id: 'appointments', label: 'Appointments' }] : []),
    ...(can('manage_settings') ? [{ id: 'settings', label: t('settings') }] : []),
    ...(['super_admin', 'admin'].includes(activeUser?.role) ? [{ id: 'staff', label: 'Staff & Permissions' }] : []),
  ]
  if (authLoading) return <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-center text-sm text-neutral-500"><div><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" /><p className="mt-4">{t('loading')}</p></div></main>
  if (!isAdmin) return <LoginGate onAuthorized={setAuthorizedUser} />

  return <main className="min-h-screen bg-neutral-950 px-4 pb-20 pt-12 text-white md:px-10"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-6 border-b border-neutral-800 pb-8"><div><p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Maison de l'Élégance</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">Operations</h1></div><button type="button" onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 hover:text-amber-400"><LogOut size={15} /> Sign out</button></header>
    <nav className="mt-8 hidden flex-wrap gap-2 border-b border-neutral-800 md:flex">{can('manage_orders') && <button type="button" onClick={() => selectTab('analytics')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'analytics' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>Analytics</button>}{can('manage_orders') && <button type="button" onClick={() => selectTab('orders')} className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'orders' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}><ShoppingBag size={15} /> {t('myOrders')} ({counts.orders})</button>}{can('manage_products') && <button type="button" onClick={() => selectTab('inventory')} className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'inventory' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}><Package size={15} /> {t('inventory')} ({counts.products})</button>}{can('manage_products') && <button type="button" onClick={() => selectTab('taxonomies')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'taxonomies' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>Taxonomies</button>}{can('manage_appointments') && <button type="button" onClick={() => selectTab('appointments')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'appointments' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>Appointments</button>}{can('manage_settings') && <button type="button" onClick={() => selectTab('settings')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'settings' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>{t('settings')}</button>}{    ['super_admin', 'admin'].includes(activeUser?.role) && <button type="button" onClick={() => selectTab('staff')} className={`border-b-2 px-5 py-4 text-xs uppercase tracking-widest ${activeTab === 'staff' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>Staff &amp; Permissions</button>}</nav>
    <div className="relative md:hidden"><nav ref={mobileTabsRef} className="mt-8 flex overflow-x-auto no-scrollbar whitespace-nowrap gap-3 border-b border-neutral-800 pb-3" aria-label="Admin mobile navigation">{tabs.map((tabItem) => <button key={tabItem.id} type="button" onClick={(event) => { selectTab(tabItem.id); event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }) }} className={`shrink-0 rounded-none border-b-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${activeTab === tabItem.id ? 'border-amber-400 bg-neutral-900/60 font-bold text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'}`}>{tabItem.label}</button>)}</nav>{showTabFade && <span aria-hidden="true" className="pointer-events-none absolute right-0 top-8 h-9 w-12 bg-gradient-to-l from-neutral-950 to-transparent" />}</div>
    {notice && <p role="status" className="fixed bottom-6 left-1/2 z-[70] w-[90%] max-w-md -translate-x-1/2 rounded-none border border-amber-500/40 bg-neutral-900 px-6 py-3 text-center text-xs text-amber-300 shadow-2xl transition-all duration-300 ease-in-out md:w-auto">{notice}</p>}
    <section className="mt-8">{activeTab === 'analytics' ? <AdminAnalytics orders={Array.isArray(orders) ? orders : []} events={Array.isArray(analyticsEvents) ? analyticsEvents : []} /> : activeTab === 'staff' ? <AdminStaff /> : activeTab === 'settings' ? <AdminSettings /> : activeTab === 'appointments' ? <AdminAppointments onError={handleAppointmentError} /> : activeTab === 'taxonomies' ? <AdminTaxonomyManager products={products} onNotice={setNotice} /> : loading ? <p className="py-16 text-center text-sm text-neutral-500">Loading operations data...</p> : activeTab === 'inventory' ? <AdminProductTable products={products} onToggleOnsiteOnly={updateOnsiteOnly} onAddProduct={() => navigate('/admin/inventory/editor/new')} onEditProduct={(product) => navigate(`/admin/inventory/editor/edit/${product.id}`)} onDeleteProduct={handleDeleteProduct} onBulkTag={handleBulkTag} onBulkDelete={handleBulkDelete} /> : <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr>{['Order ID', 'Customer Name', 'City', 'Payment Method', 'Total (DH)', 'Status', 'Ameex Tracking'].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead>    <tbody className="divide-y divide-neutral-800/80">{(Array.isArray(orders) ? orders : []).map((order) => <tr key={order.id} className="text-sm"><td className="px-5 py-5 font-mono text-amber-400">{order.id}</td><td className="px-5 py-5">{order.customer_name || order.customer?.name || '—'}</td><td className="px-5 py-5 text-neutral-400">{order.city || '—'}</td><td className="px-5 py-5 text-xs text-neutral-400">{order.payment_method || order.payment || '—'}</td><td className="px-5 py-5">{Number(order.total_dh ?? order.total ?? 0).toLocaleString()} DH</td>    <td className="px-5 py-5"><div className="flex flex-wrap gap-2"><select aria-label={`Update status for ${order.id}`} value={order.status === 'dispatched_ameex' ? 'in_preparation' : order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-500">{orderStatuses.filter((status) => status.value !== 'dispatched_ameex').map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>{order.status !== 'dispatched_ameex' && <button type="button" disabled={!ameexDispatchEnabled} onClick={() => dispatchToAmeex(order)} className="border border-amber-400 px-3 py-2 text-[10px] uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40">Dispatch to Ameex</button>}</div></td><td className="px-5 py-5 text-xs font-mono text-neutral-400">{order.ameex_tracking_id || '—'}</td></tr>)}</tbody></table>    </div>}</section>{showProductModal && <AdminAddProductModal initialProduct={editingProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null) }} onCreated={(product) => setProducts((current) => [product, ...current])} onUpdated={(product) => setProducts((current) => current.map((item) => item.id === product.id ? product : item))} />}
  </div></main>
}

export default function Admin() {
  return <AdminErrorBoundary><AdminContent /></AdminErrorBoundary>
}
