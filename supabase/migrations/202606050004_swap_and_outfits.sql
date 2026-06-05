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

create table if not exists swap_route_audit_logs (
  id uuid primary key default gen_random_uuid(),
  wallet_address text,
  route_id text not null,
  input_token text not null,
  output_token text not null,
  input_amount numeric(30, 18),
  quoted_output_amount numeric(30, 18),
  execution_surface text not null default 'external_uniswap',
  user_op_hash text,
  transaction_hash text,
  status text not null default 'opened',
  created_at timestamptz not null default now()
);
