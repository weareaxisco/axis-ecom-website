drop policy if exists "allow_guest_appointment_insert" on public.appointments;

create policy "allow_guest_appointment_insert"
on public.appointments
for insert
to anon, authenticated
with check (user_id is null or user_id = auth.uid());

grant insert on public.appointments to anon, authenticated;
