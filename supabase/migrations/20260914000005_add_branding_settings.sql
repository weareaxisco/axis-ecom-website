alter table public.site_config
  add column if not exists business_name text not null default 'Maison de L''Élégance',
  add column if not exists logo_type text not null default 'text',
  add column if not exists logo_image_url text not null default '',
  add column if not exists favicon_url text not null default '';

alter table public.site_config
  drop constraint if exists site_config_logo_type_check;

alter table public.site_config
  add constraint site_config_logo_type_check
  check (logo_type in ('text', 'image'));

update public.site_config
set business_name = site_name
where business_name = 'Maison de L''Élégance'
  and site_name <> 'Maison de L''Élégance';
