alter table public.zip_reports add column if not exists status text default 'pending';

-- Grant permissions to authenticated roles (admins)
grant update on public.zip_reports to authenticated;
grant all on public.zip_reports to service_role;

-- Allow users to insert (already should be allowed, but for safety)
grant insert on public.zip_reports to anon, authenticated;
