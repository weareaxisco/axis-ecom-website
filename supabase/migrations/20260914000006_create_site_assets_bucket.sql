insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read site assets" on storage.objects;
create policy "Public can read site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "Admins can upload site assets" on storage.objects;
create policy "Admins can upload site assets"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can update site assets" on storage.objects;
create policy "Admins can update site assets"
  on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can delete site assets" on storage.objects;
create policy "Admins can delete site assets"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());
