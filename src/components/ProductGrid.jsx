import { Grid2X2, Grid3X3 } from 'lucide-react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, view, onViewChange }) {
  return <div><div className="mb-5 flex items-center justify-end gap-1"><button type="button" aria-label="Two-column editorial view" onClick={() => onViewChange('editorial')} className={`p-2 ${view === 'editorial' ? 'text-amber-400' : 'text-neutral-500'}`}><Grid2X2 size={17} /></button><button type="button" aria-label="Four-column standard view" onClick={() => onViewChange('standard')} className={`p-2 ${view === 'standard' ? 'text-amber-400' : 'text-neutral-500'}`}><Grid3X3 size={17} /></button></div><div className={`grid gap-5 ${view === 'editorial' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>{!products.length && <div className="border border-neutral-800 py-20 text-center text-sm text-neutral-500">No creations match these filters.</div>}</div>
}
