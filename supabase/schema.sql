-- RAW MVP database schema for Supabase/PostgreSQL.
-- Run in the Supabase SQL editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text not null default 'DONOR' check (role in ('DONOR','SEEKER','BUSINESS','ADMIN')),
  location text,
  lat double precision,
  lng double precision,
  trust_score integer not null default 50 check (trust_score between 0 and 100),
  verified_phone boolean not null default false,
  verified_email boolean not null default false,
  verified_business boolean not null default false,
  successful_transactions integer not null default 0,
  response_rate integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  type text,
  gstin text,
  location text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  default_unit text not null,
  created_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references profiles(id) on delete cascade,
  material text not null,
  category text not null,
  title text not null,
  description text,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  condition text not null,
  price numeric,
  location text,
  lat double precision,
  lng double precision,
  available_until timestamptz,
  mode text not null default 'SELL' check (mode in ('SELL','DONATE','SWAP')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PENDING','COMPLETED','EXPIRED')),
  image_url text,
  trust_score integer not null default 50,
  circularity_score integer not null default 50,
  urgency_score integer not null default 50,
  ai_confidence integer,
  created_at timestamptz not null default now()
);

create table if not exists requirements (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references profiles(id) on delete cascade,
  material text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  max_price numeric,
  condition text,
  location text,
  lat double precision,
  lng double precision,
  radius_km numeric not null default 10,
  needed_by timestamptz,
  notes text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','FULFILLED','CLOSED')),
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references listings(id) on delete cascade,
  requirement_id uuid not null references requirements(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  distance_score integer,
  need_score integer,
  price_score integer,
  availability_score integer,
  trust_score integer,
  circularity_score integer,
  explanation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  seeker_id uuid not null references profiles(id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  price numeric not null default 0,
  message text,
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','REJECTED','COUNTERED')),
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  donor_id uuid not null references profiles(id),
  seeker_id uuid not null references profiles(id),
  material text not null,
  quantity numeric not null,
  unit text not null,
  agreed_price numeric not null default 0,
  total numeric not null default 0,
  pickup_time timestamptz,
  status text not null default 'REQUESTED' check (status in ('REQUESTED','ACCEPTED','NEGOTIATING','CONFIRMED','COMPLETED')),
  created_at timestamptz not null default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  from_user uuid not null references profiles(id) on delete cascade,
  to_user uuid not null references profiles(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists impact_records (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete set null,
  material_recovered numeric not null default 0,
  value_recovered numeric not null default 0,
  estimated_waste_avoided numeric not null default 0,
  reuse_cycles integer not null default 1,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_matches_resource_requirement_unique on matches(resource_id, requirement_id);

create index if not exists idx_listings_material on listings(material);
create index if not exists idx_listings_status on listings(status);
create index if not exists idx_requirements_material on requirements(material);
create index if not exists idx_offers_listing on offers(listing_id);
create index if not exists idx_transactions_donor on transactions(donor_id);
create index if not exists idx_transactions_seeker on transactions(seeker_id);

-- RAW security bootstrap. Review these policies for your final production deployment.
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table listings enable row level security;
alter table requirements enable row level security;
alter table matches enable row level security;
alter table offers enable row level security;
alter table transactions enable row level security;
alter table ratings enable row level security;
alter table impact_records enable row level security;

create policy "profiles_select_authenticated" on profiles for select to authenticated using (true);
create policy "profiles_update_self" on profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_self" on profiles for insert to authenticated with check (auth.uid() = id);

create policy "listings_public_read" on listings for select using (status = 'ACTIVE' or donor_id = auth.uid());
create policy "listings_owner_insert" on listings for insert to authenticated with check (donor_id = auth.uid());
create policy "listings_owner_update" on listings for update to authenticated using (donor_id = auth.uid()) with check (donor_id = auth.uid());
create policy "requirements_public_read" on requirements for select using (status = 'ACTIVE' or seeker_id = auth.uid());
create policy "requirements_owner_insert" on requirements for insert to authenticated with check (seeker_id = auth.uid());
create policy "requirements_owner_update" on requirements for update to authenticated using (seeker_id = auth.uid()) with check (seeker_id = auth.uid());
create policy "matches_participant_read" on matches for select to authenticated using (
  exists (select 1 from listings l where l.id = resource_id and l.donor_id = auth.uid())
  or exists (select 1 from requirements r where r.id = requirement_id and r.seeker_id = auth.uid())
);
create policy "offers_participant_read" on offers for select to authenticated using (
  seeker_id = auth.uid() or exists (select 1 from listings l where l.id = listing_id and l.donor_id = auth.uid())
);
create policy "offers_seeker_insert" on offers for insert to authenticated with check (seeker_id = auth.uid());
create policy "transactions_participant_read" on transactions for select to authenticated using (donor_id = auth.uid() or seeker_id = auth.uid());
create policy "ratings_participant_read" on ratings for select to authenticated using (from_user = auth.uid() or to_user = auth.uid());
create policy "impact_participant_read" on impact_records for select to authenticated using (
  exists (select 1 from transactions t where t.id = transaction_id and (t.donor_id = auth.uid() or t.seeker_id = auth.uid()))
);

-- Create a profile row whenever a new auth user is created. Metadata comes from sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1), 'RAW Member'),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'DONOR')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Optional image bucket for material photos. Create it in Supabase Storage if desired.
-- insert into storage.buckets (id, name, public) values ('raw-images', 'raw-images', false) on conflict do nothing;

-- Additional policies needed for offer updates and transaction creation during the MVP.
drop policy if exists "offers_donor_update" on offers;
create policy "offers_donor_update" on offers for update to authenticated using (
  exists (select 1 from listings l where l.id = listing_id and l.donor_id = auth.uid())
  or seeker_id = auth.uid()
) with check (
  exists (select 1 from listings l where l.id = listing_id and l.donor_id = auth.uid())
  or seeker_id = auth.uid()
);

drop policy if exists "transactions_participant_insert" on transactions;
create policy "transactions_participant_insert" on transactions for insert to authenticated with check (
  donor_id = auth.uid() or seeker_id = auth.uid()
);

drop policy if exists "impact_participant_insert" on impact_records;
create policy "impact_participant_insert" on impact_records for insert to authenticated with check (
  exists (select 1 from transactions t where t.id = transaction_id and (t.donor_id = auth.uid() or t.seeker_id = auth.uid()))
);

-- V6 intelligence + realtime layer
alter table matches add column if not exists urgency_score integer;
alter table matches add column if not exists circularity_path text not null default 'RECYCLE' check (circularity_path in ('DIRECT_REUSE','REPAIR_AND_REUSE','REPURPOSE','RECYCLE'));

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('MATCH','OFFER','TRANSACTION','REQUIREMENT','SYSTEM')),
  title text not null,
  message text not null,
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "notifications_owner_read" on notifications;
create policy "notifications_owner_read" on notifications for select to authenticated using (user_id = auth.uid());

drop policy if exists "notifications_system_insert" on notifications;
create policy "notifications_system_insert" on notifications for insert to authenticated with check (true);

drop policy if exists "notifications_owner_update" on notifications;
create policy "notifications_owner_update" on notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "matches_participant_update" on matches;
create policy "matches_participant_update" on matches for update to authenticated using (
  exists (select 1 from listings l where l.id = resource_id and l.donor_id = auth.uid())
  or exists (select 1 from requirements r where r.id = requirement_id and r.seeker_id = auth.uid())
) with check (
  exists (select 1 from listings l where l.id = resource_id and l.donor_id = auth.uid())
  or exists (select 1 from requirements r where r.id = requirement_id and r.seeker_id = auth.uid())
);

drop policy if exists "matches_participant_insert" on matches;
create policy "matches_participant_insert" on matches for insert to authenticated with check (
  exists (select 1 from listings l where l.id = resource_id and l.donor_id = auth.uid())
  or exists (select 1 from requirements r where r.id = requirement_id and r.seeker_id = auth.uid())
);

-- Enable realtime for V6 tables (safe to skip if already present in publication).
do $$
begin
  begin alter publication supabase_realtime add table matches; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table listings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table requirements; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table offers; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table transactions; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table notifications; exception when duplicate_object then null; end;
end $$;


-- Backend-safe ownership helpers.
create unique index if not exists idx_businesses_owner_unique on businesses(owner_id);

drop policy if exists "transactions_participant_update" on transactions;
create policy "transactions_participant_update" on transactions for update to authenticated using (
  donor_id = auth.uid() or seeker_id = auth.uid()
) with check (
  donor_id = auth.uid() or seeker_id = auth.uid()
);

drop policy if exists "notifications_owner_insert" on notifications;
create policy "notifications_owner_insert" on notifications for insert to authenticated with check (user_id = auth.uid());

-- Impact rows are readable/writable only for transaction participants.
drop policy if exists "impact_participant_update" on impact_records;
create policy "impact_participant_update" on impact_records for update to authenticated using (
  exists (select 1 from transactions t where t.id = transaction_id and (t.donor_id = auth.uid() or t.seeker_id = auth.uid()))
) with check (
  exists (select 1 from transactions t where t.id = transaction_id and (t.donor_id = auth.uid() or t.seeker_id = auth.uid()))
);


drop policy if exists "businesses_owner_read" on businesses;
create policy "businesses_owner_read" on businesses for select to authenticated using (owner_id = auth.uid());

drop policy if exists "businesses_owner_insert" on businesses;
create policy "businesses_owner_insert" on businesses for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "businesses_owner_update" on businesses;
create policy "businesses_owner_update" on businesses for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
