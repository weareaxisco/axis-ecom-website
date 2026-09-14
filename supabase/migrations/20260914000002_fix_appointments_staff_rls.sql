create or replace function public.has_staff_permission(permission_name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (
        role in ('super_admin', 'admin', 'Super Admin', 'Manager')
        or coalesce((permissions ->> permission_name)::boolean, false)
        or (
          permission_name = 'manage_appointments'
          and can_manage_appointments = true
        )
      )
  );
$$;

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
    where id = auth.uid()
      and (
        role in ('super_admin', 'admin', 'Super Admin', 'Manager')
        or can_manage_appointments = true
      )
  )
);

create policy "staff manage appointments"
on public.appointments
for all
to authenticated
using (public.has_staff_permission('manage_appointments'))
with check (public.has_staff_permission('manage_appointments'));

grant execute on function public.has_staff_permission(text) to authenticated;
