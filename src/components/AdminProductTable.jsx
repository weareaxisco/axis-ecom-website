import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { getProductPrice } from '../utils/productUtils'
import { useLanguage } from '../context/LanguageContext'

const money = (value) => `${Number(value || 0).toLocaleString()} DH`

export default function AdminProductTable({ products, onToggleOnsiteOnly, onAddProduct }) {
  const [savingId, setSavingId] = useState(null)
  const { t } = useLanguage()

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
      <button type="button" onClick={onAddProduct} className="mb-5 bg-amber-500 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-black">+ {t('addNewCreation')}</button>
    <div className="overflow-x-auto border border-neutral-800 bg-neutral-950/70">
      <table className="w-full min-w-[760px] text-left">
        <thead className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          <tr>
            <th className="px-5 py-4">{t('image')}</th>
            <th className="px-5 py-4">{t('name')}</th>
            <th className="px-5 py-4">{t('category')}</th>
            <th className="px-5 py-4">{t('priceDh')}</th>
            <th className="px-5 py-4">{t('inStock')}</th>
            <th className="px-5 py-4">{t('onsiteOnly')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80">
          {products.map((product) => (
            <tr key={product.id} className="text-sm text-neutral-200">
              <td className="px-5 py-4"><img src={product.main_image_url || product.image || product.images?.[0]} alt="" className="h-14 w-12 object-cover" /></td>
              <td className="px-5 py-4 font-serif">{product.name || product.title}</td>
              <td className="px-5 py-4 text-xs text-neutral-400">{product.category_name || product.category || t('uncategorized')}</td>
              <td className="px-5 py-4 text-amber-400">{money(getProductPrice(product))}</td>
              <td className="px-5 py-4 text-xs uppercase tracking-widest">{product.in_stock === false || product.stock === 0 ? t('no') : t('yes')}</td>
              <td className="px-5 py-4">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={Boolean(product.onsite_only)} onChange={() => handleToggle(product)} disabled={savingId === product.id} className="peer sr-only" />
                  <span className="relative h-6 w-11 rounded-full bg-neutral-800 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-disabled:opacity-50 peer-focus:outline-none" />
                  <span className="ml-2 text-xs font-mono uppercase text-neutral-400">{product.onsite_only ? t('pickup') : t('standard')}</span>
                  {savingId === product.id && <LoaderCircle className="ml-2 animate-spin text-amber-400" size={15} />}
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!products.length && <p className="p-10 text-center text-sm text-neutral-500">{t('noProductsFound')}</p>}
    </div>
    </>
  )
}
