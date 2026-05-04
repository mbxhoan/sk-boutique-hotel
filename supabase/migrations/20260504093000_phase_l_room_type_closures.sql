-- Phase L: Temporary closures for room types.
-- Lets staff close an entire room type for a date range; all rooms of that type
-- become unavailable for hold/reservation/booking inside the closed window,
-- while the public detail page still renders.

create type public.room_type_closure_status as enum (
  'active',
  'cancelled'
);

create table public.room_type_closures (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  closure_window tstzrange generated always as (tstzrange(start_at, end_at, '[)')) stored,
  status public.room_type_closure_status not null default 'active',
  reason text not null default '',
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index room_type_closures_type_status_idx
  on public.room_type_closures (room_type_id, status, start_at, end_at);

create index room_type_closures_branch_idx
  on public.room_type_closures (branch_id, status, start_at, end_at);

create index room_type_closures_active_window_idx
  on public.room_type_closures using gist (room_type_id, closure_window)
  where (status = 'active');

create trigger set_room_type_closures_updated_at
before update on public.room_type_closures
for each row
execute function public.set_updated_at();

alter table public.room_type_closures enable row level security;

create policy "Internal users can manage room type closures"
  on public.room_type_closures
  for all
  using (public.has_internal_access())
  with check (public.has_internal_access());

create policy "Public can read active room type closures"
  on public.room_type_closures
  for select
  using (status = 'active');

create or replace function public.room_type_is_closed(
  p_room_type_id uuid,
  p_branch_id uuid,
  p_stay_start_at timestamptz,
  p_stay_end_at timestamptz
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select case
    when p_room_type_id is null or p_stay_start_at is null or p_stay_end_at is null then false
    else exists (
      select 1
      from public.room_type_closures closures
      where closures.status = 'active'
        and closures.room_type_id = p_room_type_id
        and (closures.branch_id is null or p_branch_id is null or closures.branch_id = p_branch_id)
        and closures.closure_window && tstzrange(p_stay_start_at, p_stay_end_at, '[)')
    )
  end;
$$;

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
      or not public.room_type_is_closed(rooms.room_type_id, rooms.branch_id, p_stay_start_at, p_stay_end_at)
    )
    and (
      p_stay_start_at is null
      or p_stay_end_at is null
      or not public.room_has_blocking_reservation(rooms.id, p_stay_start_at, p_stay_end_at)
    )
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
  order by rooms.code asc
  limit greatest(coalesce(p_limit, 12), 1);
$$;

create or replace function public.list_room_type_closure_overlaps(
  p_stay_start_at timestamptz,
  p_stay_end_at timestamptz,
  p_branch_id uuid default null
)
returns table (
  room_type_id uuid,
  branch_id uuid
)
language sql
security definer
stable
set search_path = public
as $$
  select distinct closures.room_type_id, closures.branch_id
  from public.room_type_closures closures
  where closures.status = 'active'
    and (p_branch_id is null or closures.branch_id is null or closures.branch_id = p_branch_id)
    and closures.closure_window && tstzrange(coalesce(p_stay_start_at, now()), coalesce(p_stay_end_at, now() + interval '1 day'), '[)');
$$;

create or replace function public.create_room_type_closure(
  p_room_type_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_branch_id uuid default null,
  p_reason text default '',
  p_created_by uuid default null
)
returns public.room_type_closures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.room_type_closures;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to create room type closures.';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'Closure window is invalid.';
  end if;

  insert into public.room_type_closures (
    room_type_id,
    branch_id,
    start_at,
    end_at,
    reason,
    created_by,
    updated_by
  ) values (
    p_room_type_id,
    p_branch_id,
    p_start_at,
    p_end_at,
    coalesce(p_reason, ''),
    p_created_by,
    p_created_by
  )
  returning * into v_row;

  perform public.log_audit_event(
    'room_type_closure.created',
    'Room type closure created',
    'room_type_closure',
    v_row.id,
    p_branch_id,
    null,
    null,
    null,
    null,
    null,
    p_created_by,
    'staff',
    jsonb_build_object(
      'room_type_id', p_room_type_id,
      'start_at', p_start_at,
      'end_at', p_end_at,
      'reason', coalesce(p_reason, '')
    )
  );

  return v_row;
end;
$$;

create or replace function public.cancel_room_type_closure(
  p_closure_id uuid,
  p_cancelled_by uuid default null
)
returns public.room_type_closures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.room_type_closures;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to cancel room type closures.';
  end if;

  update public.room_type_closures
  set status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now()),
      cancelled_by = coalesce(cancelled_by, p_cancelled_by),
      updated_by = coalesce(p_cancelled_by, updated_by)
  where id = p_closure_id
    and status = 'active'
  returning * into v_row;

  if not found then
    raise exception 'Room type closure not found or already cancelled.';
  end if;

  perform public.log_audit_event(
    'room_type_closure.cancelled',
    'Room type closure cancelled',
    'room_type_closure',
    v_row.id,
    v_row.branch_id,
    null,
    null,
    null,
    null,
    null,
    p_cancelled_by,
    'staff',
    jsonb_build_object(
      'room_type_id', v_row.room_type_id,
      'start_at', v_row.start_at,
      'end_at', v_row.end_at
    )
  );

  return v_row;
