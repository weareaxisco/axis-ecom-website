alter table public.orders
  alter column user_id drop not null;

drop policy if exists "guests create orders" on public.orders;
create policy "guests create orders" on public.orders
  for insert to anon
  with check (user_id is null);

grant insert on public.orders to anon;
