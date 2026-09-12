alter table public.appointments
  add column if not exists client_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists service_type text,
  add column if not exists notes text;

alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('pending_confirmation', 'requested', 'confirmed', 'rescheduled', 'completed', 'cancelled'));

grant insert on public.appointments to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end
$$;
