-- Phase C foundation: branches, floors, rooms, room types, customers, and RLS-ready policies.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.room_status as enum (
  'available',
  'held',
  'booked',
  'blocked',
  'maintenance'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null unique,
  name_vi text not null,
  name_en text not null,
  summary_vi text not null default '',
  summary_en text not null default '',
  story_vi text not null default '',
  story_en text not null default '',
  highlights_vi text[] not null default '{}'::text[],
  highlights_en text[] not null default '{}'::text[],
  address_line1 text not null,
  address_line2 text,
  district text not null,
  city text not null default 'Ho Chi Minh City',
  country text not null default 'Vietnam',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  phone text,
  email citext,
  map_url text,
  hero_image_path text,
  seo_title_vi text not null default '',
  seo_title_en text not null default '',
  seo_description_vi text not null default '',
  seo_description_en text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  code text not null,
  level_number integer not null,
  name_vi text not null default '',
  name_en text not null default '',
  notes_vi text not null default '',
  notes_en text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, code),
  unique (branch_id, level_number)
);

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null unique,
  name_vi text not null,
  name_en text not null,
  summary_vi text not null default '',
  summary_en text not null default '',
  description_vi text not null default '',
  description_en text not null default '',
  story_vi text not null default '',
  story_en text not null default '',
  highlights_vi text[] not null default '{}'::text[],
  highlights_en text[] not null default '{}'::text[],
  occupancy_adults integer not null default 2,
  occupancy_children integer not null default 0,
  size_sqm numeric(6,2),
  bed_type text not null default '',
  base_price numeric(12,2) not null default 0,
  weekend_surcharge numeric(12,2) not null default 0,
  manual_override_price numeric(12,2),
  show_public_price boolean not null default true,
  cover_image_path text,
  seo_title_vi text not null default '',
  seo_title_en text not null default '',
  seo_description_vi text not null default '',
  seo_description_en text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  floor_id uuid not null references public.floors(id) on delete restrict,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  code text not null,
  notes_vi text not null default '',
  notes_en text not null default '',
  status public.room_status not null default 'available',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, code)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email citext not null unique,
  phone text,
  preferred_locale text not null default 'vi' check (preferred_locale in ('vi', 'en')),
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  marketing_consent_source text,
  source text not null default 'public_form',
  notes text not null default '',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_branches_updated_at
before update on public.branches
for each row
execute function public.set_updated_at();

create trigger set_floors_updated_at
before update on public.floors
for each row
execute function public.set_updated_at();

create trigger set_room_types_updated_at
before update on public.room_types
for each row
execute function public.set_updated_at();

create trigger set_rooms_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

alter table public.branches enable row level security;
alter table public.floors enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.customers enable row level security;

create policy "Public can read branches"
  on public.branches
  for select
  using (true);

create policy "Authenticated users can manage branches"
  on public.branches
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Public can read room types"
  on public.room_types
  for select
  using (true);

create policy "Authenticated users can manage room types"
  on public.room_types
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Authenticated users can read floors"
  on public.floors
  for select
  using (auth.uid() is not null);

create policy "Authenticated users can manage floors"
  on public.floors
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Authenticated users can read rooms"
  on public.rooms
  for select
  using (auth.uid() is not null);

create policy "Authenticated users can manage rooms"
  on public.rooms
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Customers can read their own row"
  on public.customers
  for select
  using (auth.uid() = auth_user_id);

create policy "Customers can insert their own row"
  on public.customers
  for insert
  with check (auth.uid() = auth_user_id);

create policy "Customers can update their own row"
  on public.customers
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

comment on table public.branches is 'Branch records with bilingual content fields for public marketing pages.';
comment on table public.room_types is 'Room type records with bilingual content fields and public pricing data.';
comment on table public.floors is 'Physical floors grouped under branches.';
comment on table public.rooms is 'Physical rooms used by operations and availability checks.';
comment on table public.customers is 'Customer profile row linked to Supabase Auth for member history.';
