drop policy if exists "users manage their appointments" on public.appointments;
drop policy if exists "admins read appointments" on public.appointments;
drop policy if exists "admins manage appointments" on public.appointments;
drop policy if exists "appointments staff read" on public.appointments;
drop policy if exists "staff manage appointments" on public.appointments;

create policy "appointments staff read"
on public.appointments
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and (
        profiles.role in ('Super Admin', 'Manager', 'super_admin', 'admin')
        or profiles.can_manage_appointments = true
      )
  )
);

create policy "users insert their appointments"
on public.appointments
for insert
to authenticated
with check (user_id = auth.uid());

create policy "users update their appointments"
on public.appointments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users delete their appointments"
on public.appointments
for delete
to authenticated
using (user_id = auth.uid());

create policy "staff manage appointments"
on public.appointments
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and (
        profiles.role in ('Super Admin', 'Manager', 'super_admin', 'admin')
        or profiles.can_manage_appointments = true
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and (
        profiles.role in ('Super Admin', 'Manager', 'super_admin', 'admin')
        or profiles.can_manage_appointments = true
      )
  )
);
