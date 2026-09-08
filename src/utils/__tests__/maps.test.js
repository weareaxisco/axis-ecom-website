import { describe, expect, it } from 'vitest'
import { getSafeMapEmbedUrl, isSafeMapEmbedUrl } from '../maps'

describe('Google Maps embed boundary', () => {
  it('accepts secure Google Maps embed URLs only', () => {
    const url = 'https://www.google.com/maps?q=Casablanca%20Morocco&output=embed'
    expect(isSafeMapEmbedUrl(url)).toBe(true)
    expect(getSafeMapEmbedUrl(url)).toBe(url)
  })

  it('rejects non-Maps hosts and malformed URLs without exposing them', () => {
    expect(isSafeMapEmbedUrl('https://example.com/maps?q=secret')).toBe(false)
    expect(getSafeMapEmbedUrl('javascript:alert(1)')).toContain('google.com/maps')
  })
})
