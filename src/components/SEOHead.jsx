import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

const defaultDescription = {
  fr: 'Maison de l’Élégance — Haute Joaillerie et Horlogerie à Casablanca.',
  en: 'Maison de l’Élégance — High Jewelry and Timepieces from Casablanca.',
}

function setMeta(attribute, value, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${value}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, value)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export default function SEOHead({ product = null, title, noindex = false }) {
  const { language } = useLanguage()
  useEffect(() => {
    const name = product?.name || 'Maison de l’Élégance'
    const pageTitle = title || (product ? `${name} | Maison de l’Élégance` : 'Maison de l’Élégance | Haute Joaillerie')
    const description = product?.description || defaultDescription[language]
    document.title = pageTitle
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow')
    setMeta('property', 'og:title', pageTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', product ? 'product' : 'website')
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = window.location.href.split('#')[0]
    if (product?.main_image_url) setMeta('property', 'og:image', product.main_image_url)
    const existing = document.head.querySelector('script[data-maison-jsonld]')
    existing?.remove()
    const schema = product ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image: [product.main_image_url, product.hover_image_url].filter(Boolean),
      brand: { '@type': 'Brand', name: 'Maison de l’Élégance' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'MAD',
        price: Number(product.price || 0),
        availability: product.in_stock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        url: window.location.href,
      },
    } : { '@context': 'https://schema.org', '@type': 'Organization', name: 'Maison de l’Élégance' }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.maisonJsonld = 'true'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => script.remove()
  }, [language, noindex, product, title])
  return null
}
