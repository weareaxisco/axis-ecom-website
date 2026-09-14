import { useEffect } from 'react'
import { useSiteConfigSettings } from '../context/SiteConfigContext'

export function useDocumentTitle(pageTitle) {
  const { businessName } = useSiteConfigSettings()
  useEffect(() => {
    const baseName = businessName || 'Maison de L’Élégance'
    document.title = pageTitle ? `${pageTitle} | ${baseName}` : baseName
  }, [pageTitle, businessName])
}
