import { useEffect } from 'react'
import { useOptionalSiteConfigSettings } from '../context/SiteConfigContext'

export function useDocumentTitle(pageTitle) {
  const context = useOptionalSiteConfigSettings()
  const businessName = context?.businessName
  useEffect(() => {
    const baseName = businessName || 'Maison de L’Élégance'
    document.title = pageTitle ? `${pageTitle} | ${baseName}` : baseName
  }, [pageTitle, businessName])
}
