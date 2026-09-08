alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'super_admin', 'admin', 'staff_catalog', 'staff_orders'));

alter table public.profiles
  add column if not exists permissions jsonb not null default '{}'::jsonb;

create or replace function public.has_staff_permission(permission_name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (
        role in ('super_admin', 'admin')
        or coalesce((permissions ->> permission_name)::boolean, false)
      )
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'staff_catalog', 'staff_orders')
  );
$$;

drop policy if exists "admins manage products" on public.products;
create policy "staff manage products" on public.products for all to authenticated
  using (public.has_staff_permission('manage_products'))
  with check (public.has_staff_permission('manage_products'));

drop policy if exists "admins manage orders" on public.orders;
create policy "staff manage orders" on public.orders for all to authenticated
  using (public.has_staff_permission('manage_orders'))
  with check (public.has_staff_permission('manage_orders'));

drop policy if exists "admins manage appointments" on public.appointments;
create policy "staff manage appointments" on public.appointments for all to authenticated
  using (public.has_staff_permission('manage_appointments'))
  with check (public.has_staff_permission('manage_appointments'));

drop policy if exists "Admins can manage site settings" on public.site_config;
create policy "staff manage site settings" on public.site_config for all to authenticated
  using (public.has_staff_permission('manage_settings'))
  with check (public.has_staff_permission('manage_settings'));

grant execute on function public.has_staff_permission(text) to authenticated;
