-- Phase D foundation: availability requests, room holds, reservations, and audit logs.

create extension if not exists "btree_gist";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.availability_request_status as enum (
  'new',
  'in_review',
  'quoted',
  'converted',
  'closed',
  'rejected',
  'expired'
);

create type public.room_hold_status as enum (
  'active',
  'converted',
  'released',
  'expired',
  'cancelled'
);

create type public.reservation_status as enum (
  'draft',
  'pending_deposit',
  'confirmed',
  'cancelled',
  'completed'
);

create type public.reservation_room_item_status as enum (
  'active',
  'released',
  'cancelled'
);

create or replace function public.make_workflow_code(prefix text)
returns text
language plpgsql
as $$
begin
  return upper(prefix) || '-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10);
end;
$$;

create or replace function public.has_internal_access()
returns boolean
language sql
stable
as $$
  select auth.role() in ('authenticated', 'service_role');
$$;

create table public.availability_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique default public.make_workflow_code('AR'),
  customer_id uuid references public.customers(id) on delete set null,
  branch_id uuid not null references public.branches(id) on delete restrict,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  stay_start_at timestamptz not null,
  stay_end_at timestamptz not null,
  guest_count integer not null default 1 check (guest_count > 0),
  contact_name text not null,
  contact_email citext not null,
  contact_phone text,
  note text not null default '',
  marketing_consent boolean not null default false,
  preferred_locale text not null default 'vi' check (preferred_locale in ('vi', 'en')),
  source text not null default 'public_site',
  status public.availability_request_status not null default 'new',
  response_due_at timestamptz not null default (now() + interval '30 minutes'),
  assigned_to uuid references auth.users(id) on delete set null,
  handled_by uuid references auth.users(id) on delete set null,
  handled_at timestamptz,
  closed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stay_end_at > stay_start_at)
);

create index availability_requests_branch_status_idx
  on public.availability_requests (branch_id, status, created_at desc);

create index availability_requests_room_type_idx
  on public.availability_requests (room_type_id, status, created_at desc);

create index availability_requests_response_due_idx
  on public.availability_requests (response_due_at, status);

create table public.room_holds (
  id uuid primary key default gen_random_uuid(),
  hold_code text not null unique default public.make_workflow_code('HOLD'),
  availability_request_id uuid references public.availability_requests(id) on delete set null,
  reservation_id uuid,
  customer_id uuid references public.customers(id) on delete set null,
  branch_id uuid not null references public.branches(id) on delete restrict,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  stay_start_at timestamptz not null,
  stay_end_at timestamptz not null,
  hold_window tstzrange generated always as (tstzrange(stay_start_at, stay_end_at, '[)')) stored,
  expires_at timestamptz not null,
  status public.room_hold_status not null default 'active',
  release_reason text not null default '',
  notes text not null default '',
  held_by uuid references auth.users(id) on delete set null,
  converted_at timestamptz,
  released_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stay_end_at > stay_start_at),
  check (expires_at > created_at)
);

create index room_holds_room_status_idx
  on public.room_holds (room_id, status, expires_at);

create index room_holds_branch_status_idx
  on public.room_holds (branch_id, status, created_at desc);

create index room_holds_request_idx
  on public.room_holds (availability_request_id, status);

create index room_holds_active_window_exclusion_idx
  on public.room_holds using gist (room_id, hold_window)
  where (status = 'active');

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default public.make_workflow_code('RES'),
  availability_request_id uuid references public.availability_requests(id) on delete set null,
  hold_id uuid references public.room_holds(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  primary_room_type_id uuid not null references public.room_types(id) on delete restrict,
  stay_start_at timestamptz not null,
  stay_end_at timestamptz not null,
  reservation_window tstzrange generated always as (tstzrange(stay_start_at, stay_end_at, '[)')) stored,
  guest_count integer not null default 1 check (guest_count > 0),
  status public.reservation_status not null default 'pending_deposit',
  base_price numeric(12,2) not null default 0,
  weekend_surcharge numeric(12,2) not null default 0,
  manual_override_price numeric(12,2),
  nightly_rate numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  source text not null default 'staff_manual',
  notes text not null default '',
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stay_end_at > stay_start_at)
);

create index reservations_branch_status_idx
  on public.reservations (branch_id, status, created_at desc);

create index reservations_customer_idx
  on public.reservations (customer_id, status, created_at desc);

create index reservations_request_idx
  on public.reservations (availability_request_id, hold_id, status);

