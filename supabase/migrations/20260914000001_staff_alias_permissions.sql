alter table public.profiles
  add column if not exists custom_alias text,
  add column if not exists can_manage_orders boolean not null default false,
  add column if not exists can_manage_inventory boolean not null default false,
  add column if not exists can_manage_taxonomies boolean not null default false,
  add column if not exists can_manage_appointments boolean not null default false,
  add column if not exists can_manage_settings boolean not null default false,
  add column if not exists can_manage_staff boolean not null default false;