end;
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

  if public.room_type_is_closed(p_room_type_id, p_branch_id, p_stay_start_at, p_stay_end_at) then
    raise exception 'The room type is temporarily closed for the requested stay window.';
  end if;

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

  if public.room_has_blocking_reservation(p_room_id, p_stay_start_at, p_stay_end_at) then
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
    p_held_by,
    p_created_by,
    p_created_by
  )
  returning * into v_hold;

  perform public.log_audit_event(
    'hold.created',
    'Room hold created',
    'room_hold',
    v_hold.id,
    p_branch_id,
    p_customer_id,
    p_room_id,
    null,
    null,
    p_availability_request_id,
    v_actor_user_id,
    jsonb_build_object(
      'hold_code', v_hold.hold_code,
      'room_id', p_room_id,
      'room_type_id', p_room_type_id,
      'stay_start_at', p_stay_start_at,
      'stay_end_at', p_stay_end_at,
      'expires_at', v_hold.expires_at,
      'actor_role', p_actor_role,
      'metadata', coalesce(p_metadata, '{}'::jsonb)
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
  p_metadata jsonb default '{}'::jsonb,
  p_expires_at timestamptz default null
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
  v_expires_at timestamptz := case
    when p_status in ('draft', 'pending_deposit') then coalesce(p_expires_at, now() + interval '30 minutes')
    else p_expires_at
  end;
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

  if public.room_type_is_closed(v_room_type_id, v_branch_id, v_stay_start_at, v_stay_end_at) then
    raise exception 'The room type is temporarily closed for the requested stay window.';
  end if;

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

  if public.room_has_blocking_reservation(p_room_id, v_stay_start_at, v_stay_end_at) then
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

revoke all on function public.room_type_is_closed(uuid, uuid, timestamptz, timestamptz) from public;
grant execute on function public.room_type_is_closed(uuid, uuid, timestamptz, timestamptz) to anon, authenticated, service_role;

revoke all on function public.list_room_type_closure_overlaps(timestamptz, timestamptz, uuid) from public;
grant execute on function public.list_room_type_closure_overlaps(timestamptz, timestamptz, uuid) to anon, authenticated, service_role;

revoke all on function public.create_room_type_closure(uuid, timestamptz, timestamptz, uuid, text, uuid) from public;
grant execute on function public.create_room_type_closure(uuid, timestamptz, timestamptz, uuid, text, uuid) to authenticated, service_role;

revoke all on function public.cancel_room_type_closure(uuid, uuid) from public;
grant execute on function public.cancel_room_type_closure(uuid, uuid) to authenticated, service_role;
