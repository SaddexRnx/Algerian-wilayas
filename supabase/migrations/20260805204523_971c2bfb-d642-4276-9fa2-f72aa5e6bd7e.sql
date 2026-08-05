create table public.feature_votes (
    id uuid primary key default gen_random_uuid(),
    feature_id text not null,
    voter_id text not null,
    created_at timestamptz default now(),
    unique (feature_id, voter_id)
);

grant select, insert on public.feature_votes to authenticated, anon;
grant all on public.feature_votes to service_role;

alter table public.feature_votes enable row level security;

create policy "Anyone can vote" on public.feature_votes for insert to authenticated, anon with check (true);
create policy "Anyone can see votes" on public.feature_votes for select to authenticated, anon using (true);

-- Ensure data_corrections is accessible for the leaderboard
grant select on public.data_corrections to authenticated, anon;
