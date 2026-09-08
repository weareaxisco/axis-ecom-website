const allowedHosts = new Set(['www.google.com', 'google.com', 'maps.google.com'])

export function getSafeMapEmbedUrl(value) {
  const fallback = 'https://www.google.com/maps?q=Casablanca%20Morocco&output=embed'
  if (!value) return fallback
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname) || !url.pathname.startsWith('/maps')) return fallback
    return url.toString()
  } catch {
    return fallback
  }
}

export function isSafeMapEmbedUrl(value) {
  return getSafeMapEmbedUrl(value) === value
}
