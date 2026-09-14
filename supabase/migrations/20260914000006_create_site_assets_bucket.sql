-- Create site-assets bucket if it does not exist.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

-- Public storefronts need to resolve the configured logo and favicon.
drop policy if exists "Public can read site assets" on storage.objects;
drop policy if exists "Public Read Access for site-assets" on storage.objects;
create policy "Public Read Access for site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- The admin UI is authenticated before it can reach these controls.
drop policy if exists "Admins can upload site assets" on storage.objects;
drop policy if exists "Staff Insert Access for site-assets" on storage.objects;
create policy "Staff Insert Access for site-assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-assets');

drop policy if exists "Admins can update site assets" on storage.objects;
drop policy if exists "Admins can delete site assets" on storage.objects;
drop policy if exists "Staff Manage Access for site-assets" on storage.objects;
create policy "Staff Manage Access for site-assets"
  on storage.objects for all to authenticated
  using (bucket_id = 'site-assets')
  with check (bucket_id = 'site-assets');
