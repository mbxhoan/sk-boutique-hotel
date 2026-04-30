-- Keep historical stay windows consistent across availability, hold, and reservation overlap checks.
-- Completed reservations should still count when the requested stay window overlaps their room usage.

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
          and reservations.status in ('draft', 'pending_deposit', 'confirmed', 'completed')
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
      and reservations.status in ('draft', 'pending_deposit', 'confirmed', 'completed')
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
      and reservations.status in ('draft', 'pending_deposit', 'confirmed', 'completed')
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
    jsonb_build_object(
      'booking_code', v_reservation.booking_code,
      'status', v_reservation.status,
      'expires_at', v_reservation.expires_at,
      'actor_role', p_actor_role,
      'metadata', coalesce(p_metadata, '{}'::jsonb)
    )
  );

  return v_reservation;
end;
$$;
