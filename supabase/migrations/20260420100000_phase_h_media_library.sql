-- Phase H foundation: shared media library for the entire hotel app.

create extension if not exists "pgcrypto";

create table public.media_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_vi text not null,
  name_en text not null,
  description_vi text not null default '',
  description_en text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  collection_slug text not null references public.media_collections(slug) on delete cascade on update cascade,
  slug text not null,
  title_vi text not null default '',
  title_en text not null default '',
  alt_vi text not null default '',
  alt_en text not null default '',
  description_vi text not null default '',
  description_en text not null default '',
  file_bucket text not null default 'media-assets',
  file_path text unique,
  file_name text not null default '',
  mime_type text not null default '',
  file_size bigint not null default 0,
  fallback_url text not null default '',
  width integer,
  height integer,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_slug, slug)
);

create index media_collections_is_active_idx
  on public.media_collections (is_active, sort_order, updated_at desc);

create index media_assets_collection_active_idx
  on public.media_assets (collection_slug, is_active, is_featured, sort_order, updated_at desc);

create index media_assets_featured_idx
  on public.media_assets (collection_slug, is_featured, sort_order, updated_at desc);

create trigger set_media_collections_updated_at
before update on public.media_collections
for each row
execute function public.set_updated_at();

create trigger set_media_assets_updated_at
before update on public.media_assets
for each row
execute function public.set_updated_at();

alter table public.media_collections enable row level security;
alter table public.media_assets enable row level security;

create policy "Public can read active media collections"
  on public.media_collections
  for select
  using (is_active);

create policy "Internal users can manage media collections"
  on public.media_collections
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Public can read active media assets"
  on public.media_assets
  for select
  using (
    is_active
    and exists (
      select 1
      from public.media_collections collections
      where collections.slug = media_assets.collection_slug
        and collections.is_active
    )
  );

