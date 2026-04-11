-- Phase E extension: analytics events for public site and admin visibility.

create type public.analytics_event_type as enum (
  'page_view',
  'room_view',
  'branch_view',
  'cta_click',
  'gallery_click',
  'check_availability_click',
  'hold_room_click',
  'map_click',
  'payment_upload'
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type public.analytics_event_type not null,
  entity_type text not null default '',
  entity_id text,
  page_path text not null default '',
  branch_id uuid references public.branches(id) on delete set null,
  room_type_id uuid references public.room_types(id) on delete set null,
  reservation_id uuid references public.reservations(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  locale text not null default 'vi',
  source text not null default 'website',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index analytics_events_type_occurred_idx
  on public.analytics_events (event_type, occurred_at desc);

create index analytics_events_branch_idx
  on public.analytics_events (branch_id, occurred_at desc);

create index analytics_events_room_type_idx
  on public.analytics_events (room_type_id, occurred_at desc);

create index analytics_events_customer_idx
  on public.analytics_events (customer_id, occurred_at desc);

create index analytics_events_reservation_idx
  on public.analytics_events (reservation_id, occurred_at desc);

create trigger set_analytics_events_updated_at
before update on public.analytics_events
for each row
execute function public.set_updated_at();

alter table public.analytics_events enable row level security;

comment on table public.analytics_events is 'Public website and portal analytics events for operational and marketing visibility.';
