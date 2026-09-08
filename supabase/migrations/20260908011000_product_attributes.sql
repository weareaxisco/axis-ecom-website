create table if not exists public.attributes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attribute_values (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references public.attributes(id) on delete cascade,
  slug text not null,
  value text not null,
  created_at timestamptz not null default now(),
  unique (attribute_id, slug)
);

alter table public.products add column if not exists metal text;
alter table public.products add column if not exists gender text;
alter table public.products add column if not exists shape text;
alter table public.products add column if not exists novelty text;

alter table public.attributes enable row level security;
alter table public.attribute_values enable row level security;
create policy "Public can read product attributes" on public.attributes for select using (true);
create policy "Public can read product attribute values" on public.attribute_values for select using (true);
grant select on public.attributes, public.attribute_values to anon, authenticated;

insert into public.attributes (slug, name) values
  ('metal', 'Metal'), ('gender', 'Gender'), ('shape', 'Shape'), ('novelty', 'Novelty')
on conflict (slug) do nothing;

insert into public.attribute_values (attribute_id, slug, value)
select a.id, v.slug, v.value
from public.attributes a
cross join (values
  ('metal', '18k-white-gold', '18k White Gold'),
  ('metal', '18k-yellow-gold', '18k Yellow Gold'),
  ('metal', '18k-rose-gold', '18k Rose Gold'),
  ('gender', 'women', 'Women'),
  ('gender', 'men', 'Men'),
  ('gender', 'unisex', 'Unisex'),
  ('shape', 'round', 'Round'),
  ('shape', 'square', 'Square'),
  ('shape', 'oval', 'Oval'),
  ('novelty', 'new', 'New'),
  ('novelty', 'bestseller', 'Bestseller'),
  ('novelty', 'limited', 'Limited Edition')
) as v(attribute_slug, slug, value)
where a.slug = v.attribute_slug
on conflict (attribute_id, slug) do nothing;
