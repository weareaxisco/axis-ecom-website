import { useEffect, useState } from 'react'
import { useSiteConfigSettings } from '../../context/SiteConfigContext'

export default function BrandLogo({ className = '', imgClassName = '', textClassName = '', alt }) {
  const { siteConfig } = useSiteConfigSettings()
  const [imageFailed, setImageFailed] = useState(false)
  const businessName = siteConfig.business_name || siteConfig.site_name || 'Maison de L’Élégance'
  const showImage = siteConfig.logo_type === 'image' && Boolean(siteConfig.logo_image_url?.trim()) && !imageFailed
  useEffect(() => setImageFailed(false), [siteConfig.logo_image_url, siteConfig.logo_type])

  if (showImage) {
    return <img src={siteConfig.logo_image_url} alt={alt || businessName} className={`${className} ${imgClassName}`} onError={() => setImageFailed(true)} />
  }

  return <span className={`${className} ${textClassName}`}>{businessName}</span>
}
