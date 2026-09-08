create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  rating int not null check (rating between 1 and 5),
  feedback_type text not null check (feedback_type in ('experience', 'bug', 'service')),
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.site_config add column if not exists ga_tracking_id text not null default '';
alter table public.site_feedback enable row level security;
create policy "Anyone can submit site feedback" on public.site_feedback for insert with check (user_id is null or user_id = auth.uid());
create policy "Admins read site feedback" on public.site_feedback for select to authenticated using (public.is_admin());
grant insert on public.site_feedback to anon, authenticated;
grant select on public.site_feedback to authenticated;
