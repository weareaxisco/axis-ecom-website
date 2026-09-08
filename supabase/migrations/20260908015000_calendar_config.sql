alter table public.site_config
  add column if not exists calendar_api_url text not null default '';
