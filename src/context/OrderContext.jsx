import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([])

  const placeOrder = useCallback(async (payload) => {
    const { data: { user } } = await supabase.auth.getUser()
    const record = {
      user_id: user?.id,
      items: payload.items,
      subtotal_dh: payload.subtotal_dh,
      shipping_fee_dh: payload.shipping_fee_dh,
      total_dh: payload.total_dh,
      city: payload.city,
      delivery_address: payload.delivery_address,
      phone: payload.phone,
      payment_method: payload.payment_method,
    }
    let order = { ...record, id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending_confirmation' }
    if (user?.id) {
      const { data, error } = await supabase.from('orders').insert(record).select().single()
      if (error) throw error
      order = data
    }
    setOrders((current) => [order, ...current])
    window.dispatchEvent(new CustomEvent('order:created', { detail: order }))
    return order
  }, [])

  const value = useMemo(() => ({ orders, placeOrder }), [orders, placeOrder])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrderContext() {
  const context = useContext(OrderContext)
  if (context) return context
  return {
    orders: [],
    placeOrder: async (payload) => {
      const order = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('order:created', { detail: order }))
      return order
    },
  }
}
