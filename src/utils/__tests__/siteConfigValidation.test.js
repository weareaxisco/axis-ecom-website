import { describe, expect, it } from 'vitest'
import { validateSiteConfig } from '../siteConfigValidation'

describe('site configuration validation', () => {
  it('accepts a complete secure configuration', () => {
    expect(validateSiteConfig({ site_name: 'Maison', contact_address: 'Casablanca', instagram_url: 'https://instagram.com/maison', map_embed_url: 'https://www.google.com/maps?q=Casablanca&output=embed' })).toEqual([])
  })

  it('reports missing and insecure publishing values', () => {
    expect(validateSiteConfig({ site_name: '', contact_address: '', instagram_url: 'http://example.com' })).toEqual([
      'Website name is required.',
      'Boutique address is required.',
      'Instagram URL must use HTTPS.',
    ])
  })
})