alter table public.room_holds
  add constraint room_holds_reservation_id_fkey
  foreign key (reservation_id) references public.reservations(id) on delete set null;

create table public.reservation_room_items (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  stay_start_at timestamptz not null,
  stay_end_at timestamptz not null,
  stay_window tstzrange generated always as (tstzrange(stay_start_at, stay_end_at, '[)')) stored,
  sort_order integer not null default 0,
  status public.reservation_room_item_status not null default 'active',
  nightly_rate numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stay_end_at > stay_start_at)
);

create index reservation_room_items_reservation_idx
  on public.reservation_room_items (reservation_id, sort_order);

create index reservation_room_items_room_status_idx
  on public.reservation_room_items (room_id, status, stay_start_at, stay_end_at);

create index reservation_room_items_room_type_idx
  on public.reservation_room_items (room_type_id, status);

create index reservation_room_items_active_window_exclusion_idx
  on public.reservation_room_items using gist (room_id, stay_window)
  where (status = 'active');

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique default public.make_workflow_code('AUD'),
  action text not null,
  summary text not null,
  entity_type text not null,
  entity_id uuid,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  hold_id uuid references public.room_holds(id) on delete set null,
  reservation_id uuid references public.reservations(id) on delete set null,
  availability_request_id uuid references public.availability_requests(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  metadata jsonb not null default '{}'::jsonb,
  happened_at timestamptz not null default now()
);

create index audit_logs_branch_time_idx
  on public.audit_logs (branch_id, happened_at desc);

create index audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id, happened_at desc);

create index audit_logs_action_idx
  on public.audit_logs (action, happened_at desc);

create trigger set_availability_requests_updated_at
before update on public.availability_requests
for each row
execute function public.set_updated_at();

create trigger set_room_holds_updated_at
before update on public.room_holds
for each row
execute function public.set_updated_at();

create trigger set_reservations_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

create trigger set_reservation_room_items_updated_at
before update on public.reservation_room_items
for each row
execute function public.set_updated_at();

alter table public.availability_requests enable row level security;
alter table public.room_holds enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_room_items enable row level security;
alter table public.audit_logs enable row level security;

create policy "Internal users can create availability requests"
  on public.availability_requests
  for insert
  with check (public.has_internal_access());

create policy "Internal users can read availability requests"
  on public.availability_requests
  for select
  using (public.has_internal_access());

create policy "Customers can read their own availability requests"
  on public.availability_requests
  for select
  using (
    exists (
      select 1
      from public.customers customers
      where customers.id = availability_requests.customer_id
        and customers.auth_user_id = auth.uid()
    )
  );

create policy "Internal users can manage availability requests"
  on public.availability_requests
  for update
  using (public.has_internal_access())
  with check (public.has_internal_access());

create policy "Internal users can manage room holds"
  on public.room_holds
  for all
  using (public.has_internal_access())
  with check (public.has_internal_access());

create policy "Customers can read their own room holds"
  on public.room_holds
  for select
  using (
    exists (
      select 1
      from public.customers customers
      where customers.id = room_holds.customer_id
        and customers.auth_user_id = auth.uid()
    )
  );

create policy "Internal users can manage reservations"
  on public.reservations
  for all
  using (public.has_internal_access())
  with check (public.has_internal_access());

create policy "Customers can read their own reservations"
  on public.reservations
  for select
  using (
    exists (
      select 1
      from public.customers customers
      where customers.id = reservations.customer_id
        and customers.auth_user_id = auth.uid()
    )
  );

create policy "Internal users can manage reservation room items"
  on public.reservation_room_items
  for all
  using (public.has_internal_access())
  with check (public.has_internal_access());

create policy "Customers can read their own reservation room items"
  on public.reservation_room_items
  for select
  using (
    exists (
      select 1
      from public.reservations reservations
      join public.customers customers on customers.id = reservations.customer_id
      where reservations.id = reservation_room_items.reservation_id
        and customers.auth_user_id = auth.uid()
    )
  );

create policy "Internal users can read audit logs"
  on public.audit_logs
  for select
  using (public.has_internal_access());

