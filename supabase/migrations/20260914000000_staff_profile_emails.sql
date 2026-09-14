alter table public.profiles
  add column if not exists email text;

update public.profiles
set email = coalesce(email, full_name)
where email is null;
