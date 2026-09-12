import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const OrderContext = createContext(null)
const localOrdersKey = 'maison_orders'
const channelName = 'maison_orders_channel'
const readLocalOrders = () => {
  try {
    const value = JSON.parse(window.localStorage.getItem(localOrdersKey) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(readLocalOrders)

  useEffect(() => {
    let active = true
    const load = async () => {
      const local = readLocalOrders()
      let data = null
      let error = null
      try {
        const result = await supabase.from('orders').select('*').order('created_at', { ascending: false })
        data = result.data
        error = result.error
      } catch (requestError) {
        console.warn('[orders] remote load unavailable:', requestError)
      }
      if (!active) return
      if (!error && Array.isArray(data)) {
        const merged = [...data, ...local.filter((item) => !data.some((order) => order.id === item.id))]
        setOrders(merged)
        window.localStorage.setItem(localOrdersKey, JSON.stringify(merged))
      } else setOrders(local)
    }
    load().catch(() => setOrders(readLocalOrders()))
    return () => { active = false }
  }, [])
  useEffect(() => {
    const handleOrderUpdate = (event) => {
      const incoming = event.detail
      if (Array.isArray(incoming?.orders)) {
        setOrders(incoming.orders)
      } else if (incoming?.clearAll) {
        setOrders([])
      } else if (incoming?.id) {
        setOrders((current) => incoming.deleted
          ? current.filter((order) => order.id !== incoming.id)
          : [incoming, ...current.filter((order) => order.id !== incoming.id)])
      }
    }
    window.addEventListener('orders_updated', handleOrderUpdate)
    const handleStorage = (event) => {
      if (event.key !== localOrdersKey) return
      setOrders(event.newValue ? JSON.parse(event.newValue) : [])
    }
    window.addEventListener('storage', handleStorage)
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null
    if (channel) channel.onmessage = (event) => {
      if (Array.isArray(event.data?.orders)) setOrders(event.data.orders)
    }
    return () => {
      window.removeEventListener('orders_updated', handleOrderUpdate)
      window.removeEventListener('storage', handleStorage)
      channel?.close()
    }
  }, [])

  const createOrder = useCallback(async (payload) => {
    let user = null
    try {
      const result = await supabase.auth.getUser()
      user = result.data?.user || null
    } catch (error) {
      console.warn('[orders] auth lookup unavailable:', error)
    }
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const newOrder = {
      id: orderId,
      user_id: user?.id,
      customer_name: payload.customer_name || payload.full_name || 'Guest Customer',
      customer_email: payload.customer_email || user?.email || '',
      phone: payload.phone || '',
      address: payload.address || payload.shipping_address || payload.delivery_address || '',
      city: payload.city || '',
      items: payload.items || [],
      subtotal: payload.subtotal ?? payload.subtotal_dh ?? 0,
      total_amount: payload.total_amount ?? payload.total_dh ?? 0,
      status: 'Pending Confirmation',
      created_at: new Date().toISOString(),
      shipping_address: payload.shipping_address || payload.delivery_address || payload.address || '',
      subtotal_dh: payload.subtotal_dh ?? payload.subtotal,
      shipping_fee_dh: payload.shipping_fee_dh,
      total_dh: payload.total_dh ?? payload.total_amount,
      delivery_address: payload.delivery_address || payload.address,
      payment_method: payload.payment_method,
      postal_code: payload.postal_code,
    }
    let updatedOrders = []
    setOrders((current) => {
      updatedOrders = [newOrder, ...current.filter((item) => item.id !== newOrder.id)]
      return updatedOrders
    })
    try {
      window.localStorage.setItem(localOrdersKey, JSON.stringify(updatedOrders))
      const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null
      channel?.postMessage({ orders: updatedOrders })
      channel?.close()
    } catch (error) {
      console.warn('[orders] local persistence unavailable:', error)
    }
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: { orders: updatedOrders } }))
    window.dispatchEvent(new CustomEvent('order:created', { detail: newOrder }))
    try {
      const { error } = await supabase.from('orders').insert(newOrder).select().single()
      if (error) console.warn('[orders] remote insert rejected; local order retained:', error.message)
    } catch (error) {
      console.warn('[orders] remote insert unavailable; local order retained:', error)
    }
    return newOrder
  }, [])

  const updateOrder = useCallback(async (id, changes) => {
    const { data, error } = await supabase.from('orders').update(changes).eq('id', id).select().single()
    const updated = data || { id, ...changes }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...updated } : order))
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: updated }))
    if (error) throw new Error(error.message)
    return updated
  }, [])

  const deleteOrder = useCallback(async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error && !String(id).startsWith('local-')) throw new Error(error.message)
    setOrders((current) => current.filter((order) => order.id !== id))
    try {
      window.localStorage.setItem(localOrdersKey, JSON.stringify(readLocalOrders().filter((order) => order.id !== id)))
    } catch {
      // Local persistence is optional when browser storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: { id, deleted: true } }))
  }, [])

  const clearAllOrders = useCallback(async () => {
    const { error } = await supabase.from('orders').delete().not('id', 'is', null)
    setOrders([])
    try {
      window.localStorage.removeItem(localOrdersKey)
    } catch {
      // Local persistence is optional when browser storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: { clearAll: true } }))
    if (error) throw new Error(error.message)
  }, [])

  const value = useMemo(() => ({ orders, createOrder, updateOrder, deleteOrder, clearAllOrders, placeOrder: createOrder }), [orders, createOrder, updateOrder, deleteOrder, clearAllOrders])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrderContext() {
  const context = useContext(OrderContext)
  if (context) return context
  return {
    orders: [],
    createOrder: async (payload) => {
      const order = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
      return order
    },
    updateOrder: async (id, changes) => ({ id, ...changes }),
    deleteOrder: async () => {},
    clearAllOrders: async () => {},
    placeOrder: async (payload) => {
      const order = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
      return order
    },
  }
}
