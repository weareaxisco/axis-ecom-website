import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const authorization = request.headers.get('Authorization')
  if (!authorization) return new Response('Unauthorized', { status: 401 })
  const url = Deno.env.get('SUPABASE_URL')!
  const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
  const { data: { user: caller } } = await anon.auth.getUser()
  const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!caller) return new Response('Unauthorized', { status: 401 })
  const { data: callerProfile } = await service.from('profiles').select('role').eq('id', caller.id).single()
  if (!callerProfile || !['super_admin', 'admin'].includes(callerProfile.role)) return new Response('Forbidden', { status: 403 })
  const body = await request.json()
  if (!body.id || !['update', 'delete'].includes(body.action)) return new Response('Invalid staff payload', { status: 400 })
  if (body.action === 'delete') {
    const { error } = await service.auth.admin.deleteUser(body.id)
    if (error) return new Response(error.message, { status: 400 })
    return Response.json({ id: body.id })
  }
  const { error: authError } = await service.auth.admin.updateUserById(body.id, { email: body.email || undefined })
  if (authError) return new Response(authError.message, { status: 400 })
  const { error: profileError } = await service.from('profiles').update({ full_name: body.full_name, email: body.email, role: body.role, permissions: body.permissions || {} }).eq('id', body.id)
  if (profileError) return new Response(profileError.message, { status: 400 })
  return Response.json({ id: body.id })
})
