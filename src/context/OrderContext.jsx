import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const OrderContext = createContext(null)
const localOrdersKey = 'maison_orders'
const channelName = 'maison_orders_channel'
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}
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
    const orderItems = Array.isArray(payload.items) ? payload.items : []
    const stockItems = orderItems
      .map((item) => ({ id: item.id || item.product_id || item.productId, quantity: Number(item.quantity || 1) }))
      .filter((item) => item.id && Number.isFinite(item.quantity) && item.quantity > 0)
    for (const item of stockItems) {
      try {
        const { data, error } = await supabase.from('products').select('id, stock').eq('id', item.id).maybeSingle()
        if (error) throw error
        if (!data) throw new Error(`Product ${item.id} was not found.`)
        if (!error && data && Number(data.stock) < item.quantity) {
          const stockError = new Error(`Product ${item.id} is out of stock.`)
          stockError.code = 'OUT_OF_STOCK'
          throw stockError
        }
      } catch (error) {
        if (error.code === 'OUT_OF_STOCK') throw error
        console.warn('[orders] stock check unavailable:', error.message)
      }
    }
    const orderId = generateUUID()
    const newOrder = {
      id: orderId,
      user_id: user?.id,
      customer_name: payload.customer_name || payload.full_name || 'Guest Customer',
      customer_email: payload.customer_email || user?.email || '',
      phone: payload.phone || '',
      address: payload.address || payload.shipping_address || payload.delivery_address || '',
      city: payload.city || '',
      items: orderItems,
      subtotal: payload.subtotal ?? payload.subtotal_dh ?? 0,
      total_amount: payload.total_amount ?? payload.total_dh ?? 0,
      status: 'pending_confirmation',
      created_at: new Date().toISOString(),
      subtotal_dh: payload.subtotal_dh ?? payload.subtotal,
      shipping_fee_dh: payload.shipping_fee_dh ?? 0,
      total_dh: payload.total_dh ?? payload.total_amount,
      delivery_address: payload.delivery_address || payload.address,
      payment_method: payload.payment_method || 'card',
      postal_code: payload.postal_code,
    }
    const databaseOrder = {
      id: newOrder.id,
      user_id: newOrder.user_id || null,
      customer_name: newOrder.customer_name,
      customer_email: newOrder.customer_email,
      phone: newOrder.phone,
      delivery_address: newOrder.delivery_address,
      city: newOrder.city,
      postal_code: newOrder.postal_code,
      payment_method: payload.payment_method || 'card',
      items: newOrder.items,
      subtotal_dh: Number(newOrder.subtotal_dh || 0),
      shipping_fee_dh: Number(newOrder.shipping_fee_dh || 0),
      total_dh: Number(newOrder.total_dh || 0),
      status: newOrder.status,
      stock_decremented: false,
      created_at: newOrder.created_at,
    }
    setOrders((current) => {
      const updatedOrders = [newOrder, ...current.filter((item) => item.id !== newOrder.id)]
      try {
        window.localStorage.setItem(localOrdersKey, JSON.stringify(updatedOrders))
        const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null
        channel?.postMessage({ orders: updatedOrders })
        channel?.close()
      } catch (error) {
        console.warn('[orders] local persistence unavailable:', error)
      }
      return updatedOrders
    })
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: newOrder }))
    window.dispatchEvent(new CustomEvent('order:created', { detail: newOrder }))
    try {
      const { error } = await supabase.from('orders').insert([databaseOrder])
      if (error) console.warn('[orders] remote insert rejected; local order retained:', error.message)
      else {
        await Promise.all(stockItems.map(async (item) => {
        const targetId = String(item.id)
        const { error: rpcError } = await supabase.rpc('decrement_product_stock', { p_id: targetId, qty: item.quantity })
        if (rpcError) {
          console.warn('[orders] stock RPC failed; using direct update fallback:', rpcError.message)
          const { data: product, error: stockError } = await supabase.from('products').select('stock').eq('id', targetId).maybeSingle()
          if (stockError) throw stockError
          if (!product) return
          const newStock = Math.max(0, Number(product.stock) - item.quantity)
          const { error: updateError } = await supabase.from('products').update({ stock: newStock }).eq('id', targetId)
          if (updateError) throw updateError
        }
        window.dispatchEvent(new CustomEvent('inventory_updated', { detail: { productId: targetId } }))
        }))
        await supabase.from('orders').update({ stock_decremented: true }).eq('id', databaseOrder.id)
      }
    } catch (error) {
      console.warn('[orders] remote insert unavailable; local order retained:', error)
    }
    return newOrder
  }, [])

  const updateOrder = useCallback(async (id, changes) => {
    const updatePayload = {
      customer_name: changes.customer_name,
      phone: changes.phone,
      delivery_address: changes.delivery_address,
      city: changes.city,
      status: changes.status,
    }
    const { data, error } = await supabase.from('orders').update(updatePayload).eq('id', id).select().single()
    const updated = data || { id, ...updatePayload }
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
      const order = { ...payload, id: generateUUID(), created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
      return order
    },
    updateOrder: async (id, changes) => ({ id, ...changes }),
    deleteOrder: async () => {},
    clearAllOrders: async () => {},
    placeOrder: async (payload) => {
      const order = { ...payload, id: generateUUID(), created_at: new Date().toISOString(), status: 'pending_confirmation' }
      window.dispatchEvent(new CustomEvent('orders_updated', { detail: order }))
      return order
    },
  }
}
