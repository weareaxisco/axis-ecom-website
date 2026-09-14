alter table public.profiles
  add column if not exists can_view_analytics boolean not null default false;
