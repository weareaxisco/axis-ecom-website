import { useLayoutEffect, useRef } from 'react'
import { Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useLanguage } from '../context/LanguageContext'
import { getProductPrice } from '../utils/productUtils'

export default function WishlistDrawer() {
  const drawerRef = useRef(null)
  const { addToCart, isInCart } = useCart()
  const { wishlistItems, removeFromWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist()
  const { t } = useLanguage()
  useLayoutEffect(() => {
    if (!isWishlistOpen && drawerRef.current?.contains(document.activeElement)) document.activeElement.blur()
  }, [isWishlistOpen])
  const addWishlistItem = (item) => {
    if (isInCart(item.id)) return
    addToCart({ ...item, price: getProductPrice(item) }, 1, { suppressBagOpen: true })
  }

  return <div ref={drawerRef} inert={!isWishlistOpen} className={`fixed inset-0 z-[100] h-full w-full bg-neutral-950 transition-opacity ${isWishlistOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isWishlistOpen}>
    <button type="button" aria-label={t('closeOverlay')} onClick={() => setIsWishlistOpen(false)} className="absolute inset-0 bg-black/70" />
    <aside className={`absolute inset-y-0 right-0 flex h-full w-full flex-col bg-neutral-950 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-white shadow-2xl transition-transform sm:w-[400px] ${isWishlistOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 pb-5">
        <h2 className="font-serif text-2xl uppercase tracking-widest">{t('wishlistTitle')}</h2>
        <button type="button" aria-label={t('closeOverlay')} onClick={() => setIsWishlistOpen(false)} className="flex min-h-11 min-w-11 items-center justify-center"><X strokeWidth={1.5} /></button>
      </header>
      <div className="mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto">
        {wishlistItems.length ? wishlistItems.map((item) => {
          const image = item.main_image_url || item.image || item.images?.[0]
          const price = getProductPrice(item)
          const isAdded = isInCart(item.id)
          return <article key={item.id} className="relative flex gap-4 border-b border-neutral-800 pb-5">
            <Link to={`/product/${item.id}`} onClick={() => setIsWishlistOpen(false)} className="shrink-0"><img src={image} alt={item.name} className="h-24 w-20 object-cover transition-opacity hover:opacity-80" /></Link>
            <div className="min-w-0 flex-1 pr-8">
              <button type="button" aria-label={`${t('remove')} ${item.name}`} onClick={() => removeFromWishlist(item.id)} className="absolute right-0 top-0 flex min-h-11 min-w-11 items-center justify-center text-neutral-500 transition-colors hover:text-rose-300"><Trash2 size={16} strokeWidth={1.5} /></button>
              <Link to={`/product/${item.id}`} onClick={() => setIsWishlistOpen(false)} className="font-serif hover:text-amber-300">{item.name}</Link>
              <p className="mt-2 text-sm text-amber-400">{price.toLocaleString()} DH</p>
              <button type="button" onClick={() => addWishlistItem(item)} disabled={isAdded} className={`mt-4 min-h-11 w-full px-4 py-2 text-center text-xs uppercase tracking-wider transition-colors ${isAdded ? 'cursor-default border border-neutral-800 bg-neutral-900 text-neutral-400' : 'bg-amber-400 font-semibold text-black hover:bg-amber-300'}`}>
                {isAdded ? t('alreadyInBag') : t('addToBagShort')}
              </button>
            </div>
          </article>
        }) : <p className="py-16 text-center text-sm text-neutral-500">{t('wishlistEmpty')}</p>}
      </div>
    </aside>
  </div>
}