create or replace function public.log_audit_event(
  p_action text,
  p_summary text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_branch_id uuid default null,
  p_customer_id uuid default null,
  p_room_id uuid default null,
  p_hold_id uuid default null,
  p_reservation_id uuid default null,
  p_availability_request_id uuid default null,
  p_actor_user_id uuid default null,
  p_actor_role text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.audit_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.audit_logs;
begin
  if not public.has_internal_access() then
    raise exception 'Audit logging is restricted to internal access.';
  end if;

  insert into public.audit_logs (
    action,
    summary,
    entity_type,
    entity_id,
    branch_id,
    customer_id,
    room_id,
    hold_id,
    reservation_id,
    availability_request_id,
    actor_user_id,
    actor_role,
    metadata
  ) values (
    p_action,
    p_summary,
    p_entity_type,
    p_entity_id,
    p_branch_id,
    p_customer_id,
    p_room_id,
    p_hold_id,
    p_reservation_id,
    p_availability_request_id,
    p_actor_user_id,
    p_actor_role,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.audit_availability_request_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    action,
    summary,
    entity_type,
    entity_id,
    branch_id,
    customer_id,
    hold_id,
    availability_request_id,
    actor_user_id,
    actor_role,
    metadata
  ) values (
    'availability_request.created',
    'Availability request created',
    'availability_request',
    new.id,
    new.branch_id,
    new.customer_id,
    null,
    new.id,
    coalesce(auth.uid(), new.created_by),
    auth.role(),
    jsonb_build_object(
      'request_code', new.request_code,
      'status', new.status,
      'source', new.source
    )
  );

  return new;
end;
$$;

create or replace function public.submit_availability_request(
  p_branch_id uuid,
  p_room_type_id uuid,
  p_stay_start_at timestamptz,
  p_stay_end_at timestamptz,
  p_contact_name text,
  p_contact_email citext,
  p_guest_count integer default 1,
  p_contact_phone text default null,
  p_note text default '',
  p_marketing_consent boolean default false,
  p_preferred_locale text default 'vi',
  p_source text default 'public_site',
  p_created_by uuid default null
)
returns public.availability_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers;
  v_request public.availability_requests;
begin
  if p_stay_end_at <= p_stay_start_at then
    raise exception 'Availability request stay window is invalid.';
  end if;

  insert into public.customers (
    auth_user_id,
    full_name,
    email,
    phone,
    preferred_locale,
    marketing_consent,
    marketing_consent_at,
    marketing_consent_source,
    source,
    notes
  ) values (
    p_created_by,
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    coalesce(p_preferred_locale, 'vi'),
    coalesce(p_marketing_consent, false),
    case
      when coalesce(p_marketing_consent, false) then now()
      else null
    end,
    case
      when coalesce(p_marketing_consent, false) then 'availability_request'
      else null
    end,
    coalesce(p_source, 'public_site'),
    coalesce(p_note, '')
  )
  on conflict (email) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    preferred_locale = excluded.preferred_locale,
    marketing_consent = excluded.marketing_consent,
    marketing_consent_at = excluded.marketing_consent_at,
    marketing_consent_source = excluded.marketing_consent_source,
    source = excluded.source,
    notes = excluded.notes,
    updated_at = now()
  returning * into v_customer;

  insert into public.availability_requests (
    customer_id,
    branch_id,
    room_type_id,
    stay_start_at,
    stay_end_at,
    guest_count,
    contact_name,
    contact_email,
    contact_phone,
    note,
    marketing_consent,
    preferred_locale,
    source,
    status,
    created_by,
    updated_by
  ) values (
    v_customer.id,
    p_branch_id,
    p_room_type_id,
    p_stay_start_at,
    p_stay_end_at,
    greatest(coalesce(p_guest_count, 1), 1),
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    coalesce(p_note, ''),
    coalesce(p_marketing_consent, false),
    coalesce(p_preferred_locale, 'vi'),
    coalesce(p_source, 'public_site'),
    'new',
    p_created_by,
    p_created_by
  )
  returning * into v_request;

  return v_request;
end;
$$;

create trigger audit_availability_requests_after_insert
after insert on public.availability_requests
for each row
execute function public.audit_availability_request_insert();

create or replace function public.find_available_rooms(
  p_branch_id uuid default null,
  p_room_type_id uuid default null,
  p_stay_start_at timestamptz default null,
  p_stay_end_at timestamptz default null,
  p_limit integer default 12
)
returns setof public.rooms
language sql
security definer
set search_path = public
as $$
  select rooms.*
  from public.rooms rooms
  where rooms.is_active = true
    and rooms.status = 'available'
    and (p_branch_id is null or rooms.branch_id = p_branch_id)
    and (p_room_type_id is null or rooms.room_type_id = p_room_type_id)
    and (
      p_stay_start_at is null
      or p_stay_end_at is null
      or not exists (
        select 1
        from public.room_holds holds
        where holds.room_id = rooms.id
          and holds.status = 'active'
          and holds.hold_window && tstzrange(p_stay_start_at, p_stay_end_at, '[)')
      )
    )
    and (
      p_stay_start_at is null
      or p_stay_end_at is null
      or not exists (
        select 1
        from public.reservation_room_items items
        join public.reservations reservations
          on reservations.id = items.reservation_id
        where items.room_id = rooms.id
          and items.status = 'active'
          and reservations.status in ('draft', 'pending_deposit', 'confirmed')
          and items.stay_window && tstzrange(p_stay_start_at, p_stay_end_at, '[)')
      )
    )
  order by rooms.code asc
  limit greatest(coalesce(p_limit, 12), 1);
$$;

create or replace function public.create_room_hold(
  p_branch_id uuid,
  p_room_type_id uuid,
  p_room_id uuid,
  p_stay_start_at timestamptz,
  p_stay_end_at timestamptz,
  p_hold_minutes integer default 30,
  p_availability_request_id uuid default null,
  p_customer_id uuid default null,
  p_notes text default '',
  p_held_by uuid default null,
  p_created_by uuid default null,
  p_actor_role text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.room_holds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_hold public.room_holds;
  v_window tstzrange;
  v_actor_user_id uuid;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to create holds.';
  end if;

  if p_stay_end_at <= p_stay_start_at then
    raise exception 'Hold stay window is invalid.';
  end if;

  if coalesce(p_hold_minutes, 0) <= 0 then
    raise exception 'Hold expiry must be greater than zero minutes.';
  end if;

  v_window := tstzrange(p_stay_start_at, p_stay_end_at, '[)');
  v_actor_user_id := coalesce(p_created_by, p_held_by);

  select *
  into v_room
  from public.rooms
  where id = p_room_id
    and is_active = true
    and status = 'available'
  for update;

  if not found then
    raise exception 'Room is not available for hold creation.';
  end if;

  if v_room.branch_id <> p_branch_id or v_room.room_type_id <> p_room_type_id then
    raise exception 'Room does not match the requested branch or room type.';
  end if;

  if exists (
    select 1
    from public.room_holds holds
    where holds.room_id = p_room_id
      and holds.status = 'active'
      and holds.hold_window && v_window
  ) then
    raise exception 'The room is already on hold for the requested stay window.';
  end if;

  if exists (
    select 1
    from public.reservation_room_items items
    join public.reservations reservations
      on reservations.id = items.reservation_id
    where items.room_id = p_room_id
      and items.status = 'active'
      and reservations.status in ('draft', 'pending_deposit', 'confirmed')
      and items.stay_window && v_window
  ) then
    raise exception 'The room already has an overlapping reservation.';
  end if;

  insert into public.room_holds (
    availability_request_id,
    customer_id,
    branch_id,
    room_type_id,
    room_id,
    stay_start_at,
    stay_end_at,
    expires_at,
    status,
    release_reason,
    notes,
    held_by,
    created_by,
    updated_by
  ) values (
    p_availability_request_id,
    p_customer_id,
    p_branch_id,
    p_room_type_id,
    p_room_id,
    p_stay_start_at,
    p_stay_end_at,
    now() + make_interval(mins => greatest(p_hold_minutes, 1)),
    'active',
    '',
    coalesce(p_notes, ''),
    coalesce(p_held_by, p_created_by),
    p_created_by,
    p_created_by
  )
  returning * into v_hold;

  if p_availability_request_id is not null then
    update public.availability_requests
    set status = 'converted',
        handled_by = coalesce(handled_by, p_created_by),
        handled_at = coalesce(handled_at, now()),
        updated_by = p_created_by
    where id = p_availability_request_id;
  end if;

  perform public.log_audit_event(
    'hold.created',
    'Room hold created',
    'room_hold',
    v_hold.id,
    p_branch_id,
    p_customer_id,
    p_room_id,
    v_hold.id,
    null,
    p_availability_request_id,
    v_actor_user_id,
    p_actor_role,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'hold_code', v_hold.hold_code,
      'expires_at', v_hold.expires_at
    )
  );

  return v_hold;
end;
$$;

create or replace function public.create_reservation(
  p_customer_id uuid default null,
  p_branch_id uuid default null,
  p_primary_room_type_id uuid default null,
  p_room_id uuid default null,
  p_stay_start_at timestamptz default null,
  p_stay_end_at timestamptz default null,
  p_guest_count integer default 1,
  p_status public.reservation_status default 'pending_deposit',
  p_hold_id uuid default null,
  p_availability_request_id uuid default null,
  p_base_price numeric default 0,
  p_weekend_surcharge numeric default 0,
  p_manual_override_price numeric default null,
  p_nightly_rate numeric default 0,
  p_total_amount numeric default 0,
  p_deposit_amount numeric default 0,
  p_notes text default '',
  p_created_by uuid default null,
  p_actor_role text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_hold public.room_holds;
  v_reservation public.reservations;
  v_request_id uuid;
  v_window tstzrange;
  v_actor_user_id uuid := p_created_by;
  v_customer_id uuid := p_customer_id;
  v_branch_id uuid := p_branch_id;
  v_room_type_id uuid := p_primary_room_type_id;
  v_stay_start_at timestamptz := p_stay_start_at;
  v_stay_end_at timestamptz := p_stay_end_at;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to create reservations.';
  end if;

  if p_hold_id is not null then
    select *
    into v_hold
    from public.room_holds
    where id = p_hold_id
    for update;

    if not found then
      raise exception 'Hold not found.';
    end if;

    if v_hold.status <> 'active' then
      raise exception 'Hold is not active.';
    end if;

    v_customer_id := coalesce(v_customer_id, v_hold.customer_id);
    v_branch_id := coalesce(v_branch_id, v_hold.branch_id);
    v_room_type_id := coalesce(v_room_type_id, v_hold.room_type_id);
    v_stay_start_at := v_hold.stay_start_at;
    v_stay_end_at := v_hold.stay_end_at;
    v_request_id := coalesce(p_availability_request_id, v_hold.availability_request_id);
    p_room_id := v_hold.room_id;
  else
    v_request_id := p_availability_request_id;
  end if;

  if v_customer_id is null then
    raise exception 'Reservation requires a customer.';
  end if;

  if v_branch_id is null or v_room_type_id is null or p_room_id is null or v_stay_start_at is null or v_stay_end_at is null then
    raise exception 'Reservation requires room, branch, room type, and stay window data.';
  end if;

  if v_stay_end_at <= v_stay_start_at then
    raise exception 'Reservation stay window is invalid.';
  end if;

  v_window := tstzrange(v_stay_start_at, v_stay_end_at, '[)');

  select *
  into v_room
  from public.rooms
  where id = p_room_id
    and is_active = true
    and status = 'available'
  for update;

  if not found then
    raise exception 'Room is not available for reservation creation.';
  end if;

  if v_room.branch_id <> v_branch_id or v_room.room_type_id <> v_room_type_id then
    raise exception 'Room does not match the requested reservation scope.';
  end if;

  if exists (
    select 1
    from public.room_holds holds
    where holds.room_id = p_room_id
      and holds.status = 'active'
      and holds.id <> coalesce(p_hold_id, holds.id)
      and holds.hold_window && v_window
  ) then
    raise exception 'The room already has an overlapping hold.';
  end if;

  if exists (
    select 1
    from public.reservation_room_items items
    join public.reservations reservations
      on reservations.id = items.reservation_id
    where items.room_id = p_room_id
      and items.status = 'active'
      and reservations.status in ('draft', 'pending_deposit', 'confirmed')
      and items.stay_window && v_window
  ) then
    raise exception 'The room already has an overlapping reservation.';
  end if;

  insert into public.reservations (
    availability_request_id,
    hold_id,
    customer_id,
    branch_id,
    primary_room_type_id,
    stay_start_at,
    stay_end_at,
    guest_count,
    status,
    base_price,
    weekend_surcharge,
    manual_override_price,
    nightly_rate,
    total_amount,
    deposit_amount,
    notes,
    created_by,
    updated_by
  ) values (
    v_request_id,
    p_hold_id,
    v_customer_id,
    v_branch_id,
    v_room_type_id,
    v_stay_start_at,
    v_stay_end_at,
    greatest(coalesce(p_guest_count, 1), 1),
    p_status,
    coalesce(p_base_price, 0),
    coalesce(p_weekend_surcharge, 0),
    p_manual_override_price,
    coalesce(p_nightly_rate, 0),
    coalesce(p_total_amount, 0),
    coalesce(p_deposit_amount, 0),
    coalesce(p_notes, ''),
    p_created_by,
    p_created_by
  )
  returning * into v_reservation;

  insert into public.reservation_room_items (
    reservation_id,
    room_id,
    room_type_id,
    stay_start_at,
    stay_end_at,
    sort_order,
    status,
    nightly_rate,
    total_amount,
    notes
  ) values (
    v_reservation.id,
    p_room_id,
    v_room_type_id,
    v_stay_start_at,
    v_stay_end_at,
    1,
    'active',
    coalesce(p_nightly_rate, 0),
    coalesce(p_total_amount, 0),
    coalesce(p_notes, '')
  );

  if p_hold_id is not null then
    update public.room_holds
    set status = 'converted',
        reservation_id = v_reservation.id,
        converted_at = now(),
        updated_by = p_created_by
    where id = p_hold_id;
  end if;

  if v_request_id is not null then
    update public.availability_requests
    set status = 'converted',
        handled_by = coalesce(handled_by, p_created_by),
        handled_at = coalesce(handled_at, now()),
        closed_at = coalesce(closed_at, now()),
        updated_by = p_created_by
    where id = v_request_id;
  end if;

  perform public.log_audit_event(
    'reservation.created',
    'Reservation created',
    'reservation',
    v_reservation.id,
    v_branch_id,
    v_customer_id,
    p_room_id,
    p_hold_id,
    v_reservation.id,
    v_request_id,
    v_actor_user_id,
    p_actor_role,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'booking_code', v_reservation.booking_code,
      'status', v_reservation.status
    )
  );

  return v_reservation;
end;
$$;

create or replace function public.release_expired_holds(p_as_of timestamptz default now())
returns table (
  hold_id uuid,
  hold_code text,
  room_id uuid,
  branch_id uuid,
  status public.room_hold_status,
  expires_at timestamptz,
  released_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hold public.room_holds;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to release expired holds.';
  end if;

  for v_hold in
    update public.room_holds
    set status = 'expired',
        release_reason = 'expired',
        released_at = coalesce(released_at, p_as_of),
        updated_at = now()
    where status = 'active'
      and expires_at <= p_as_of
    returning *
  loop
    update public.availability_requests
    set status = case
          when status in ('new', 'in_review', 'quoted') then 'expired'
          else status
        end,
        closed_at = coalesce(closed_at, p_as_of),
        updated_at = now()
    where id = v_hold.availability_request_id;

    perform public.log_audit_event(
      'hold.expired',
      'Room hold expired',
      'room_hold',
      v_hold.id,
      v_hold.branch_id,
      v_hold.customer_id,
      v_hold.room_id,
      v_hold.id,
      v_hold.reservation_id,
      v_hold.availability_request_id,
      null,
      'system',
      jsonb_build_object(
        'hold_code', v_hold.hold_code,
        'expires_at', v_hold.expires_at
      )
    );

    hold_id := v_hold.id;
    hold_code := v_hold.hold_code;
    room_id := v_hold.room_id;
    branch_id := v_hold.branch_id;
    status := v_hold.status;
    expires_at := v_hold.expires_at;
    released_at := v_hold.released_at;
    return next;
  end loop;
end;
$$;

revoke all on function public.submit_availability_request(
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  text,
  citext,
  integer,
  text,
  text,
  boolean,
  text,
  text,
  uuid
) from public;

grant execute on function public.submit_availability_request(
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  text,
  citext,
  integer,
  text,
  text,
  boolean,
  text,
  text,
  uuid
) to anon, authenticated, service_role;

revoke all on function public.find_available_rooms(
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  integer
) from public;

grant execute on function public.find_available_rooms(
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  integer
) to anon, authenticated, service_role;

revoke all on function public.log_audit_event(
  text,
  text,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  jsonb
) from public;

grant execute on function public.log_audit_event(
  text,
  text,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  jsonb
) to authenticated, service_role;

revoke all on function public.create_room_hold(
  uuid,
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  integer,
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  text,
  jsonb
) from public;

grant execute on function public.create_room_hold(
  uuid,
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  integer,
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  text,
  jsonb
) to authenticated, service_role;

revoke all on function public.create_reservation(
  uuid,
  uuid,
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  integer,
  public.reservation_status,
  uuid,
  uuid,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  uuid,
  text,
  jsonb
) from public;

grant execute on function public.create_reservation(
  uuid,
  uuid,
  uuid,
  uuid,
  timestamptz,
  timestamptz,
  integer,
  public.reservation_status,
  uuid,
  uuid,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  uuid,
  text,
  jsonb
) to authenticated, service_role;

revoke all on function public.release_expired_holds(timestamptz) from public;

grant execute on function public.release_expired_holds(timestamptz) to authenticated, service_role;
