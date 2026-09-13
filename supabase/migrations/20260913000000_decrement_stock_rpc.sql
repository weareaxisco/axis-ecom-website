create or replace function public.decrement_product_stock(p_id uuid, qty integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = greatest(0, stock - qty)
  where id = p_id;
end;
$$;

revoke all on function public.decrement_product_stock(uuid, integer) from public;
grant execute on function public.decrement_product_stock(uuid, integer) to anon, authenticated;

alter table public.orders
  add column if not exists stock_decremented boolean not null default false;
