-- Phase F foundation: content pages for homepage, static editorial pages, and news content.

create extension if not exists "pgcrypto";

create table public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  page_type text not null check (page_type in ('home', 'page', 'collection', 'detail')),
  title_vi text not null default '',
  title_en text not null default '',
  description_vi text not null default '',
  description_en text not null default '',
  content_json jsonb not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_pages_page_type_idx on public.content_pages (page_type);
create index content_pages_is_published_idx on public.content_pages (is_published);
create index content_pages_sort_order_idx on public.content_pages (sort_order);

alter table public.content_pages enable row level security;

create policy "public can read published content pages"
on public.content_pages
for select
using (is_published);

create trigger set_content_pages_updated_at
before update on public.content_pages
for each row
execute function public.set_updated_at();