create policy "Internal users can manage media assets"
  on public.media_assets
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values ('media-assets', 'media-assets', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

insert into public.media_collections (
  slug,
  name_vi,
  name_en,
  description_vi,
  description_en,
  sort_order,
  is_active
)
values
  ('home-hero', 'Hero trang chủ', 'Home hero', 'Ảnh dùng cho slider hero trang chủ.', 'Images used for the homepage hero slider.', 10, true),
  ('customers', 'Khách hàng', 'Customers', 'Ảnh khách hàng và khoảnh khắc lưu trú.', 'Guest moments and stay photography.', 20, true),
  ('rooms-hero', 'Hero trang phòng', 'Rooms hero', 'Ảnh hero cho trang chọn phòng.', 'Hero image used on the room listing page.', 30, true),
  ('rooms-gallery', 'Gallery phòng', 'Rooms gallery', 'Ảnh carousel dưới danh sách phòng.', 'Image carousel shown below the room listing.', 35, true),
  ('room-family', 'Family Room', 'Family Room', 'Ảnh hạng Family Room.', 'Family room imagery.', 40, true),
  ('room-superior', 'Superior Room', 'Superior Room', 'Ảnh hạng Superior Room.', 'Superior room imagery.', 50, true),
  ('room-quadruple', 'Quadruple Room', 'Quadruple Room', 'Ảnh hạng Quadruple Room.', 'Quadruple room imagery.', 60, true),
  ('about-visuals', 'Về SK', 'About SK', 'Ảnh dùng cho trang giới thiệu.', 'Images used for the about page.', 70, true)
on conflict (slug) do update set
  name_vi = excluded.name_vi,
  name_en = excluded.name_en,
  description_vi = excluded.description_vi,
  description_en = excluded.description_en,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.media_assets (
  collection_slug,
  slug,
  title_vi,
  title_en,
  alt_vi,
  alt_en,
  description_vi,
  description_en,
  fallback_url,
  sort_order,
  is_featured,
  is_active
)
values
  ('home-hero', 'slide-1', 'Hero 1', 'Hero 1', 'Ảnh hero 1', 'Hero image 1', '', '', '/hero/hero-1.png', 10, true, true),
  ('home-hero', 'slide-2', 'Hero 2', 'Hero 2', 'Ảnh hero 2', 'Hero image 2', '', '', '/hero/hero-2.png', 20, true, true),
  ('home-hero', 'slide-3', 'Hero 3', 'Hero 3', 'Ảnh hero 3', 'Hero image 3', '', '', '/hero/hero-3.png', 30, true, true),
  
  ('rooms-hero', 'bed-1', 'Rooms hero', 'Rooms hero', 'Ảnh hero trang phòng', 'Room listing hero image', '', '', '/home/bed1.jpg', 10, true, true),
  
  -- carousel images for rooms gallery
  ('rooms-gallery', 'gallery-1', 'Rooms gallery 1', 'Rooms gallery 1', 'Ảnh carousel phòng 1', 'Room carousel image 1', '', '', '/assets/room_types/family/5.png', 10, true, true),
  ('rooms-gallery', 'gallery-2', 'Rooms gallery 2', 'Rooms gallery 2', 'Ảnh carousel phòng 2', 'Room carousel image 2', '', '', '/assets/room_types/family/2.png', 20, true, true),
  ('rooms-gallery', 'gallery-3', 'Rooms gallery 3', 'Rooms gallery 3', 'Ảnh carousel phòng 3', 'Room carousel image 3', '', '', '/assets/room_types/family/4.png', 30, true, true),
  ('rooms-gallery', 'gallery-4', 'Rooms gallery 4', 'Rooms gallery 4', 'Ảnh carousel phòng 4', 'Room carousel image 4', '', '', '/assets/room_types/family/9.png', 40, true, true),
  ('rooms-gallery', 'gallery-5', 'Rooms gallery 5', 'Rooms gallery 5', 'Ảnh carousel phòng 5', 'Room carousel image 5', '', '', '/assets/room_types/family/6.png', 50, true, true),
  ('rooms-gallery', 'gallery-6', 'Rooms gallery 6', 'Rooms gallery 6', 'Ảnh carousel phòng 6', 'Room carousel image 6', '', '', '/assets/room_types/superior/7.png', 60, true, true),
  ('rooms-gallery', 'gallery-7', 'Rooms gallery 7', 'Rooms gallery 7', 'Ảnh carousel phòng 7', 'Room carousel image 7', '', '', '/assets/room_types/superior/3.png', 70, true, true),
  ('rooms-gallery', 'gallery-8', 'Rooms gallery 8', 'Rooms gallery 8', 'Ảnh carousel phòng 8', 'Room carousel image 8', '', '', '/assets/room_types/superior/2.png', 80, true, true),
  ('rooms-gallery', 'gallery-9', 'Rooms gallery 9', 'Rooms gallery 9', 'Ảnh carousel phòng 9', 'Room carousel image 9', '', '', '/assets/room_types/quadruple/1.png', 90, true, true),
  ('rooms-gallery', 'gallery-10', 'Rooms gallery 10', 'Rooms gallery 10', 'Ảnh carousel phòng 10', 'Room carousel image 10', '', '', '/assets/room_types/quadruple/5.png', 100, true, true),
  
  -- family room images
  ('room-family', 'cover-1', 'Family cover 1', 'Family cover 1', 'Ảnh Family Room 1', 'Family room image 1', '', '', '/assets/room_types/family/1.png', 10, true, true),
  ('room-family', 'cover-2', 'Family cover 2', 'Family cover 2', 'Ảnh Family Room 2', 'Family room image 2', '', '', '/assets/room_types/family/2.png', 20, true, true),
  ('room-family', 'cover-3', 'Family cover 3', 'Family cover 3', 'Ảnh Family Room 3', 'Family room image 3', '', '', '/assets/room_types/family/3.png', 30, true, true),
  ('room-family', 'cover-4', 'Family cover 4', 'Family cover 4', 'Ảnh Family Room 4', 'Family room image 4', '', '', '/assets/room_types/family/4.png', 40, true, true),
  ('room-family', 'cover-5', 'Family cover 5', 'Family cover 5', 'Ảnh Family Room 5', 'Family room image 5', '', '', '/assets/room_types/family/5.png', 50, true, true),
  ('room-family', 'cover-6', 'Family cover 6', 'Family cover 6', 'Ảnh Family Room 6', 'Family room image 6', '', '', '/assets/room_types/family/6.png', 60, true, true),
  ('room-family', 'cover-7', 'Family cover 7', 'Family cover 7', 'Ảnh Family Room 7', 'Family room image 7', '', '', '/assets/room_types/family/7.png', 70, true, true),
  ('room-family', 'cover-8', 'Family cover 8', 'Family cover 8', 'Ảnh Family Room 8', 'Family room image 8', '', '', '/assets/room_types/family/8.png', 80, true, true),
  ('room-family', 'cover-9', 'Family cover 9', 'Family cover 9', 'Ảnh Family Room 9', 'Family room image 9', '', '', '/assets/room_types/family/9.png', 90, true, true),
  
  -- superior room images
  ('room-superior', 'cover-1', 'Superior cover 1', 'Superior cover 1', 'Ảnh Superior Room 1', 'Superior room image 1', '', '', '/assets/room_types/superior/1.png', 10, true, true),
  ('room-superior', 'cover-2', 'Superior cover 2', 'Superior cover 2', 'Ảnh Superior Room 2', 'Superior room image 2', '', '', '/assets/room_types/superior/2.png', 20, true, true),
  ('room-superior', 'cover-3', 'Superior cover 3', 'Superior cover 3', 'Ảnh Superior Room 3', 'Superior room image 3', '', '', '/assets/room_types/superior/3.png', 30, true, true),
  ('room-superior', 'cover-4', 'Superior cover 4', 'Superior cover 4', 'Ảnh Superior Room 4', 'Superior room image 4', '', '', '/assets/room_types/superior/4.png', 40, true, true),
  ('room-superior', 'cover-5', 'Superior cover 5', 'Superior cover 5', 'Ảnh Superior Room 5', 'Superior room image 5', '', '', '/assets/room_types/superior/5.png', 50, true, true),
  ('room-superior', 'cover-6', 'Superior cover 6', 'Superior cover 6', 'Ảnh Superior Room 6', 'Superior room image 6', '', '', '/assets/room_types/superior/6.png', 60, true, true),
  ('room-superior', 'cover-7', 'Superior cover 7', 'Superior cover 7', 'Ảnh Superior Room 7', 'Superior room image 7', '', '', '/assets/room_types/superior/7.png', 70, true, true),
  
  -- quadruple room images
  ('room-quadruple', 'cover-1', 'Quadruple cover 1', 'Quadruple cover 1', 'Ảnh Quadruple Room 1', 'Quadruple room image 1', '', '', '/assets/room_types/quadruple/1.png', 10, true, true),
  ('room-quadruple', 'cover-2', 'Quadruple cover 2', 'Quadruple cover 2', 'Ảnh Quadruple Room 2', 'Quadruple room image 2', '', '', '/assets/room_types/quadruple/2.png', 20, true, true),
  ('room-quadruple', 'cover-3', 'Quadruple cover 3', 'Quadruple cover 3', 'Ảnh Quadruple Room 3', 'Quadruple room image 3', '', '', '/assets/room_types/quadruple/3.png', 30, true, true),
  ('room-quadruple', 'cover-4', 'Quadruple cover 4', 'Quadruple cover 4', 'Ảnh Quadruple Room 4', 'Quadruple room image 4', '', '', '/assets/room_types/quadruple/4.png', 40, true, true),
  ('room-quadruple', 'cover-5', 'Quadruple cover 5', 'Quadruple cover 5', 'Ảnh Quadruple Room 5', 'Quadruple room image 5', '', '', '/assets/room_types/quadruple/5.png', 50, true, true),
  ('room-quadruple', 'cover-6', 'Quadruple cover 6', 'Quadruple cover 6', 'Ảnh Quadruple Room 6', 'Quadruple room image 6', '', '', '/assets/room_types/quadruple/6.png', 60, true, true),
  ('customers', 'guest-1', 'Guest 1', 'Guest 1', 'Khoảnh khắc khách hàng 1', 'Guest moment 1', '', '', '/customers/customers1.jpg', 10, true, true),
  ('customers', 'guest-2', 'Guest 2', 'Guest 2', 'Khoảnh khắc khách hàng 2', 'Guest moment 2', '', '', '/customers/customers2.jpg', 20, true, true),
  ('customers', 'guest-3', 'Guest 3', 'Guest 3', 'Khoảnh khắc khách hàng 3', 'Guest moment 3', '', '', '/customers/customers3.jpg', 30, true, true),
  ('customers', 'guest-4', 'Guest 4', 'Guest 4', 'Khoảnh khắc khách hàng 4', 'Guest moment 4', '', '', '/customers/customers4.jpg', 40, true, true),
  ('customers', 'guest-5', 'Guest 5', 'Guest 5', 'Khoảnh khắc khách hàng 5', 'Guest moment 5', '', '', '/customers/customers5.jpg', 50, true, true),
  ('customers', 'guest-6', 'Guest 6', 'Guest 6', 'Khoảnh khắc khách hàng 6', 'Guest moment 6', '', '', '/customers/customers6.jpg', 60, true, true),
  ('customers', 'guest-7', 'Guest 7', 'Guest 7', 'Khoảnh khắc khách hàng 7', 'Guest moment 7', '', '', '/customers/customers22.jpg', 70, true, true)
on conflict (collection_slug, slug) do update set
  title_vi = excluded.title_vi,
  title_en = excluded.title_en,
  alt_vi = excluded.alt_vi,
  alt_en = excluded.alt_en,
  description_vi = excluded.description_vi,
  description_en = excluded.description_en,
  fallback_url = excluded.fallback_url,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active;

comment on table public.media_collections is 'Reusable media collections for the entire hotel app.';
comment on table public.media_assets is 'Reusable media assets that can fall back to legacy public URLs until uploaded files replace them.';
