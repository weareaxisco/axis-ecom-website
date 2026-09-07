import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSiteConfig } from '../context/ConfigContext'
import { supabase } from '../supabaseClient'
import ProductCard from './ProductCard'
import { mockProducts } from './ProductCatalog'

const imageFallback =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000'

function imageError(event) {
  if (event.currentTarget.src !== imageFallback) event.currentTarget.src = imageFallback
}

function relatedName(value) {
  return typeof value === 'string' ? value : value?.name || ''
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { config } = useSiteConfig()
  const [product, setProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [openSection, setOpenSection] = useState('description')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), collections(*)')
        .eq('id', id)
        .maybeSingle()
      if (!mounted) return
      if (error) console.warn(`Supabase product detail fallback: ${error.message}`)
      setProduct(data || mockProducts.find((item) => String(item.id) === String(id)) || null)
      setLoading(false)
    }
    loadProduct()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    let mounted = true
    async function loadRecommendations() {
      const { data } = await supabase.from('products').select('*, categories(*), collections(*)').limit(8)
      if (mounted) setProducts(data?.length ? data : mockProducts)
    }
    loadRecommendations()
    return () => { mounted = false }
  }, [])

  const gallery = useMemo(
    () => [...new Set([product?.main_image_url, product?.hover_image_url].filter(Boolean))],
    [product],
  )
  const recommendations = products.filter((item) => String(item.id) !== String(id)).slice(0, 4)

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] px-6 py-32 text-center text-[var(--text-primary)]">Curating your selection...</div>
  if (!product) return <div className="min-h-screen bg-[var(--bg-primary)] px-6 py-32 text-center text-[var(--text-primary)]"><p className="font-serif text-2xl">Creation not found</p><Link to="/" className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">Return to collection</Link></div>

  const name = product.name || product.title || 'Untitled creation'
  const category = relatedName(product.category) || relatedName(product.categories) || product.category_name || 'Fine Jewelry'
  const collection = relatedName(product.collection) || relatedName(product.collections) || product.collection_name || category
  const price = Number(product.price)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-5 py-12 text-[var(--text-primary)] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <button type="button" onClick={() => navigate(-1)} className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 hover:text-[var(--accent-gold)]"><ArrowLeft size={15} strokeWidth={1.25} /> Back</button>
        <p className="mb-8 text-[10px] uppercase tracking-[0.25em] opacity-60">{category} — {collection}</p>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {(gallery.length ? gallery : [imageFallback]).map((image, index) => (
              <div key={`${image}-${index}`} className="aspect-[4/5] overflow-hidden bg-[var(--surface-primary)]">
                <img src={image} alt={index === 0 ? name : ''} onError={imageError} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">{collection}</p>
            <h1 className="mt-4 font-serif text-3xl tracking-wide md:text-5xl">{name}</h1>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] opacity-65">{product.subtitle || product.material || category}</p>
            <p className="mt-8 text-sm tracking-[0.15em] text-[var(--accent-gold)]">{Number.isFinite(price) ? `${price.toLocaleString()} ${config.currency_symbol || 'MAD'}` : 'Price on request'}</p>
            <a href={`https://wa.me/${config.whatsapp_number}?text=${encodeURIComponent(`Greetings, I would like to inquire about the ${name} listed on ${config.store_name}.`)}`} target="_blank" rel="noreferrer" className="mt-10 flex items-center justify-center border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-6 py-4 text-xs uppercase tracking-[0.2em] text-[var(--bg-primary)] hover:opacity-85">Contact Us / Boutique Appointment</a>
            <div className="mt-12 border-y border-[var(--border-subtle)]">
              {[
                ['description', 'Description', product.description || `A considered expression from ${config.store_name}.`],
                ['specifications', 'Specifications', `Material: ${product.material || 'Precious metal'} · Origin: ${product.origin || config.location_city}`],
              ].map(([key, label, content]) => (
                <div key={key} className="border-b border-[var(--border-subtle)] last:border-0">
                  <button type="button" onClick={() => setOpenSection(openSection === key ? null : key)} className="flex w-full items-center justify-between py-5 text-left text-[10px] uppercase tracking-[0.2em]">{label}{openSection === key ? <Minus size={15} strokeWidth={1.25} /> : <Plus size={15} strokeWidth={1.25} />}</button>
                  {openSection === key && <p className="pb-5 text-sm leading-7 opacity-70">{content}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <section className="mt-28">
          <h2 className="mb-8 text-center font-serif text-xl uppercase tracking-widest text-[var(--text-primary)] md:mb-12 md:text-2xl">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      </div>
    </main>
  )
}
