create or replace function increment_api_calls()
returns void
language sql
security definer
as $$
  update public.site_stats
  set total_api_calls = total_api_calls + 1;
$$;
grant execute on function increment_api_calls() to anon, authenticated;