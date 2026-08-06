create or replace function public.increment_api_calls()
returns void
language sql
security definer
set search_path = public
as $$
  update public.site_stats
  set total_api_calls = total_api_calls + 1;
$$;
revoke execute on function public.increment_api_calls() from public;
revoke execute on function public.increment_api_calls() from authenticated;
revoke execute on function public.increment_api_calls() from anon;
grant execute on function public.increment_api_calls() to service_role;