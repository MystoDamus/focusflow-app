-- Base schema: all tables, RLS, and policies.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  currency integer not null default 0,
  shards integer not null default 0,
  current_theme text not null default 'default',
  tutorial_completed boolean not null default false,
  tutorial_skipped boolean not null default false,
  leaderboard_stats jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  owned_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  level integer not null default 1 check (level >= 1),
  score integer not null default 0 check (score >= 0),
  total_quizzes_completed integer not null default 0 check (total_quizzes_completed >= 0),
  total_bosses_fought integer not null default 0 check (total_bosses_fought >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  mode_scores jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  message text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.game_states enable row level security;
alter table public.leaderboards enable row level security;
alter table public.security_events enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id);

drop policy if exists game_state_select_own on public.game_states;
create policy game_state_select_own on public.game_states
for select using (auth.uid() = user_id);

drop policy if exists game_state_upsert_own on public.game_states;
create policy game_state_upsert_own on public.game_states
for insert with check (auth.uid() = user_id);

drop policy if exists game_state_update_own on public.game_states;
create policy game_state_update_own on public.game_states
for update using (auth.uid() = user_id);

drop policy if exists leaderboard_select_all on public.leaderboards;
create policy leaderboard_select_all on public.leaderboards
for select using (true);

drop policy if exists leaderboard_insert_own on public.leaderboards;
create policy leaderboard_insert_own on public.leaderboards
for insert with check (auth.uid() = user_id);

drop policy if exists leaderboard_update_own on public.leaderboards;
create policy leaderboard_update_own on public.leaderboards
for update using (auth.uid() = user_id);

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
