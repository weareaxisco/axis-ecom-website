alter table public.profiles
  add column if not exists wishlist jsonb not null default '[]'::jsonb;
