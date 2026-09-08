import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const WishlistContext = createContext(null)
const storageKey = 'maison_wishlist_items'

function readWishlist() {
  try { return JSON.parse(window.localStorage.getItem(storageKey) || '[]') } catch { return [] }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(readWishlist)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const update = useCallback((updater) => {
    setWishlistItems((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }, [])
  const addToWishlist = useCallback((product) => {
    update((current) => current.some((item) => String(item.id) === String(product.id)) ? current : [...current, product])
  }, [update])
  const removeFromWishlist = useCallback((id) => update((current) => current.filter((item) => String(item.id) !== String(id))), [update])
  const toggleWishlist = useCallback((product) => {
    update((current) => current.some((item) => String(item.id) === String(product.id))
      ? current.filter((item) => String(item.id) !== String(product.id))
      : [...current, product])
  }, [update])
  const isInWishlist = useCallback((id) => wishlistItems.some((item) => String(item.id) === String(id)), [wishlistItems])
  const clearWishlist = useCallback(() => update([]), [update])
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('wishlist').eq('id', user.id).maybeSingle().then(({ data, error }) => {
        if (error) console.warn(`Wishlist sync unavailable: ${error.message}`)
        if (data?.wishlist?.length) update(data.wishlist)
      })
    })
  }, [update])
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('profiles').update({ wishlist: wishlistItems }).eq('id', user.id).then(({ error }) => {
        if (error && !error.message.includes('wishlist')) console.warn(`Wishlist sync failed: ${error.message}`)
      })
    })
  }, [wishlistItems])
  const value = useMemo(() => ({ wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist, isWishlistOpen, setIsWishlistOpen }), [wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist, isWishlistOpen])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
