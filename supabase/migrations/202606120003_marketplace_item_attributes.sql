alter table if exists marketplace_listings
  add column if not exists attributes jsonb not null default '{}'::jsonb,
  add column if not exists gameplay_use text;

alter table if exists marketplace_trades
  add column if not exists item_attributes jsonb not null default '{}'::jsonb;
