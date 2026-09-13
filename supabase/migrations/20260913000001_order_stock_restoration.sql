alter table public.orders
  add column if not exists stock_restored boolean not null default false;
