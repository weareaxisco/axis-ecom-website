-- Maison de l'Élégance production schema
-- Apply with: npx supabase db push

create extension if not exists "pgcrypto";

do $$ begin
  create type public.order_status as enum (
    'pending_confirmation',
    'deposit_received',
    'in_preparation',
    'dispatched_ameex',
    'out_for_delivery',
    'delivered',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('cod', 'card', 'wire');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  phone text check (phone is null or phone ~ '^\+212\s?[67][0-9]{2}[-\s]?[0-9]{6}$'),
  city text,
  address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  wishlist jsonb not null default '[]'::jsonb
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  collection text,
  description text,
  material text,
  price_dh numeric(12, 2) not null check (price_dh >= 0),
  onsite_only boolean not null default false,
  images text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  subtotal_dh numeric(12, 2) not null check (subtotal_dh >= 0),
  shipping_fee_dh numeric(12, 2) not null default 0 check (shipping_fee_dh >= 0),
  total_dh numeric(12, 2) not null check (total_dh >= 0),
  city text,
  delivery_address text,
  phone text check (phone is null or phone ~ '^\+212\s?[67][0-9]{2}[-\s]?[0-9]{6}$'),
  payment_method public.payment_method not null default 'cod',
  status public.order_status not null default 'pending_confirmation',
  ameex_tracking_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  boutique_location text not null,
  appointment_date date not null,
  time_slot text not null,
  consultation_type text not null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_config (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Maison de L''Élégance',
  contact_email text not null default '',
  contact_phone text not null default '+212 522 000 000',
  contact_address text not null default 'Casablanca, Morocco',
  currency_label text not null default 'DH',
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;
drop policy if exists "Public can read site settings" on public.site_config;
create policy "Public can read site settings" on public.site_config for select using (true);
drop policy if exists "Admins can manage site settings" on public.site_config;
create policy "Admins can manage site settings" on public.site_config for all using (public.is_admin()) with check (public.is_admin());
insert into public.site_config (id) values (1) on conflict (id) do nothing;

create index if not exists products_category_idx on public.products(category);
create index if not exists products_collection_idx on public.products(collection);
create index if not exists products_onsite_only_idx on public.products(onsite_only);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists appointments_user_date_idx on public.appointments(user_id, appointment_date);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(concat_ws(' ', new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')), ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "products are publicly readable" on public.products;
drop policy if exists "admins manage products" on public.products;
create policy "products are publicly readable" on public.products for select using (true);
create policy "admins manage products" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read their profile" on public.profiles;
drop policy if exists "users update their profile" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
create policy "users read their profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "users update their profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read their orders" on public.orders;
drop policy if exists "users create their orders" on public.orders;
drop policy if exists "admins manage orders" on public.orders;
create policy "users read their orders" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "users create their orders" on public.orders for insert to authenticated
  with check (user_id = auth.uid());
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users manage their appointments" on public.appointments;
drop policy if exists "admins read appointments" on public.appointments;
create policy "users manage their appointments" on public.appointments for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read appointments" on public.appointments for select to authenticated
  using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant all on public.products to authenticated;
grant all on public.profiles to authenticated;
grant all on public.orders to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
