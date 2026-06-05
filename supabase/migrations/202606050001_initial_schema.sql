create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  username text,
  world_session_id text unique,
  referral_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists world_id_sessions (
  session_id text primary key,
  protocol_version text not null,
  verified_at timestamptz not null default now(),
  raw_result jsonb not null
);

create table if not exists world_id_nullifiers (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  nullifier numeric(78, 0) not null,
  wallet_address text,
  created_at timestamptz not null default now(),
  unique(action, nullifier)
);

create table if not exists daily_claims (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  claim_date date not null,
  token_reward numeric(30, 18) not null default 0,
  xp_reward integer not null default 0,
  energy_reward integer not null default 0,
  market_trusted boolean not null default false,
  created_at timestamptz not null default now(),
  unique(wallet_address, claim_date)
);

create table if not exists referral_events (
  id uuid primary key default gen_random_uuid(),
  referred_wallet text not null unique,
  referrer_wallet text,
  referral_code text not null,
  reward_nucca numeric(30, 18) not null default 0,
  referred_bonus_nucca numeric(30, 18) not null default 0,
  status text not null check (status in ('pending_reward', 'rewarded', 'xp_only', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists referral_events_code_idx on referral_events(referral_code);

create table if not exists ai_jobs (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  generator_id text not null,
  prompt text not null,
  status text not null check (status in ('queued', 'sleeping', 'capacity_full', 'offline', 'running', 'failed', 'complete')),
  output_url text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists generated_assets (
  id uuid primary key default gen_random_uuid(),
  ai_job_id uuid references ai_jobs(id),
  wallet_address text not null,
  asset_type text not null,
  storage_url text not null,
  commercial_license text not null,
  created_at timestamptz not null default now()
);

create table if not exists studios (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  level integer not null default 1,
  xp integer not null default 0,
  energy integer not null default 100,
  theme text not null default 'genesis',
  updated_at timestamptz not null default now()
);

create table if not exists studio_upgrades (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  upgrade_key text not null,
  nucca_spent numeric(30, 18) not null default 0,
  acquired_at timestamptz not null default now(),
  unique(wallet_address, upgrade_key)
);

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  mission_key text not null unique,
  title text not null,
  xp_reward integer not null default 0,
  energy_reward integer not null default 0,
  nucca_reward numeric(30, 18) not null default 0,
  active boolean not null default true
);

create table if not exists user_missions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  mission_key text not null references missions(mission_key),
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique(wallet_address, mission_key, completed_on)
);

create table if not exists contests (
  id uuid primary key default gen_random_uuid(),
  contest_type text not null,
  title text not null,
  entry_fee numeric(30, 18) not null default 0,
  status text not null check (status in ('draft', 'open', 'voting', 'resolved', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists contest_entries (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references contests(id),
  wallet_address text not null,
  asset_id uuid references generated_assets(id),
  votes integer not null default 0,
  created_at timestamptz not null default now(),
  unique(contest_id, wallet_address)
);

create table if not exists market_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  price_usd numeric(30, 18),
  liquidity_usd numeric(30, 6),
  volume_24h numeric(30, 6),
  txns_24h integer not null default 0,
  trusted_for_rewards boolean not null default false,
  fetched_at timestamptz not null default now()
);

create table if not exists reward_budgets (
  id uuid primary key default gen_random_uuid(),
  budget_key text not null unique,
  daily_cap numeric(30, 18) not null,
  monthly_cap numeric(30, 18) not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists economy_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_wallet text,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
