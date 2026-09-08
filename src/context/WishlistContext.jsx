import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const WishlistContext = createContext(null)
const storageKey = 'maison_wishlist_items'

function readWishlist() {
  try { return JSON.parse(window.localStorage.getItem(storageKey) || '[]') } catch { return [] }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(readWishlist)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const update = (next) => { setWishlistItems(next); window.localStorage.setItem(storageKey, JSON.stringify(next)) }
  const addToWishlist = useCallback((product) => {
    if (!wishlistItems.some((item) => String(item.id) === String(product.id))) update([...wishlistItems, product])
  }, [wishlistItems])
  const removeFromWishlist = useCallback((id) => update(wishlistItems.filter((item) => String(item.id) !== String(id))), [wishlistItems])
  const value = useMemo(() => ({ wishlistItems, addToWishlist, removeFromWishlist, isWishlistOpen, setIsWishlistOpen }), [wishlistItems, addToWishlist, removeFromWishlist, isWishlistOpen])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
