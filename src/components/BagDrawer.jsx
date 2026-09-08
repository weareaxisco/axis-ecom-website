import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const money = (value) => `${Number(value || 0).toLocaleString()} MAD`

export default function BagDrawer() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, isBagOpen, setIsBagOpen, subtotal, hasOnsiteOnly } = useCart()

  return (
    <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isBagOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isBagOpen}>
      <button type="button" aria-label="Close shopping bag" onClick={() => setIsBagOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <aside className={`absolute inset-y-0 right-0 flex w-full max-w-md transform flex-col border-l border-neutral-800 bg-neutral-950 text-white shadow-2xl transition-transform duration-300 ${isBagOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="flex items-center justify-between border-b border-neutral-800 p-6">
          <div><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">Maison de l'Élégance</p><h2 className="mt-2 font-serif text-2xl uppercase tracking-widest">Your Bag</h2></div>
          <button type="button" aria-label="Close shopping bag" onClick={() => setIsBagOpen(false)} className="text-neutral-400 hover:text-amber-400"><X size={20} /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? <div className="py-20 text-center"><p className="font-serif text-xl">Your bag is empty</p><p className="mt-3 text-xs text-neutral-500">Discover a considered creation from the Maison.</p></div> : <div className="space-y-6">{cartItems.map((item) => <article key={item.cartKey} className="flex gap-4 border-b border-neutral-800 pb-6"><img src={item.main_image_url || item.image} alt={item.name} className="h-24 w-20 object-cover" /><div className="min-w-0 flex-1"><h3 className="font-serif text-sm">{item.name}</h3><p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{item.variant}</p><p className="mt-3 text-sm text-amber-400">{money(item.price)}</p><div className="mt-3 flex items-center justify-between"><div className="flex items-center border border-neutral-700"><button type="button" onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} className="p-1.5"><Minus size={13} /></button><span className="px-3 text-xs">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} className="p-1.5"><Plus size={13} /></button></div><button type="button" onClick={() => removeFromCart(item.cartKey)} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-neutral-500 hover:text-rose-300"><Trash2 size={13} /> Remove</button></div></div></article>)}</div>}
        </div>
        <footer className="border-t border-neutral-800 p-6">
          <div className="flex justify-between text-sm uppercase tracking-widest"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {hasOnsiteOnly ? <p className="mt-3 border border-amber-500/40 bg-amber-500/5 p-3 text-xs leading-5 text-amber-300">This exclusive creation requires private boutique pickup at our Flagship Store.</p> : <p className="mt-3 text-xs text-amber-400">Ameex delivery across Morocco</p>}
          <button type="button" disabled={!cartItems.length} onClick={() => { setIsBagOpen(false); navigate('/checkout') }} className="mt-6 w-full bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40">Proceed to Checkout</button>
          <button type="button" onClick={() => setIsBagOpen(false)} className="mt-3 w-full border border-neutral-700 py-3 text-[10px] uppercase tracking-widest hover:border-amber-400">Continue Shopping</button>
        </footer>
      </aside>
    </div>
  )
}
