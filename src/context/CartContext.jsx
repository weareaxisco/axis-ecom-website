import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getProductPrice } from '../utils/productUtils'
import { trackEvent } from '../utils/analytics'

const CartContext = createContext(null)
const storageKey = 'maison_cart_items'

function readStoredCart() {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readStoredCart)
  const [isBagOpen, setIsBagOpen] = useState(false)

  const updateCart = useCallback((updater) => {
    setCartItems((current) => {
      const next = updater(current)
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }, [])

  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    updateCart((current) => {
      const key = String(product.id)
      const existing = current.find((item) => item.cartKey === key)
      if (existing) return current.map((item) => item.cartKey === key ? { ...item, quantity: item.quantity + quantity } : item)
      return [...current, {
        ...product,
        cartKey: key,
        quantity,
        variant: options.variant || product.variant || product.material || 'Signature selection',
      }]
    })
    if (!options.suppressBagOpen) setIsBagOpen(true)
    trackEvent('add_to_cart', { product_id: product.id, quantity }).catch(() => {})
  }, [updateCart])
  const isInCart = useCallback((id) => cartItems.some((item) => String(item.id) === String(id)), [cartItems])

  const removeFromCart = useCallback((cartKey) => updateCart((current) => current.filter((item) => item.cartKey !== cartKey)), [updateCart])
  const updateQuantity = useCallback((cartKey, quantity) => updateCart((current) => current.map((item) => item.cartKey === cartKey ? { ...item, quantity: Math.max(1, quantity) } : item)), [updateCart])
  const clearCart = useCallback(() => updateCart(() => []), [updateCart])
  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + getProductPrice(item) * item.quantity, 0), [cartItems])
  const hasOnsiteOnly = useMemo(() => cartItems.some((item) => item.onsite_only === true), [cartItems])
  const value = useMemo(() => ({ cartItems, addToCart, isInCart, removeFromCart, updateQuantity, clearCart, isBagOpen, setIsBagOpen, subtotal, hasOnsiteOnly }), [cartItems, addToCart, isInCart, removeFromCart, updateQuantity, clearCart, isBagOpen, subtotal, hasOnsiteOnly])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
