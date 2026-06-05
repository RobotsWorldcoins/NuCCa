alter table if exists battles
  add column if not exists battle_format text not null default 'solo-1v1',
  add column if not exists team_size integer not null default 1,
  add column if not exists platform_fee_nucca numeric(30, 18) not null default 0,
  add column if not exists league_reserve_fee_nucca numeric(30, 18) not null default 0;

alter table if exists battles
  drop column if exists burn_fee_nucca,
  drop column if exists house_fee_nucca;

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
