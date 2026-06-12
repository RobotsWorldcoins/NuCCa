create unique index if not exists users_referral_code_unique_lower
  on users (lower(referral_code))
  where referral_code is not null;

create unique index if not exists users_username_unique_lower
  on users (lower(username))
  where username is not null;

alter table if exists creator_outfit_items
  add column if not exists reputation_points integer not null default 0;

alter table if exists creator_style_items
  add column if not exists reputation_points integer not null default 0;

create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_wallet text not null,
  item_id text not null,
  item_type text not null check (item_type in ('outfit', 'style', 'equipment')),
  price_nucca numeric(30, 18) not null,
  platform_fee_bps integer not null default 1000,
  reputation_points integer not null default 0,
  status text not null default 'open' check (status in ('open', 'sold', 'cancelled')),
  created_at timestamptz not null default now(),
  sold_at timestamptz
);

create table if not exists marketplace_trades (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id),
  buyer_wallet text not null,
  seller_wallet text not null,
  price_nucca numeric(30, 18) not null,
  platform_fee_nucca numeric(30, 18) not null,
  seller_net_nucca numeric(30, 18) not null,
  user_op_hash text,
  transaction_hash text,
  status text not null default 'pending' check (status in ('pending', 'settled', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

alter table if exists battles
  add column if not exists creator_a_reputation integer not null default 0,
  add column if not exists creator_b_reputation integer not null default 0,
  add column if not exists band_a_reputation integer not null default 0,
  add column if not exists band_b_reputation integer not null default 0,
  add column if not exists reputation_effort_multiplier numeric(12, 4) not null default 1;
