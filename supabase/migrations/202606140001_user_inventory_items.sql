create table if not exists user_inventory_items (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  item_id text not null,
  item_type text not null check (item_type in ('outfit', 'style', 'equipment')),
  source text not null default 'marketplace',
  listing_id text,
  rarity text not null,
  reputation_points integer not null default 0,
  attributes jsonb not null default '{}'::jsonb,
  gameplay_use text,
  price_nucca numeric(30, 18) not null default 0,
  transaction_hash text not null,
  acquired_at timestamptz not null default now(),
  unique(wallet_address, item_id),
  unique(transaction_hash, item_id)
);

create index if not exists user_inventory_wallet_idx
  on user_inventory_items (wallet_address, acquired_at desc);
