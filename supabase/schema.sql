-- Maison de l'Élégance security baseline.
-- Run after the application tables have been created.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table if exists public.products enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.appointments enable row level security;

drop policy if exists "products are publicly readable" on public.products;
drop policy if exists "admins manage products" on public.products;
create policy "products are publicly readable" on public.products for select using (true);
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read their profile" on public.profiles;
drop policy if exists "users update their profile" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
create policy "users read their profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "users update their profile" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read their orders" on public.orders;
drop policy if exists "users create their orders" on public.orders;
drop policy if exists "admins manage orders" on public.orders;
create policy "users read their orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "users create their orders" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users manage their appointments" on public.appointments;
drop policy if exists "admins read appointments" on public.appointments;
create policy "users manage their appointments" on public.appointments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read appointments" on public.appointments for select to authenticated using (public.is_admin());
