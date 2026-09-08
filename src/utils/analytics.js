let loadedId = ''
const visitorKey = 'maison_analytics_visitor'

function getVisitorId() {
  let visitorId = window.localStorage.getItem(visitorKey)
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    window.localStorage.setItem(visitorKey, visitorId)
  }
  return visitorId
}

export async function trackEvent(name, metadata = {}) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return
  const event = { event_name: name, visitor_id: getVisitorId(), metadata }
  if (window.gtag) window.gtag('event', name, metadata)
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(event),
  })
  if (!response.ok) throw new Error(`Analytics event failed: ${response.status}`)
}
export function loadAnalytics(measurementId) {
  if (!measurementId || loadedId === measurementId) return
  loadedId = measurementId
  window.dataLayer = window.dataLayer || []
  window.gtag = (...args) => window.dataLayer.push(args)
  window.gtag('js', new Date())
  window.gtag('config', measurementId)
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)
}
