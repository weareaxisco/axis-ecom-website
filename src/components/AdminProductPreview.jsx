import { useState } from 'react'
import ProductCard from './ProductCard'
import ProductDetail from '../pages/ProductDetail'

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
    {detailOpen && <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950/95" role="dialog" aria-modal="true" aria-label="Storefront product preview"><ProductDetail previewProduct={previewProduct} isPreview onClose={() => setDetailOpen(false)} /></div>}
  </div>
}
