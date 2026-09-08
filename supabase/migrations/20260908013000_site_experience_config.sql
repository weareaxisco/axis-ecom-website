alter table public.site_config
  add column if not exists instagram_url text not null default '',
  add column if not exists tiktok_url text not null default '',
  add column if not exists whatsapp_number text not null default '',
  add column if not exists map_embed_url text not null default '',
  add column if not exists opening_hours text not null default 'Monday - Saturday, 10:00 - 19:00',
  add column if not exists boutique_image_url text not null default '';
