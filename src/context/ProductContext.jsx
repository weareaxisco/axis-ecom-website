import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockProducts } from '../components/ProductCatalog'
import { supabase } from '../supabaseClient'

const ProductContext = createContext(null)
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
const categoryName = (item) => item.name_en || item.name_fr || item.name || item.title
const collectionName = (item) => item.name || item.title

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(mockProducts)
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [customTags, setCustomTags] = useState([])

  const refresh = async () => {
    const [productResult, categoryResult, collectionResult] = await Promise.all([
      supabase.from('products').select('*, categories(*), collections(*)'),
      supabase.from('categories').select('*'),
      supabase.from('collections').select('*'),
    ])
    if (productResult.data?.length) setProducts(productResult.data)
    if (!productResult.error) {
      setCategories((categoryResult.data || []).map(categoryName).filter(Boolean))
      setCollections((collectionResult.data || []).map(collectionName).filter(Boolean))
    }
  }
  useEffect(() => {
    refresh().catch((error) => console.warn(`Product catalog fallback: ${error.message}`))
    const handleChange = () => refresh().catch((error) => console.warn(`Taxonomy refresh failed: ${error.message}`))
    window.addEventListener('taxonomy:changed', handleChange)
    return () => window.removeEventListener('taxonomy:changed', handleChange)
  }, [])

  const taxonomies = useMemo(() => {
    const categoryValues = new Set(categories)
    const collectionValues = new Set(collections)
    const tagValues = new Set(customTags)
    products.forEach((product) => {
      const category = product.category_name || product.category?.name || product.category
      const collection = product.collection_name || product.collection?.name || product.collection
      if (category) categoryValues.add(category)
      if (collection) collectionValues.add(collection)
      const tags = Array.isArray(product.tags) ? product.tags : product.metadata?.tags || []
      tags.forEach((tag) => tagValues.add(tag))
    })
    return { categories: [...categoryValues].sort(), collections: [...collectionValues].sort(), tags: [...tagValues].sort() }
  }, [categories, collections, customTags, products])

  const addTaxonomy = async (type, name) => {
    const value = name.trim()
    if (!value) return
    if (type === 'tag') {
      setCustomTags((current) => [...new Set([...current, value])])
      return
    }
    const table = type === 'category' ? 'categories' : 'collections'
    const payload = type === 'category' ? { name: value, name_fr: value, name_en: value, slug: slugify(value) } : { name: value, slug: slugify(value) }
    const { error } = await supabase.from(table).insert(payload)
    if (error) throw error
    await refresh()
    window.dispatchEvent(new CustomEvent('taxonomy:changed'))
  }

  const deleteTaxonomy = async (type, value) => {
    if (type === 'tag') {
      const updates = products.filter((product) => (Array.isArray(product.tags) ? product.tags : product.metadata?.tags || []).includes(value)).map((product) => supabase.from('products').update({ metadata: { ...(product.metadata || {}), tags: (product.metadata?.tags || product.tags || []).filter((tag) => tag !== value) } }).eq('id', product.id))
      const results = await Promise.all(updates)
      const failed = results.find((result) => result.error)?.error
      if (failed) throw failed
      setCustomTags((current) => current.filter((tag) => tag !== value))
      setProducts((current) => current.map((product) => ({ ...product, metadata: { ...(product.metadata || {}), tags: (product.metadata?.tags || product.tags || []).filter((tag) => tag !== value) } })))
      return
    }
    const table = type === 'category' ? 'categories' : 'collections'
    const records = await supabase.from(table).select('id, name, name_en, name_fr, title')
    const record = (records.data || []).find((item) => (type === 'category' ? categoryName(item) : collectionName(item)) === value)
    if (record) {
      const { error } = await supabase.from(table).delete().eq('id', record.id)
      if (error) throw error
    }
    await refresh()
    window.dispatchEvent(new CustomEvent('taxonomy:changed'))
  }

  return <ProductContext.Provider value={{ products, setProducts, taxonomies, addTaxonomy, deleteTaxonomy, refresh }}>{children}</ProductContext.Provider>
}

export function useProductContext() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProductContext must be used within ProductProvider')
  return context
}
