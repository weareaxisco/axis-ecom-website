create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  phone text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'replied')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cndp_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('export', 'erasure')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null default '',
  address text not null default '',
  city text not null default '',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, id)
);

insert into public.categories (slug, name_fr, name_en) values
  ('high-jewelry', 'Haute Joaillerie', 'High Jewelry'),
  ('fine-jewelry', 'Joaillerie', 'Fine Jewelry'),
  ('timepieces', 'Horlogerie', 'Timepieces'),
  ('haute-horlogerie', 'Haute Horlogerie', 'Haute Horlogerie')
on conflict (slug) do nothing;

insert into public.collections (slug, name, description) values
  ('ice-cube', 'Ice Cube', 'Geometric signature creations'),
  ('happy-sport', 'Happy Sport', 'Playful Maison icons'),
  ('alpine-eagle', 'Alpine Eagle', 'Contemporary sporting elegance'),
  ('l-elegance', 'L''Élégance', 'Timeless Maison signatures')
on conflict (slug) do nothing;

alter table public.products add column if not exists category_id uuid references public.categories(id);
alter table public.products add column if not exists collection_id uuid references public.collections(id);
update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null and lower(p.category) = lower(c.name_en);
update public.products p
set collection_id = c.id
from public.collections c
where p.collection_id is null and lower(p.collection) = lower(c.name);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_collection_id_idx on public.products(collection_id);

alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;
alter table public.cndp_requests enable row level security;
alter table public.addresses enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read collections" on public.collections;
create policy "Public can read collections" on public.collections for select using (true);
drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections" on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
drop policy if exists "Customers submit reviews" on public.reviews;
create policy "Customers submit reviews" on public.reviews for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers submit enquiries" on public.enquiries;
create policy "Customers submit enquiries" on public.enquiries for insert with check (true);
drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Admins manage enquiries" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users manage own CNDP requests" on public.cndp_requests;
create policy "Users manage own CNDP requests" on public.cndp_requests for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses" on public.addresses for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

grant select on public.categories, public.collections, public.reviews to anon, authenticated;
grant insert on public.reviews, public.enquiries to authenticated;
grant insert on public.enquiries to anon;
grant all on public.categories, public.collections, public.reviews, public.enquiries, public.cndp_requests, public.addresses to authenticated;
