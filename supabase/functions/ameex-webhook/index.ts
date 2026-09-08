import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const statusMap: Record<string, string> = {
  pending: 'pending_confirmation',
  confirmed: 'deposit_received',
  in_preparation: 'in_preparation',
  dispatched: 'dispatched_ameex',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

async function validSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const encoded = signature.replace(/^sha256=/, '')
  const bytes = /^[0-9a-f]{64}$/i.test(encoded)
    ? new Uint8Array(encoded.match(/.{2}/g)!.map((pair) => parseInt(pair, 16)))
    : Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0))
  return crypto.subtle.verify('HMAC', key, bytes, new TextEncoder().encode(body))
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const body = await request.text()
  const secret = Deno.env.get('AMEEX_WEBHOOK_SECRET') || Deno.env.get('VITE_AMEEX_WEBHOOK_SECRET')
  if (!secret || !(await validSignature(body, request.headers.get('X-Ameex-Signature'), secret))) {
    return new Response('Invalid signature', { status: 401 })
  }
  const payload = JSON.parse(body)
  const orderId = payload.order_id || payload.reference || payload.parcel?.reference
  const rawStatus = String(payload.status || payload.event || '').toLowerCase().replace(/\s+/g, '_')
  const status = statusMap[rawStatus]
  if (!orderId || !status) return new Response('Invalid webhook payload', { status: 400 })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const update: Record<string, string> = { status }
  const tracking = payload.ParcelCode || payload.tracking_code || payload.trackingCode || payload.parcel?.tracking_code
  if (tracking) update.ameex_tracking_id = String(tracking).startsWith('SBX-') ? tracking : `SBX-${tracking}`
  const { error } = await supabase.from('orders').update(update).eq('id', orderId)
  if (error) return new Response(error.message, { status: 500 })
  return Response.json({ ok: true, orderId, status })
})
