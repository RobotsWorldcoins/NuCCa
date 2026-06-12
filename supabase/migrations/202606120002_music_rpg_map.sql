create table if not exists map_scans (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  scan_date date not null,
  zone_id text not null,
  paid boolean not null default false,
  paid_cost_nucca numeric(30, 18) not null default 0,
  reward_id text not null,
  reward_type text not null check (reward_type in ('xp', 'sample', 'equipment', 'nucca', 'empty')),
  token_reward numeric(30, 18) not null default 0,
  xp_reward integer not null default 0,
  reputation_points integer not null default 0,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists map_scans_one_free_scan_per_wallet_day
  on map_scans (wallet_address, scan_date)
  where paid = false;

create index if not exists map_scans_wallet_day_idx
  on map_scans (wallet_address, scan_date, paid);
