import { isSafeMapEmbedUrl } from './maps'

function isHttpsUrl(value) {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateSiteConfig(config) {
  const errors = []
  if (!config.site_name?.trim()) errors.push('Website name is required.')
  if (!config.contact_address?.trim()) errors.push('Boutique address is required.')
  if (config.instagram_url && !isHttpsUrl(config.instagram_url)) errors.push('Instagram URL must use HTTPS.')
  if (config.tiktok_url && !isHttpsUrl(config.tiktok_url)) errors.push('TikTok URL must use HTTPS.')
  if (config.boutique_image_url && !isHttpsUrl(config.boutique_image_url)) errors.push('Boutique image URL must use HTTPS.')
  if (config.map_embed_url && !isSafeMapEmbedUrl(config.map_embed_url)) errors.push('Map URL must be a secure Google Maps embed URL.')
  return errors
}
