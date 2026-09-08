import { useState } from 'react'
import { Check, LoaderCircle } from 'lucide-react'

const money = (value) => `${Number(value || 0).toLocaleString()} DH`

export default function AdminProductTable({ products, onToggleOnsiteOnly, onAddProduct }) {
  const [savingId, setSavingId] = useState(null)

  const handleToggle = async (product) => {
    setSavingId(product.id)
    try {
      await onToggleOnsiteOnly(product.id, !product.onsite_only)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <button type="button" onClick={onAddProduct} className="mb-5 bg-amber-500 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-black">+ Add New Creation</button>
    <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70">
      <table className="w-full min-w-[760px] text-left">
        <thead className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          <tr>
            <th className="px-5 py-4">Image</th>
            <th className="px-5 py-4">Name</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Price (DH)</th>
            <th className="px-5 py-4">In Stock</th>
            <th className="px-5 py-4">Onsite Only</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80">
          {products.map((product) => (
            <tr key={product.id} className="text-sm text-neutral-200">
              <td className="px-5 py-4"><img src={product.main_image_url || product.image || product.images?.[0]} alt="" className="h-14 w-12 object-cover" /></td>
              <td className="px-5 py-4 font-serif">{product.name || product.title}</td>
              <td className="px-5 py-4 text-xs text-neutral-400">{product.category_name || product.category || 'Uncategorized'}</td>
              <td className="px-5 py-4 text-amber-400">{money(product.price ?? product.price_dh)}</td>
              <td className="px-5 py-4 text-xs uppercase tracking-widest">{product.in_stock === false || product.stock === 0 ? 'No' : 'Yes'}</td>
              <td className="px-5 py-4">
                <button type="button" role="switch" aria-checked={Boolean(product.onsite_only)} aria-label={`Onsite only for ${product.name}`} disabled={savingId === product.id} onClick={() => handleToggle(product)} className={`relative h-6 w-11 rounded-full transition-colors ${product.onsite_only ? 'bg-amber-500' : 'bg-neutral-700'} disabled:opacity-50`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${product.onsite_only ? 'translate-x-6' : 'translate-x-1'}`} />
                  {savingId === product.id && <LoaderCircle className="absolute -right-6 top-1 animate-spin text-amber-400" size={15} />}
                </button>
                {product.onsite_only && <span className="ml-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-amber-400"><Check size={12} /> Pickup</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!products.length && <p className="p-10 text-center text-sm text-neutral-500">No products found.</p>}
    </div>
    </>
  )
}
