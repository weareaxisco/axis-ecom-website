import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, Edit3, Eye, LogOut, Package, Search, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { mockProducts } from '../components/ProductCatalog'
import AdminProductTable from '../components/AdminProductTable'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import AdminSettings from '../components/AdminSettings'
import AdminAddProductModal from '../components/AdminAddProductModal'
import { useLanguage } from '../context/LanguageContext'
import AdminAppointments from '../components/AdminAppointments'
import AdminStaff from '../components/AdminStaff'
import AdminAnalytics from '../components/AdminAnalytics'
import AdminTaxonomyManager from '../components/AdminTaxonomyManager'
import { adminRoles, getAllowedAdminTabs, getPrimaryAdminWorkspace, hasAdminPermission } from '../utils/adminAccess'
import { supabase as analyticsSupabase } from '../supabaseClient'
import { useOrderContext } from '../context/OrderContext'
import { useProductContext } from '../context/ProductContext'

const orderReference = (id) => {
  const value = String(id || '')
  return value.startsWith('local-') ? '#ORD-LOCAL' : `#ORD-${value.replace(/-/g, '').slice(0, 4).toUpperCase()}`
}

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

function OrdersTable({ orders, filteredOrders, visibleOrders, query, setQuery, page, setPage, pageSize, setPageSize, pageCount, onEdit, onDelete, onNotice }) {
  const [preview, setPreview] = useState(null)
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)
  const total = (order) => Number(order.total_amount ?? order.total_dh ?? order.total ?? 0)
  const saveEdit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onEdit(edit.id, { customer_name: edit.customer_name, phone: edit.phone, delivery_address: edit.delivery_address, shipping_address: edit.delivery_address, city: edit.city, status: edit.status })
      setEdit(null)
    } catch (error) {
      onNotice(`Unable to save order: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }
  return <div className="relative">
    <div className="sticky top-0 z-10 border border-neutral-800 bg-neutral-950/95 p-3 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3 text-neutral-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order ID, customer, phone, email or city" className="w-full border border-neutral-800 bg-neutral-900 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-amber-500" /></div>
        <label className="flex items-center justify-center gap-2 whitespace-nowrap border border-neutral-800 px-3 py-2.5 text-[10px] uppercase tracking-widest text-neutral-400">Rows:
          <select value={pageSize} onChange={(event) => setPageSize(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="bg-transparent text-xs text-white outline-none">{[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}<option value="all">ALL</option></select>
        </label>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500">{filteredOrders.length} orders</p>
    </div>
    <div className="overflow-x-auto border-x border-neutral-800 bg-neutral-950/70"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr>{['Order ID', 'Customer Name', 'Items', 'City', 'Total', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-neutral-800/80">{visibleOrders.map((order) => <tr key={order.id} className="text-sm"><td className="px-5 py-5 font-mono text-amber-400"><button type="button" title={order.id} onClick={() => navigator.clipboard?.writeText(order.id)} className="inline-flex items-center gap-2 hover:text-white">{orderReference(order.id)}<Copy size={13} /></button></td><td className="px-5 py-5">{order.customer_name || order.full_name || 'Guest Customer'}</td><td className="px-5 py-5"><button type="button" onClick={() => setPreview(order)} className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-amber-300 hover:text-white"><Eye size={14} /> {(order.items || []).length} items</button></td><td className="px-5 py-5 text-neutral-400">{order.city || '—'}</td><td className="px-5 py-5">{total(order).toLocaleString()} DH</td><td className="px-5 py-5 text-xs">{order.status || 'Pending Confirmation'}</td><td className="px-5 py-5"><div className="flex gap-2"><button type="button" onClick={() => setEdit({ ...order, customer_name: order.customer_name || '', phone: order.phone || '', delivery_address: order.delivery_address || order.shipping_address || '', city: order.city || '', status: order.status || 'pending_confirmation' })} className="inline-flex items-center gap-1 border border-neutral-700 px-2 py-1.5 text-[10px] uppercase tracking-widest hover:border-amber-400"><Edit3 size={13} /> Edit</button><button type="button" onClick={() => { if (window.confirm(`Permanently cancel and delete order ${orderReference(order.id)}?`)) onDelete(order.id).catch((error) => onNotice(`Unable to delete order: ${error.message}`)) }} className="inline-flex items-center gap-1 border border-rose-500/50 px-2 py-1.5 text-[10px] uppercase tracking-widest text-rose-300 hover:border-rose-400"><Trash2 size={13} /> Delete</button></div></td></tr>)}</tbody></table>{!visibleOrders.length && <p className="p-10 text-center text-sm text-neutral-500">No orders found.</p>}</div>
    <div className="flex items-center justify-center gap-4 border border-t-0 border-neutral-800 py-4 text-xs uppercase tracking-widest text-neutral-400"><button type="button" aria-label="Previous Page" disabled={page <= 1 || pageSize === 'all'} onClick={() => setPage((current) => current - 1)} className="border border-neutral-800 p-2 hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button><span>Page {page} of {pageCount}</span><button type="button" aria-label="Next Page" disabled={page >= pageCount || pageSize === 'all'} onClick={() => setPage((current) => current + 1)} className="border border-neutral-800 p-2 hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button></div>
    {preview && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true"><div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto border border-neutral-700 bg-neutral-950 p-6"><div className="flex items-center justify-between"><h2 className="font-serif text-xl uppercase tracking-widest">Order Items</h2><button type="button" onClick={() => setPreview(null)} aria-label="Close preview"><X size={18} /></button></div><div className="mt-6 space-y-3">{(preview.items || []).map((item, index) => <div key={`${item.id || item.product_id || item.name}-${index}`} className="flex items-center gap-4 border-b border-neutral-800 py-3"><img src={item.image || item.images?.[0] || '/placeholder.jpg'} alt="" className="h-16 w-16 object-cover" /><div className="min-w-0 flex-1"><a href={`/product/${item.id || item.product_id}`} className="text-sm text-amber-300 hover:text-white">{item.name || item.title || 'Product'}</a><p className="mt-1 text-xs text-neutral-500">Qty {item.quantity || 1} · {Number(item.price || item.unit_price || 0).toLocaleString()} DH</p></div></div>)}</div></div></div>}
    {edit && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true"><form onSubmit={saveEdit} className="w-full max-w-lg border border-neutral-700 bg-neutral-950 p-6"><div className="flex items-center justify-between"><h2 className="font-serif text-xl uppercase tracking-widest">Edit Order</h2><button type="button" onClick={() => setEdit(null)} aria-label="Close edit"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{[['customer_name', 'Customer Name'], ['phone', 'Phone'], ['delivery_address', 'Address'], ['city', 'City']].map(([key, label]) => <label key={key} className="text-[10px] uppercase tracking-widest text-neutral-400">{label}<input value={edit[key]} onChange={(event) => setEdit((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500" /></label>)}<label className="text-[10px] uppercase tracking-widest text-neutral-400 sm:col-span-2">Status<select value={edit.status} onChange={(event) => setEdit((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500">{orderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div><button type="submit" disabled={saving} className="mt-6 w-full bg-amber-500 py-3 text-xs font-semibold uppercase tracking-widest text-black">{saving ? 'Saving…' : 'Save Changes'}</button></form></div>}
  </div>
}

function AdminContent() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { orders: contextOrders, updateOrder, deleteOrder } = useOrderContext()
  const { products: contextProducts } = useProductContext()
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
  const [orderQuery, setOrderQuery] = useState('')
  const [orderPage, setOrderPage] = useState(1)
  const [orderPageSize, setOrderPageSize] = useState(10)
  const [previewOrder, setPreviewOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
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
    const hydrate = async () => {
      const [productResult, orderResult, analyticsResult] = await Promise.allSettled([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        analyticsSupabase.from('analytics_events').select('event_name, visitor_id, metadata, created_at').order('created_at', { ascending: false }).limit(500),
      ])
      if (!active) return
      const warnings = []
      if (productResult.status === 'fulfilled' && Array.isArray(productResult.value.data) && productResult.value.data.length) setProducts(productResult.value.data)
      else if (productResult.status === 'rejected' || productResult.value?.error) warnings.push('products')
      if (orderResult.status === 'fulfilled' && Array.isArray(orderResult.value.data) && orderResult.value.data.length) setOrders(orderResult.value.data)
      else if (orderResult.status === 'rejected' || orderResult.value?.error) warnings.push('orders')
      if (analyticsResult.status === 'fulfilled' && Array.isArray(analyticsResult.value.data)) setAnalyticsEvents(analyticsResult.value.data)
      else if (analyticsResult.status === 'rejected' || analyticsResult.value?.error) warnings.push('analytics')
      if (warnings.length) setNotice(`Some live data is unavailable; using local ${warnings.join(', ')} fallback.`)
      setLoading(false)
    }
    hydrate().catch((error) => { if (active) { setNotice(`Admin data fallback active: ${error.message}`); setLoading(false) } })
    return () => { active = false }
  }, [isAdmin])
  useEffect(() => {
    if (contextOrders.length) setOrders(contextOrders)
  }, [contextOrders])
  useEffect(() => {
    if (contextProducts.length) setProducts(contextProducts)
  }, [contextProducts])
  useEffect(() => {
    setOrderPage(1)
  }, [orderQuery, orderPageSize])
  useEffect(() => {
    const handleOrder = (event) => {
      if (event.detail?.deleted) setOrders((current) => current.filter((order) => order.id !== event.detail.id))
      else if (event.detail?.id) setOrders((current) => [event.detail, ...current.filter((order) => order.id !== event.detail.id)])
    }
    window.addEventListener('orders_updated', handleOrder)
    return () => window.removeEventListener('orders_updated', handleOrder)
  }, [])
  useEffect(() => {
    const handleOrderCreated = (event) => {
      if (event.detail?.id) setOrders((current) => current.some((order) => order.id === event.detail.id) ? current : [event.detail, ...current])
    }
    window.addEventListener('order:created', handleOrderCreated)
    return () => window.removeEventListener('order:created', handleOrderCreated)
  }, [])
  useEffect(() => {
    if (!isAdmin) return undefined
    let active = true
    const mergeRemoteOrders = (incoming) => {
      if (!Array.isArray(incoming) || !incoming.length) return
      setOrders((current) => {
        const byId = new Map(current.map((order) => [order.id, order]))
        incoming.forEach((order) => byId.set(order.id, { ...byId.get(order.id), ...order }))
        return [...byId.values()].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      })
    }
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (active) mergeRemoteOrders(data)
    }
    const channel = supabase
      .channel('admin_orders_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (active && payload.new?.id) mergeRemoteOrders([payload.new])
      })
      .subscribe()
    const pollingTimer = window.setInterval(() => { fetchOrders().catch(() => {}) }, 10000)
    return () => {
      active = false
      window.clearInterval(pollingTimer)
      supabase.removeChannel(channel)
    }
  }, [isAdmin])

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase()
    if (!query) return orders
    return orders.filter((order) => [orderReference(order.id), order.id, order.customer_name, order.full_name, order.phone, order.customer_email, order.city].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [orders, orderQuery])
  const orderPageCount = orderPageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredOrders.length / orderPageSize))
  const visibleOrders = orderPageSize === 'all' ? filteredOrders : filteredOrders.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize)

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

  const handleAppointmentError = useCallback((message) => setNotice(`Unable to load appointment: ${message}`), [])

  const counts = useMemo(() => ({ products: Array.isArray(products) ? products.length : 0, orders: Array.isArray(orders) ? orders.length : 0 }), [products, orders])
  const ordersTable = <OrdersTable orders={orders} filteredOrders={filteredOrders} visibleOrders={visibleOrders} query={orderQuery} setQuery={setOrderQuery} page={orderPage} setPage={setOrderPage} pageSize={orderPageSize} setPageSize={setOrderPageSize} pageCount={orderPageCount} onEdit={async (id, changes) => { const updated = await updateOrder(id, changes); setOrders((current) => current.map((order) => order.id === id ? { ...order, ...updated } : order)) }} onDelete={deleteOrder} onNotice={setNotice} />
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
    <section className="mt-8">{activeTab === 'analytics' ? <AdminAnalytics orders={Array.isArray(orders) ? orders : []} events={Array.isArray(analyticsEvents) ? analyticsEvents : []} /> : activeTab === 'staff' ? <AdminStaff /> : activeTab === 'settings' ? <AdminSettings /> : activeTab === 'appointments' ? <AdminAppointments onError={handleAppointmentError} /> : activeTab === 'taxonomies' ? <AdminTaxonomyManager products={products} onNotice={setNotice} /> : loading ? <p className="py-16 text-center text-sm text-neutral-500">Loading operations data...</p> : activeTab === 'inventory' ? <AdminProductTable products={products} onToggleOnsiteOnly={updateOnsiteOnly} onAddProduct={() => navigate('/admin/inventory/editor/new')} onEditProduct={(product) => navigate(`/admin/inventory/editor/edit/${product.id}`)} onDeleteProduct={handleDeleteProduct} onBulkTag={handleBulkTag} onBulkDelete={handleBulkDelete} /> : ordersTable}</section>{showProductModal && <AdminAddProductModal initialProduct={editingProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null) }} onCreated={(product) => setProducts((current) => [product, ...current])} onUpdated={(product) => setProducts((current) => current.map((item) => item.id === product.id ? product : item))} />}
  </div></main>
}

export default function Admin() {
  return <AdminErrorBoundary><AdminContent /></AdminErrorBoundary>
}
