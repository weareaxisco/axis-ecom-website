drop policy if exists "admins read appointments" on public.appointments;
drop policy if exists "admins manage appointments" on public.appointments;

create policy "admins manage appointments" on public.appointments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
