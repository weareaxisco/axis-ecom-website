import { act, renderHook } from '@testing-library/react'
import { CartProvider, useCart } from '../CartContext'

const product = {
  id: 'ring-1',
  name: 'Lumiere Solitaire Ring',
  price: 98000,
  main_image_url: '/ring.jpg',
  material: '18K Gold',
}

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds items and calculates the MAD subtotal', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(product, 2))

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.subtotal).toBe(196000)
    expect(result.current.isBagOpen).toBe(true)
    expect(window.localStorage.getItem('maison_cart_items')).toContain('Lumiere Solitaire Ring')
  })

  it('updates quantities and removes items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(product, 1))
    act(() => result.current.updateQuantity('ring-1', 3))
    expect(result.current.subtotal).toBe(294000)

    act(() => result.current.updateQuantity('ring-1', 0))
    expect(result.current.cartItems[0].quantity).toBe(1)

    act(() => result.current.removeFromCart('ring-1'))
    expect(result.current.cartItems).toEqual([])
    expect(result.current.subtotal).toBe(0)
  })

  it('restores persisted items on mount', () => {
    window.localStorage.setItem('maison_cart_items', JSON.stringify([{ ...product, cartKey: 'ring-1', quantity: 2 }]))
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems[0].name).toBe(product.name)
    expect(result.current.subtotal).toBe(196000)
  })
})
