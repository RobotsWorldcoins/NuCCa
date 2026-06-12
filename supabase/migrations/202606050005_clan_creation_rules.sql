alter table if exists clans
  add column if not exists owner_wallet text,
  add column if not exists creation_fee_nucca numeric(30, 18) not null default 100000,
  add column if not exists max_members integer not null default 3,
  add column if not exists logo_url text,
  add column if not exists payment_tx_hash text;

create unique index if not exists clans_name_unique_lower
  on clans (lower(name));

create or replace function enforce_clan_member_limit()
returns trigger
language plpgsql
as $$
declare
  current_members integer;
  allowed_members integer;
begin
  select count(*), coalesce(max(c.max_members), 3)
    into current_members, allowed_members
  from clan_members cm
  join clans c on c.id = new.clan_id
  where cm.clan_id = new.clan_id;

  if current_members >= allowed_members then
    raise exception 'clan member limit reached';
  end if;

  return new;
end;
$$;

drop trigger if exists clan_member_limit_trigger on clan_members;
create trigger clan_member_limit_trigger
before insert on clan_members
for each row execute function enforce_clan_member_limit();
