import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { useSiteConfig } from '../context/ConfigContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabaseClient'
import { mockProducts } from '../components/ProductCatalog'
import ImageGalleryZoom from '../components/ImageGalleryZoom'
import RingSizeGuideModal from '../components/RingSizeGuideModal'
import SEOHead from '../components/SEOHead'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { getProductPrice } from '../utils/productUtils'
import ProductReviews from '../components/ProductReviews'
import EnquiryModal from '../components/EnquiryModal'

const metals = ['18k Rose Gold', '18k Yellow Gold', '18k White Gold', 'Platinum']

export default function ProductDetail() {
  const { id } = useParams()
  const { config } = useSiteConfig()
  const { addToCart } = useCart()
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [metal, setMetal] = useState(metals[0])
  const [size, setSize] = useState('52')
  const [guideOpen, setGuideOpen] = useState(false)
  const [open, setOpen] = useState('details')
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.from('products').select('*, categories(*), collections(*)').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (!mounted) return
      if (error) console.warn(`Product detail fallback: ${error.message}`)
      setProduct(data || mockProducts.find((item) => String(item.id) === String(id)) || null)
    })
    return () => { mounted = false }
  }, [id])

  const images = useMemo(() => [...new Set([product?.main_image_url, product?.hover_image_url].filter(Boolean))], [product])
  if (!product) return <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-40 text-center text-[var(--text-primary)]">Curating this creation...</main>

  const name = product.name || product.title || 'Maison creation'
  const isWishlisted = wishlistItems.some((item) => String(item.id) === String(product.id))
  const basePrice = getProductPrice(product)
  const price = basePrice + (metal === 'Platinum' ? 25000 : metal === '18k Yellow Gold' ? 5000 : 0)
  const isRing = String(product.category || product.category_name || '').toLowerCase().includes('ring')
  const message = encodeURIComponent(`Bonjour, I would like to inquire about ${name} (Ref: ${product.id}).`)
  const accordion = [
    ['details', 'Creations Details & Carat Weight', product.description || 'A one-of-a-kind creation, crafted in precious materials with exceptional finishing.'],
    ['delivery', 'Complimentary Ameex Delivery & Returns', 'Complimentary delivery across Morocco. Returns and exchanges are arranged through our private jewelry advisors.'],
    ['care', 'Artisan Care & Maison Warranty', 'Your creation includes our Maison warranty and complimentary care guidance from our artisans.'],
  ]

  return (
    <>
      <SEOHead product={product} />
      <main className="min-h-screen bg-[var(--bg-primary)] px-5 pb-24 pt-36 text-[var(--text-primary)] md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link to="/catalog" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-amber-400">← Back to creations</Link>
          <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <ImageGalleryZoom images={images} name={name} />
            <section className="lg:sticky lg:top-28 lg:h-fit">
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">{product.collection_name || product.category_name || 'Fine Jewelry'}</p>
              <h1 className="mt-4 font-serif text-3xl uppercase tracking-widest">{name}</h1>
              <p className="mt-4 text-xs uppercase tracking-wider text-neutral-500">{product.subtitle || product.material || 'Signature Maison creation'}</p>
              <div className="mt-8 flex items-center justify-between"><p className="text-xl">{price.toLocaleString()} DH</p><button type="button" aria-label="Toggle wishlist" onClick={() => isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product)} className={isWishlisted ? 'text-amber-400' : 'text-neutral-400 hover:text-white'}><Heart className={isWishlisted ? 'fill-amber-400' : ''} /></button></div>
              <div className="mt-8 border-t border-neutral-800 pt-6">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400">Metal</p>
                <div className="mt-3 grid grid-cols-2 gap-2">{metals.map((option) => <button type="button" key={option} onClick={() => setMetal(option)} className={`border px-3 py-3 text-left text-xs ${metal === option ? 'border-amber-400 text-amber-300' : 'border-neutral-800 text-neutral-400'}`}>{option}</button>)}</div>
              </div>
              {isRing && <div className="mt-6"><label htmlFor="ring-size" className="text-[10px] uppercase tracking-widest text-neutral-400">Ring Size</label><div className="mt-3 flex gap-2"><select id="ring-size" value={size} onChange={(event) => setSize(event.target.value)} className="flex-1 border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm">{Array.from({ length: 8 }, (_, index) => 48 + index * 2).map((value) => <option key={value} value={value}>EU {value}</option>)}</select><button type="button" onClick={() => setGuideOpen(true)} className="border border-amber-500/50 px-3 text-[10px] uppercase tracking-widest text-amber-300">Find Your Size</button></div></div>}
              {product.onsite_only ? <><p className="mt-8 border border-amber-500/40 p-3 text-center text-[10px] uppercase tracking-widest text-amber-300">Exclusive Boutique Pickup</p><Link to="/concierge" className="mt-3 flex w-full items-center justify-center border border-amber-500 py-4 text-xs uppercase tracking-widest text-amber-300">Book Private Consultation</Link></> : <button type="button" onClick={() => addToCart(product, 1, { variant: `${metal}${isRing ? ` / EU ${size}` : ''}` })} className="mt-8 flex w-full items-center justify-center bg-amber-500 py-4 text-xs font-semibold uppercase tracking-widest text-neutral-950 hover:bg-amber-400">Add to Shopping Bag</button>}
              <button type="button" onClick={() => setEnquiryOpen(true)} className="mt-3 flex w-full items-center justify-center border border-amber-500/50 py-4 text-xs uppercase tracking-widest text-amber-300 hover:border-amber-400">Inquire About Customization</button>
              <a href={`https://wa.me/${config.whatsapp_number}?text=${message}`} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center border border-neutral-700 py-4 text-xs uppercase tracking-widest hover:border-amber-400">Speak With a Jewelry Advisor</a>
              <div className="mt-10 border-y border-neutral-800">{accordion.map(([key, title, content]) => <div key={key} className="border-b border-neutral-800 last:border-0"><button type="button" onClick={() => setOpen(open === key ? null : key)} className="flex w-full items-center justify-between py-5 text-left text-[10px] uppercase tracking-[0.16em]">{title}{open === key ? <Minus size={15} /> : <><Plus size={15} /><ChevronDown size={12} /></>}</button>{open === key && <p className="pb-5 text-sm leading-7 text-neutral-400">{content}</p>}</div>)}</div>
            </section>
          </div>
          <ProductReviews productId={product.id} />
        </div>
      </main>
      {guideOpen && <RingSizeGuideModal onClose={() => setGuideOpen(false)} />}
      {enquiryOpen && <EnquiryModal product={product} onClose={() => setEnquiryOpen(false)} />}
    </>
  )
}
