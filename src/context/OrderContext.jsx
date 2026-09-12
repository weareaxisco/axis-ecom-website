import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const OrderContext = createContext(null)
const localOrdersKey = 'axis-orders'
const readLocalOrders = () => {
  try {
    const value = JSON.parse(window.localStorage.getItem(localOrdersKey) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      const local = readLocalOrders()
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (!active) return
      setOrders(error ? local : [...(data || []), ...local.filter((item) => !(data || []).some((order) => order.id === item.id))])
    }
    load().catch(() => setOrders(readLocalOrders()))
    return () => { active = false }
  }, [])

  const createOrder = useCallback(async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const newOrder = {
      id: payload.id || `local-${Date.now()}`,
      user_id: user?.id,
      customer_name: payload.customer_name || payload.full_name || 'Guest Customer',
      customer_email: payload.customer_email || user?.email || '',
      total_amount: payload.total_amount ?? payload.total_dh ?? 0,
      items: payload.items || [],
      shipping_address: payload.shipping_address || payload.delivery_address || '',
      status: 'Pending Confirmation',
      created_at: new Date().toISOString(),
      subtotal_dh: payload.subtotal_dh,
      shipping_fee_dh: payload.shipping_fee_dh,
      total_dh: payload.total_dh,
      city: payload.city,
      delivery_address: payload.delivery_address,
      shipping_address: payload.shipping_address || payload.delivery_address,
      phone: payload.phone,
      payment_method: payload.payment_method,
      postal_code: payload.postal_code,
    }
    let order = newOrder
    let { data, error } = await supabase.from('orders').insert(newOrder).select().single()
    if (error) {
      const legacyRecord = {
        id: newOrder.id,
        user_id: newOrder.user_id,
        items: newOrder.items,
        subtotal_dh: newOrder.subtotal_dh,
        shipping_fee_dh: newOrder.shipping_fee_dh,
        total_dh: newOrder.total_dh,
        city: newOrder.city,
        delivery_address: newOrder.shipping_address,
        phone: newOrder.phone,
        payment_method: newOrder.payment_method,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        postal_code: newOrder.postal_code,
        status: newOrder.status,
        created_at: newOrder.created_at,
      }
      const retry = await supabase.from('orders').insert(legacyRecord).select().single()
      data = retry.data
      error = retry.error
    }
    if (!error && data) order = { ...newOrder, ...data, customer_name: newOrder.customer_name, customer_email: newOrder.customer_email }
    setOrders((current) => {
      const next = [order, ...current.filter((item) => item.id !== order.id)]
      try {
        window.localStorage.setItem(localOrdersKey, JSON.stringify(next.filter((item) => String(item.id).startsWith('local-'))))
      } catch {
        // Local persistence is optional when browser storage is unavailable.
      }
      return next
    })
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
    window.dispatchEvent(new CustomEvent('order:created', { detail: order }))
    return order
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

  const value = useMemo(() => ({ orders, createOrder, updateOrder, deleteOrder, placeOrder: createOrder }), [orders, createOrder, updateOrder, deleteOrder])
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
    placeOrder: async (payload) => {
      const order = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
      return order
    },
  }
}
