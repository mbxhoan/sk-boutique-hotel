update public.events
set
  title_vi = 'Summer Together 2026',
  title_en = 'Summer Together 2026',
  cover_image_path = '/events/2026-summer-together/1.jpg',
  updated_at = now()
where slug = 'summer-together-2026';

delete from public.event_images
where event_id in (
  select id
  from public.events
  where slug = 'summer-together-2026'
);

insert into public.event_images (event_id, image_path, caption_vi, caption_en, sort_order)
select id, image_path, 'Summer Together 2026', 'Summer Together 2026', sort_order
from public.events
cross join (
  values
    ('/events/2026-summer-together/1.jpg', 0),
    ('/events/2026-summer-together/2.jpg', 1)
) as seeded_images(image_path, sort_order)
where slug = 'summer-together-2026';
