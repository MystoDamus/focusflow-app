-- Release hardening patch (applied on top of base schema).
-- Recreates security_events RLS policies with safe UUID cast.

drop policy if exists security_events_insert_authenticated on public.security_events;
create policy security_events_insert_authenticated on public.security_events
for insert with check (auth.uid() is not null);

drop policy if exists security_events_select_own on public.security_events;
create policy security_events_select_own on public.security_events
for select using (
  user_id = auth.uid()
  or (
    context ? 'userId'
    and (context ->> 'userId') ~* '^[0-9a-f-]{36}$'
    and (context ->> 'userId')::uuid = auth.uid()
  )
);
