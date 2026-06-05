create table if not exists creator_style_items (
  id text primary key,
  name text not null,
  slot text not null,
  rarity text not null,
  cosmetic_effect text not null,
  price_nucca numeric(30, 18) not null default 0,
  active boolean not null default true
);

create table if not exists user_creator_style_items (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  item_id text not null references creator_style_items(id),
  acquired_at timestamptz not null default now(),
  unique(wallet_address, item_id)
);

create table if not exists creator_outfit_items (
  id text primary key,
  name text not null,
  genre text not null,
  slot text not null,
  rarity text not null,
  visual text not null,
  price_nucca numeric(30, 18) not null default 0,
  active boolean not null default true
);

create table if not exists user_creator_outfit_items (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  item_id text not null references creator_outfit_items(id),
  acquired_at timestamptz not null default now(),
  unique(wallet_address, item_id)
);

create table if not exists sample_library (
  id text primary key,
  name text not null,
  bpm integer not null,
  musical_key text not null,
  sample_type text not null,
  unlock_level integer not null default 1,
  license_scope text not null default 'in-app',
  storage_url text,
  active boolean not null default true
);

create table if not exists compositions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  title text not null,
  sample_ids text[] not null,
  arrangement text not null,
  provenance_manifest jsonb not null,
  manifest_hash text not null unique,
  audio_url text,
  ranked_eligible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  creator_wallet text not null,
  opponent_wallet text,
  composition_a_id uuid not null references compositions(id),
  composition_b_id uuid references compositions(id),
  mode text not null check (mode in ('open', 'direct')),
  battle_format text not null default 'solo-1v1' check (battle_format in ('solo-1v1', 'crew-3v3')),
  team_size integer not null default 1 check (team_size in (1, 3)),
  status text not null check (status in ('open', 'active', 'voting', 'resolved', 'cancelled')),
  ranked boolean not null default true,
  duration_hours integer not null default 48,
  entry_fee_nucca numeric(30, 18) not null default 0,
  platform_fee_nucca numeric(30, 18) not null default 0,
  league_reserve_fee_nucca numeric(30, 18) not null default 0,
  reward_nucca numeric(30, 18) not null default 0,
  total_contest_nucca numeric(30, 18) generated always as (entry_fee_nucca * team_size * 2) stored,
  constraint battles_minimum_contest_value check ((duration_hours = 24 and entry_fee_nucca >= 250) or (duration_hours = 48 and entry_fee_nucca >= 500) or duration_hours not in (24, 48)),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists clans (
  id text primary key,
  name text not null,
  style text not null,
  focus text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clan_members (
  id uuid primary key default gen_random_uuid(),
  clan_id text not null references clans(id),
  wallet_address text not null,
  role text not null default 'member' check (role in ('member', 'captain')),
  joined_at timestamptz not null default now(),
  unique(wallet_address)
);

create table if not exists battle_teams (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id),
  side text not null check (side in ('a', 'b')),
  clan_id text references clans(id),
  captain_wallet text not null,
  unique(battle_id, side)
);

create table if not exists battle_team_members (
  id uuid primary key default gen_random_uuid(),
  battle_team_id uuid not null references battle_teams(id),
  wallet_address text not null,
  composition_id uuid references compositions(id),
  entry_paid_nucca numeric(30, 18) not null default 0,
  joined_at timestamptz not null default now(),
  unique(battle_team_id, wallet_address)
);

create table if not exists monthly_rankings (
  id uuid primary key default gen_random_uuid(),
  month_start date not null,
  wallet_address text,
  clan_id text references clans(id),
  points integer not null default 0,
  prize_nucca numeric(30, 18) not null default 0,
  unique(month_start, wallet_address),
  unique(month_start, clan_id)
);

create table if not exists battle_votes (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id),
  voter_wallet text not null,
  world_session_id text,
  winner_side text not null check (winner_side in ('a', 'b')),
  vote_weight numeric(10, 4) not null default 1,
  created_at timestamptz not null default now(),
  unique(battle_id, voter_wallet)
);

create table if not exists battle_hype_backs (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id),
  supporter_wallet text not null,
  backed_side text not null check (backed_side in ('a', 'b')),
  hype_amount integer not null check (hype_amount > 0),
  token_stake_nucca numeric(30, 18) not null default 0,
  reward_type text not null default 'xp_cosmetic_only',
  created_at timestamptz not null default now(),
  unique(battle_id, supporter_wallet),
  constraint no_spectator_token_betting_in_mvp check (token_stake_nucca = 0)
);
