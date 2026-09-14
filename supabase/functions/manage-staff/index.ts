import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const jsonError = (message: string, status: number) => Response.json({ error: message }, { status, headers: corsHeaders })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { status: 200, headers: corsHeaders })
  if (request.method !== 'POST') return jsonError('Method Not Allowed', 405)
  const authorization = request.headers.get('Authorization')
  if (!authorization) return jsonError('Unauthorized', 401)
  const url = Deno.env.get('SUPABASE_URL')!
  const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
  const { data: { user: caller } } = await anon.auth.getUser()
  const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!caller) return jsonError('Unauthorized', 401)
  const { data: callerProfile } = await service.from('profiles').select('role').eq('id', caller.id).single()
  const callerRole = String(callerProfile?.role || '').toLowerCase().replace(/[-\s]/g, '_')
  if (!['super_admin', 'admin'].includes(callerRole)) return jsonError(`Forbidden: role "${callerProfile?.role || 'missing'}" cannot manage staff.`, 403)
  const body = await request.json()
  if (!['create', 'update', 'delete'].includes(body.action)) return jsonError('Invalid staff payload.', 400)
  if (body.action === 'create') {
    if (!body.email || !body.password || !['admin', 'staff_catalog', 'staff_orders'].includes(body.role)) return jsonError('Invalid staff payload: email, password, and a valid role are required.', 400)
    const { data, error } = await service.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true })
    if (error || !data.user) return jsonError(error?.message || 'Unable to create staff user.', 400)
    const { error: profileError } = await service.from('profiles').upsert(
      { id: data.user.id, full_name: body.full_name || body.email, email: body.email, role: body.role, permissions: body.permissions || {} },
      { onConflict: 'id' },
    )
    if (profileError) {
      await service.auth.admin.deleteUser(data.user.id)
      return jsonError(profileError.message, 400)
    }
    return Response.json({ id: data.user.id }, { headers: corsHeaders })
  }
  if (!body.id) return jsonError('Invalid staff payload: staff id is required.', 400)
  if (body.action === 'delete') {
    const { error } = await service.auth.admin.deleteUser(body.id)
    if (error) return jsonError(error.message, 400)
    return Response.json({ id: body.id }, { headers: corsHeaders })
  }
  const { error: authError } = await service.auth.admin.updateUserById(body.id, { email: body.email || undefined })
  if (authError) return jsonError(authError.message, 400)
  const { error: profileError } = await service.from('profiles').update({ full_name: body.full_name, email: body.email, role: body.role, permissions: body.permissions || {} }).eq('id', body.id)
  if (profileError) return jsonError(profileError.message, 400)
  return Response.json({ id: body.id }, { headers: corsHeaders })
})
