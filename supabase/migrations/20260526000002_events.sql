-- Events: each event is a campaign/occasion with images
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_vi text not null,
  title_en text not null,
  description_vi text not null default '',
  description_en text not null default '',
  cover_image_path text,
  event_date date,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event images: each event can have multiple images
create table public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_path text not null,
  caption_vi text not null default '',
  caption_en text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index events_is_published_sort on public.events (is_published, sort_order);
create index event_images_event_id_sort on public.event_images (event_id, sort_order);

-- RLS
alter table public.events enable row level security;
alter table public.event_images enable row level security;

-- Public read access for published events
create policy "events_public_select" on public.events
  for select to anon using (is_published = true);
create policy "event_images_public_select" on public.event_images
  for select to anon using (true);

-- Admin full access
create policy "events_auth_all" on public.events
  for all to authenticated using (true) with check (true);
create policy "event_images_auth_all" on public.event_images
  for all to authenticated using (true) with check (true);

-- Auto-update updated_at on events
create or replace function public.update_events_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.update_events_updated_at();

-- Storage bucket for uploaded event images
insert into storage.buckets (id, name, public) values ('event-images', 'event-images', true)
  on conflict (id) do nothing;

create policy "event_images_anon_select" on storage.objects
  for select to anon using (bucket_id = 'event-images');
create policy "event_images_auth_all" on storage.objects
  for all to authenticated using (bucket_id = 'event-images') with check (bucket_id = 'event-images');

-- Seed: Summer Together 2026
insert into public.events (slug, title_vi, title_en, description_vi, description_en, cover_image_path, event_date, is_published, sort_order)
values (
  'summer-together-2026',
  'Summer Together 2026',
  'Summer Together 2026',
  'Lễ hội mùa hè đặc biệt tại SK Boutique Hotel — nơi những kỷ niệm mùa hè được tạo nên cùng nhau. Tận hưởng không gian resort xanh mát, các hoạt động vui chơi, ẩm thực phong phú và những trải nghiệm độc đáo chỉ có tại Phú Quốc.',
  'A special summer festival at SK Boutique Hotel — where summer memories are made together. Enjoy lush resort grounds, fun activities, diverse cuisine, and unique experiences only at Phu Quoc.',
  '/events/2026-summer-together.png',
  '2026-06-21',
  true,
  0
);

insert into public.event_images (event_id, image_path, caption_vi, caption_en, sort_order)
select id, '/events/2026-summer-together.png', 'Summer Together 2026', 'Summer Together 2026', 0
from public.events where slug = 'summer-together-2026';
