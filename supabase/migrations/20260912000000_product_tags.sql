create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.tags enable row level security;

drop policy if exists "Public can read product tags" on public.tags;
create policy "Public can read product tags" on public.tags for select using (true);

drop policy if exists "Admins can manage product tags" on public.tags;
create policy "Admins can manage product tags" on public.tags for all using (public.is_admin()) with check (public.is_admin());

grant select on public.tags to anon, authenticated;
