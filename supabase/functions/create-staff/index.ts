import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
  const { data: { user: caller } } = await anon.auth.getUser()
  if (!caller) return new Response('Unauthorized', { status: 401 })
  const service = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: profile } = await service.from('profiles').select('role').eq('id', caller.id).single()
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return new Response('Forbidden', { status: 403 })
  const body = await request.json()
  if (!body.email || !body.password || !['staff_catalog', 'staff_orders'].includes(body.role)) return new Response('Invalid staff payload', { status: 400 })
  const { data, error } = await service.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true })
  if (error || !data.user) return new Response(error?.message || 'Unable to create staff user', { status: 400 })
  const { error: profileError } = await service.from('profiles').insert({ id: data.user.id, full_name: body.email, role: body.role, permissions: body.permissions || {} })
  if (profileError) {
    await service.auth.admin.deleteUser(data.user.id)
    return new Response(profileError.message, { status: 400 })
  }
  return Response.json({ id: data.user.id })
})
