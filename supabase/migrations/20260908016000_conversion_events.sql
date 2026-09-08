create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('page_view', 'add_to_cart', 'begin_checkout', 'purchase')),
  visitor_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.analytics_events enable row level security;
create policy "Anonymous clients can record analytics events" on public.analytics_events for insert to anon, authenticated with check (true);
create policy "Admins can read analytics events" on public.analytics_events for select to authenticated using (public.is_admin());
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
