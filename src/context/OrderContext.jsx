import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const OrderContext = createContext(null)
const localOrdersKey = 'axis-orders'

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      const local = JSON.parse(window.localStorage.getItem(localOrdersKey) || '[]')
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (!active) return
      setOrders(error ? local : [...(data || []), ...local.filter((item) => !(data || []).some((order) => order.id === item.id))])
    }
    load().catch(() => setOrders(JSON.parse(window.localStorage.getItem(localOrdersKey) || '[]')))
    return () => { active = false }
  }, [])

  const createOrder = useCallback(async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const record = {
      id: payload.id,
      user_id: user?.id,
      items: payload.items,
      subtotal_dh: payload.subtotal_dh,
      shipping_fee_dh: payload.shipping_fee_dh,
      total_dh: payload.total_dh,
      city: payload.city,
      delivery_address: payload.delivery_address,
      shipping_address: payload.shipping_address || payload.delivery_address,
      phone: payload.phone,
      payment_method: payload.payment_method,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      postal_code: payload.postal_code,
    }
    let order = { ...record, id: record.id || `local-${Date.now()}`, total_amount: payload.total_amount ?? payload.total_dh, created_at: new Date().toISOString(), status: 'pending_confirmation' }
    if (user?.id) {
      const { data, error } = await supabase.from('orders').insert(record).select().single()
      if (!error && data) order = { ...data, customer_name: payload.customer_name, customer_email: payload.customer_email, postal_code: payload.postal_code }
    }
    setOrders((current) => {
      const next = [order, ...current.filter((item) => item.id !== order.id)]
      window.localStorage.setItem(localOrdersKey, JSON.stringify(next.filter((item) => String(item.id).startsWith('local-'))))
      return next
    })
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
    window.dispatchEvent(new CustomEvent('order:created', { detail: order }))
    return order
  }, [])

  const value = useMemo(() => ({ orders, createOrder, placeOrder: createOrder }), [orders, createOrder])
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
    placeOrder: async (payload) => {
      const order = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
      return order
    },
  }
}
