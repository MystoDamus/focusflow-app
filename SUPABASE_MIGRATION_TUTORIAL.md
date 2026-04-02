# Supabase Migration Tutorial (Release Hardening)

This guide shows how to apply the migration in:

- supabase/migrations/20260402_release_hardening.sql

You can do this either from the Supabase Dashboard (quickest) or with Supabase CLI (best for repeatable deploys).

## What this migration changes

- Creates `public.security_events` if it does not exist.
- Enables RLS on `public.security_events`.
- Recreates `insert` and `select` policies for `public.security_events`.
- Adds non-negative constraints to `public.leaderboards` metrics.

---

## Option A: Run in Supabase Dashboard (SQL Editor)

1. Open your project at https://supabase.com/dashboard.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Open this local file and copy its full contents:
   - `supabase/migrations/20260402_release_hardening.sql`
5. Paste into SQL Editor.
6. Click **Run**.
7. Confirm there are no SQL errors.

### Verify it worked

Run these checks in SQL Editor:

```sql
-- 1) Table exists
select to_regclass('public.security_events') as security_events_table;

-- 2) RLS is enabled
select relname, relrowsecurity
from pg_class
where relname = 'security_events';

-- 3) Policies exist
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'security_events'
order by policyname;

-- 4) Leaderboard constraints exist
select conname
from pg_constraint c
join pg_class t on c.conrelid = t.oid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public'
  and t.relname = 'leaderboards'
  and conname in (
    'leaderboards_level_nonnegative',
    'leaderboards_score_nonnegative',
    'leaderboards_quizzes_nonnegative',
    'leaderboards_bosses_nonnegative',
    'leaderboards_streak_nonnegative'
  )
order by conname;
```

---

## Option B: Run with Supabase CLI (recommended for deployment flow)

### 1) Install/login (if needed)

Download the latest Windows binary from GitHub Releases and extract it:

```powershell
$version = (Invoke-RestMethod "https://api.github.com/repos/supabase/cli/releases/latest").tag_name
$url = "https://github.com/supabase/cli/releases/download/$version/supabase_windows_amd64.tar.gz"
Invoke-WebRequest $url -OutFile "$env:USERPROFILE\supabase_cli.tar.gz"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\supabase_cli" | Out-Null
tar -xzf "$env:USERPROFILE\supabase_cli.tar.gz" -C "$env:USERPROFILE\supabase_cli"
$binPath = "$env:USERPROFILE\supabase_cli"
[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$binPath", "User")
$env:PATH += ";$binPath"
supabase --version
```

Then log in (opens browser):

```powershell
supabase login
```

### 2) Link your local project to remote Supabase

From project root:

```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

You can find `YOUR_PROJECT_REF` in Supabase Dashboard URL or project settings.

### 3) Push migrations to remote database

```powershell
supabase db push
```

This applies unapplied files under `supabase/migrations/` (including `20260402_release_hardening.sql`).

### 4) Verify migration status

```powershell
supabase migration list
```

---

## Option C: Import rows with CSV (Table Editor)

Use this when you want to seed data quickly.

1. In Supabase Dashboard, open **Table Editor**.
2. Select a table (`profiles`, `game_states`, `leaderboards`, or `security_events`).
3. Click **Insert** -> **Import data via CSV**.
4. Upload one of these files from this project:
   - `supabase/csv/profiles_import_template.csv`
   - `supabase/csv/game_states_import_template.csv`
   - `supabase/csv/leaderboards_import_template.csv`
   - `supabase/csv/security_events_import_template.csv`
5. Replace demo UUID/email/name values before final import.

Important:
- CSV import inserts/updates table rows only.
- CSV import does **not** create tables, constraints, indexes, or RLS policies.
- You still need to run the SQL migration (`20260402_release_hardening.sql`) for schema/policy changes.

---

## Common issues and fixes

### `relation "public.leaderboards" does not exist`

Cause: Base schema migration was not applied first.

Fix:
- Apply your base schema/migrations before this hardening migration.
- Then run this migration again.

### Permission/RLS errors in app after migration

Fix:
- Ensure your app uses authenticated user sessions for writes.
- Confirm policies were created (see verification query above).

### CLI says project not linked

Fix:
- Run `supabase link --project-ref YOUR_PROJECT_REF` first.

---

## Recommended production order

1. Apply migrations on staging project first.
2. Smoke test auth + cloud sync + leaderboard writes.
3. Apply same migration on production.
4. Deploy frontend env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Quick smoke test after migration

- Sign in to the app.
- Trigger an action that writes leaderboard/state.
- Confirm row changes in `public.leaderboards`.
- Confirm security events can be inserted by authenticated users.
- Confirm users can only read their own `security_events` rows.
