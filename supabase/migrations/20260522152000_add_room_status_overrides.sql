create extension if not exists "btree_gist";

create type public.room_status_override_status as enum (
  'occupied',
  'cleaning',
  'maintenance'
);

create table public.room_status_overrides (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  status public.room_status_override_status not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status_window tstzrange generated always as (tstzrange(start_at, end_at, '[)')) stored,
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index room_status_overrides_room_status_idx
  on public.room_status_overrides (room_id, status, start_at, end_at);

create index room_status_overrides_branch_status_idx
  on public.room_status_overrides (branch_id, status, start_at, end_at);

create index room_status_overrides_active_window_idx
  on public.room_status_overrides using gist (room_id, status_window);

alter table public.room_status_overrides
  add constraint room_status_overrides_no_overlap
  exclude using gist (room_id with =, status_window with &&);

create trigger set_room_status_overrides_updated_at
before update on public.room_status_overrides
for each row
execute function public.set_updated_at();

alter table public.room_status_overrides enable row level security;

create policy "Internal users can manage room status overrides"
  on public.room_status_overrides
  for all
  using (public.has_internal_access())
  with check (public.has_internal_access());

create or replace function public.room_has_status_override(
  p_room_id uuid,
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
    when p_room_id is null or p_stay_start_at is null or p_stay_end_at is null then false
    else exists (
      select 1
      from public.room_status_overrides overrides
      where overrides.room_id = p_room_id
        and overrides.status_window && tstzrange(p_stay_start_at, p_stay_end_at, '[)')
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
      or not public.room_has_status_override(rooms.id, p_stay_start_at, p_stay_end_at)
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

create or replace function public.set_room_status_override(
  p_room_id uuid,
  p_status public.room_status_override_status,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_note text default '',
  p_created_by uuid default null
)
returns public.room_status_overrides
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_row public.room_status_overrides;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to update room operational status.';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'Room status window is invalid.';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
    and is_active = true
  for update;

  if not found then
    raise exception 'Room was not found.';
  end if;

  if public.room_has_blocking_reservation(p_room_id, p_start_at, p_end_at) then
    raise exception 'Room already has a booking in the selected date range.';
  end if;

  if exists (
    select 1
    from public.room_holds holds
    where holds.room_id = p_room_id
      and holds.status = 'active'
      and holds.hold_window && tstzrange(p_start_at, p_end_at, '[)')
  ) then
    raise exception 'Room already has a hold in the selected date range.';
  end if;

  insert into public.room_status_overrides (
    room_id,
    branch_id,
    status,
    start_at,
    end_at,
    note,
    created_by,
    updated_by
  ) values (
    v_room.id,
    v_room.branch_id,
    p_status,
    p_start_at,
    p_end_at,
    coalesce(p_note, ''),
    p_created_by,
    p_created_by
  )
  returning *
  into v_row;

  return v_row;
exception
  when exclusion_violation then
    raise exception 'Room already has another manual status in the selected date range.';
end;
$$;

create or replace function public.clear_room_status_overrides(
  p_room_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_updated_by uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.room_status_overrides;
  v_affected integer := 0;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to clear room operational status.';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'Room status window is invalid.';
  end if;

  for v_row in
    select *
    from public.room_status_overrides overrides
    where overrides.room_id = p_room_id
      and overrides.status_window && tstzrange(p_start_at, p_end_at, '[)')
    order by overrides.start_at asc
    for update
  loop
    v_affected := v_affected + 1;

    if p_start_at <= v_row.start_at and p_end_at >= v_row.end_at then
      delete from public.room_status_overrides where id = v_row.id;
    elsif p_start_at <= v_row.start_at and p_end_at < v_row.end_at then
      update public.room_status_overrides
      set start_at = p_end_at,
          updated_by = p_updated_by
      where id = v_row.id;
    elsif p_start_at > v_row.start_at and p_end_at >= v_row.end_at then
      update public.room_status_overrides
      set end_at = p_start_at,
          updated_by = p_updated_by
      where id = v_row.id;
    else
      update public.room_status_overrides
      set end_at = p_start_at,
          updated_by = p_updated_by
      where id = v_row.id;

      insert into public.room_status_overrides (
        room_id,
        branch_id,
        status,
        start_at,
        end_at,
        note,
        created_by,
        updated_by
      ) values (
        v_row.room_id,
        v_row.branch_id,
        v_row.status,
        p_end_at,
        v_row.end_at,
        v_row.note,
        p_updated_by,
        p_updated_by
      );
    end if;
  end loop;

  return v_affected;
end;
$$;

comment on table public.room_status_overrides is 'Manual room operational statuses such as occupied, cleaning, or maintenance for a bounded time window.';
