import { X } from 'lucide-react'
import { useState } from 'react'
import ProductCard from './ProductCard'

const previewId = 'admin-preview'

export default function AdminProductPreview({ product }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const images = Array.isArray(product.images) ? product.images : []
  const previewProduct = {
    ...product,
    id: product.id || previewId,
    name: product.name || 'Untitled Creation',
    main_image_url: images[0] || '',
    hover_image_url: images[1] || '',
    category_name: product.category || '',
    collection_name: product.collection || '',
  }
  return <div className="sticky top-8 border border-neutral-800 bg-neutral-950/70 p-6">
    <p className="mb-5 text-[10px] uppercase tracking-widest text-amber-400">Live Preview</p>
    <div className="block w-full text-left" onClick={() => setDetailOpen(true)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDetailOpen(true) } }} aria-label="Open storefront product preview">
      <ProductCard product={previewProduct} onProductClick={() => setDetailOpen(true)} />
    </div>
    {detailOpen && <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950/95 p-4 md:p-10" role="dialog" aria-modal="true" aria-label="Storefront product preview">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => setDetailOpen(false)} className="ml-auto flex items-center gap-2 border border-neutral-700 px-4 py-2 text-[10px] uppercase tracking-widest text-neutral-300"><X size={15} /> Close Preview</button>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>{images[0] ? <img src={images[0]} alt={previewProduct.name} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-neutral-900 text-xs uppercase tracking-widest text-neutral-600">Add an image</div>}</div>
          <section className="lg:pt-8"><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">{previewProduct.collection_name || previewProduct.category_name || 'Fine Jewelry'}</p><h2 className="mt-4 font-serif text-3xl uppercase tracking-widest">{previewProduct.name}</h2><p className="mt-5 text-xl">{Number(previewProduct.price_dh || 0).toLocaleString()} DH</p><p className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500">{Number(previewProduct.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}</p><p className="mt-8 text-sm leading-7 text-neutral-400">{previewProduct.description || 'Your product description will appear here.'}</p><div className="mt-8 space-y-2 border-y border-neutral-800 py-5">{Object.entries(previewProduct.specifications || {}).map(([key, value]) => <p key={key} className="flex justify-between gap-4 text-xs"><span className="text-neutral-500">{key}</span><span>{value}</span></p>)}</div></section>
        </div>
      </div>
    </div>}
  </div>
}
