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
create policy "Admins can manage site settings" on public.site_config
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_config (id)
values (1)
on conflict (id) do nothing;
