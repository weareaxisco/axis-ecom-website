alter table public.appointments
  add column if not exists guests integer not null default 1 check (guests between 1 and 4);
