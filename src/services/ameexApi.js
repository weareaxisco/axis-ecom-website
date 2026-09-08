import { supabase } from '../supabaseClient'

const apiId = import.meta.env.VITE_AMEEX_API_ID
const apiKey = import.meta.env.VITE_AMEEX_API_KEY
const apiUrl = import.meta.env.VITE_AMEEX_API_URL || 'https://api.ameex.app'
export const ameexDispatchEnabled = import.meta.env.VITE_ENABLE_AMEEX_DISPATCH === 'true'

function requireConfig() {
  if (!apiId || !apiKey) throw new Error('Ameex API configuration is incomplete. Set VITE_AMEEX_API_ID and VITE_AMEEX_API_KEY.')
}

function trackingCode(payload) {
  const value = payload?.ParcelCode || payload?.parcel_code || payload?.tracking_code || payload?.trackingCode || payload?.reference || payload?.parcel?.tracking_code || payload?.data?.ParcelCode || payload?.data?.tracking_code || payload?.result?.ParcelCode
  if (!value) throw new Error('Ameex did not return a tracking code.')
  return String(value).startsWith('SBX-') ? String(value) : `SBX-${value}`
}

export async function createSandboxParcel(order) {
  if (!ameexDispatchEnabled) throw new Error('Ameex dispatch is disabled. Set VITE_ENABLE_AMEEX_DISPATCH=true to enable it.')
  requireConfig()
  const item = order.items?.[0] || {}
  const form = new URLSearchParams({
    business: String(apiId),
    type: 'SIMPLE',
    receiver: order.customer_name || order.full_name || order.customer?.name || 'Maison customer',
    phone: order.phone || '',
    city: order.city || '',
    address: order.delivery_address || order.address || '',
    cod: String(Number(order.total_dh ?? order.total ?? 0)),
    comment: `Ref: ${String(order.id).slice(0, 50)}`,
    product: item.name || 'Maison creation',
    order_num: String(order.id).slice(0, 50),
  })
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/customer/Delivery/Parcels/Action/Type/Add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'C-Api-Id': String(apiId), 'C-Api-Key': apiKey },
    body: form,
  })
  if (!response.ok) throw new Error(`Ameex parcel creation failed (${response.status}).`)
  return trackingCode(await response.json())
}

async function verifySignature(rawBody, signature) {
  const secret = import.meta.env.VITE_AMEEX_WEBHOOK_SECRET
  if (!secret || !signature || !window.crypto?.subtle) return false
  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = await window.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expectedHex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  const provided = signature.replace(/^sha256=/, '')
  return provided.toLowerCase() === expectedHex || provided === expectedBase64
}

export async function handleAmeexWebhook({ rawBody, signature }) {
  if (!(await verifySignature(rawBody, signature))) throw new Error('Invalid Ameex webhook signature.')
  const payload = JSON.parse(rawBody)
  const orderId = payload.order_id || payload.reference || payload.parcel?.reference
  const status = payload.status || payload.event
  if (!orderId || !status) throw new Error('Ameex webhook payload is missing order reference or status.')
  const statusMap = {
    pending: 'pending_confirmation',
    confirmed: 'deposit_received',
    in_preparation: 'in_preparation',
    dispatched: 'dispatched_ameex',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }
  const nextStatus = statusMap[String(status).toLowerCase()] || statusMap[String(status).toLowerCase().replace(/\s+/g, '_')]
  if (!nextStatus) throw new Error(`Unsupported Ameex status: ${status}`)
  const tracking = payload.tracking_code || payload.trackingCode || payload.parcel?.tracking_code
  const update = { status: nextStatus }
  if (tracking) update.ameex_tracking_id = tracking
  const { error } = await supabase.from('orders').update(update).eq('id', orderId)
  if (error) throw new Error(`Unable to save Ameex status: ${error.message}`)
  return { orderId, status: nextStatus, trackingCode: tracking || null }
}
