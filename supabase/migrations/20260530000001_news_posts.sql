-- News Posts: editorial journal/blog articles
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_vi text not null,
  title_en text not null,
  excerpt_vi text not null default '',
  excerpt_en text not null default '',
  body_vi text not null default '',
  body_en text not null default '',
  cover_image_path text,
  author_name text not null default 'SK Boutique',
  author_role_vi text not null default '',
  author_role_en text not null default '',
  author_bio_vi text not null default '',
  author_bio_en text not null default '',
  author_image_path text,
  category text not null default 'tin-tuc',
  tags text[] not null default '{}',
  read_time_vi text not null default '',
  read_time_en text not null default '',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  published_at date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- News Post Images
create table public.news_post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.news_posts(id) on delete cascade,
  image_path text not null,
  caption_vi text not null default '',
  caption_en text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index news_posts_is_published_sort on public.news_posts (is_published, sort_order);
create index news_posts_is_featured on public.news_posts (is_featured) where is_featured = true;
create index news_posts_category on public.news_posts (category);
create index news_post_images_post_id_sort on public.news_post_images (post_id, sort_order);

-- RLS
alter table public.news_posts enable row level security;
alter table public.news_post_images enable row level security;

create policy "news_posts_public_select" on public.news_posts
  for select to anon using (is_published = true);
create policy "news_post_images_public_select" on public.news_post_images
  for select to anon using (true);

create policy "news_posts_auth_all" on public.news_posts
  for all to authenticated using (true) with check (true);
create policy "news_post_images_auth_all" on public.news_post_images
  for all to authenticated using (true) with check (true);

-- Auto-update updated_at
create or replace function public.update_news_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_news_posts_updated_at
  before update on public.news_posts
  for each row execute function public.update_news_posts_updated_at();

-- Storage bucket
insert into storage.buckets (id, name, public) values ('news-images', 'news-images', true)
  on conflict (id) do nothing;

create policy "news_images_anon_select" on storage.objects
  for select to anon using (bucket_id = 'news-images');
create policy "news_images_auth_all" on storage.objects
  for all to authenticated using (bucket_id = 'news-images') with check (bucket_id = 'news-images');

-- Seed: 11 long-form editorial articles (source: docs/mockup/blogs/sk_boutique_11_bai_viet_website_long_form.xlsx)
-- Idempotent upserts keyed on slug so this seed can be re-applied safely.

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'chao-mung-den-voi-sk-boutique-hotel-phu-quoc',
  'Chào mừng đến với SK Boutique Hotel Phu Quoc',
  'Welcome to SK Boutique Hotel Phu Quoc',
  'Chào mừng đến SK Boutique Hotel Phu Quoc — không gian lưu trú ấm cúng, sạch sẽ và thuận tiện tại Marina Square cho kỳ nghỉ ở đảo ngọc.',
  'Welcome to SK Boutique Hotel Phu Quoc — a warm, clean, and convenient boutique stay at Marina Square for your island getaway.',
  'SK Boutique Hotel Phu Quoc được tạo nên từ một mong muốn rất đơn giản: mang đến cho du khách một nơi lưu trú sạch sẽ, ấm cúng và dễ chịu sau những giờ khám phá đảo ngọc.

Giữa nhịp du lịch sôi động của Phú Quốc, không phải ai cũng tìm kiếm một không gian quá lớn hoặc quá cầu kỳ. Nhiều du khách chỉ cần một căn phòng chỉn chu, một chiếc giường thoải mái, một vị trí thuận tiện và một cảm giác yên tâm khi trở về sau một ngày dài. Đó cũng chính là tinh thần mà SK Boutique Hotel luôn theo đuổi.

Tại SK, mỗi chi tiết được giữ theo hướng gần gũi và thực tế: không gian phòng sáng sủa, tone gỗ ấm, giường trắng sạch, cách bố trí gọn gàng và dịch vụ thân thiện. Dù bạn đến Phú Quốc cùng gia đình, bạn bè, người thương hay chỉ đơn giản là một chuyến đi ngắn để tự thưởng cho bản thân, SK mong muốn trở thành một điểm dừng chân dễ chịu trong hành trình ấy.

Điều làm cho một kỳ nghỉ đáng nhớ đôi khi không nằm ở những điều quá xa hoa. Đó có thể là cảm giác được nghỉ ngơi thật sự, một buổi sáng nhẹ nhàng trước khi ra biển, một buổi chiều trở về phòng sau khi dạo chơi, hay chỉ là một nơi đủ yên để bạn có thể ngủ ngon và nạp lại năng lượng.

SK Boutique Hotel không chỉ là nơi để lưu trú. Chúng tôi hy vọng mỗi vị khách khi rời đi đều mang theo một chút cảm giác ấm áp, một vài khoảnh khắc đẹp và lý do để quay lại Phú Quốc thêm lần nữa.

Nếu bạn đang lên kế hoạch cho chuyến đi sắp tới, hãy để SK đồng hành cùng bạn từ những ngày đầu tiên ở đảo ngọc.',
  'SK Boutique Hotel Phu Quoc was created with a simple idea: to offer travelers a clean, warm, and comfortable place to stay after exploring the island.

In a lively destination like Phu Quoc, not every guest is looking for something overly large or extravagant. Many travelers simply want a well-kept room, a comfortable bed, a convenient location, and the peace of mind that comes with returning to a pleasant space at the end of the day. That is the spirit SK Boutique Hotel continues to follow.

At SK, the details are kept warm, practical, and welcoming: bright rooms, wooden tones, clean white bedding, tidy layouts, and friendly service. Whether you are visiting Phu Quoc with family, friends, your partner, or simply taking a short break for yourself, SK hopes to become an easy and memorable part of your journey.

A meaningful stay does not always come from luxury alone. Sometimes, it is the feeling of truly resting, a slow morning before heading to the beach, a quiet afternoon after exploring the island, or simply a room where you can sleep well and recharge.

SK Boutique Hotel is more than a place to stay. We hope every guest leaves with a little warmth, a few beautiful moments, and a reason to return to Phu Quoc again.

If you are planning your next trip, let SK welcome you from your first days on the island.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'trai-nghiem',
  ARRAY['PhuQuoc', 'SKBoutique', 'LuuTru', 'DaoNgoc'],
  '3 phút đọc',
  '3 min read',
  true,
  true,
  '2026-05-29',
  0
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'mua-he-o-phu-quoc-bat-dau-tu-noi-luu-tru-de-chiu',
  'Mùa hè ở Phú Quốc, bắt đầu từ một nơi lưu trú thật dễ chịu',
  'Summer in Phu Quoc Starts with a Comfortable Stay',
  'Gợi ý nơi lưu trú mùa hè tại Phú Quốc cho cặp đôi, gia đình và nhóm bạn: sạch sẽ, ấm cúng, thuận tiện và dễ nghỉ tại SK Boutique Hotel.',
  'A summer stay in Phu Quoc for couples, families, and friends: clean, cozy, convenient, and easy to enjoy at SK Boutique Hotel.',
  'Mùa hè luôn khiến người ta muốn đi đâu đó một chút. Có thể là một chuyến đi cùng gia đình, một kỳ nghỉ ngắn với bạn bè, hoặc đơn giản là vài ngày tự cho mình được chậm lại sau những ngày làm việc bận rộn.

Phú Quốc là một điểm đến rất hợp cho cảm giác ấy. Biển xanh, nắng đẹp, những buổi chiều có gió, hồ bơi, quán ăn, địa điểm vui chơi và những cung đường đủ để mỗi ngày đều có điều mới để khám phá. Nhưng để một chuyến đi thật sự dễ chịu, nơi lưu trú cũng quan trọng không kém lịch trình.

Tại SK Boutique Hotel, chúng tôi muốn mang đến một không gian nghỉ vừa ấm cúng vừa thuận tiện. Không cần quá phô trương, SK tập trung vào những điều khách thật sự cần: phòng sạch, giường thoải mái, không gian dễ nghỉ, vị trí thuận tiện và sự hỗ trợ thân thiện trong suốt thời gian lưu trú.

Mùa hè ở Phú Quốc có thể rất nhiều hoạt động: đi biển, dạo chơi, chụp ảnh, khám phá Safari, đi cáp treo, thưởng thức hải sản hoặc đơn giản là dành một buổi chiều nằm nghỉ trong phòng. Và sau tất cả những khoảnh khắc bên ngoài, điều tuyệt vời nhất đôi khi là được trở về một căn phòng mát mẻ, gọn gàng và yên bình.

SK Boutique Hotel phù hợp cho nhiều kiểu chuyến đi: cặp đôi cần một nơi riêng tư, gia đình muốn không gian dễ sinh hoạt, nhóm bạn cần chỗ ở thuận tiện, hoặc khách đi ngắn ngày chỉ cần một nơi sạch sẽ để nghỉ thật ngon.

Nếu mùa hè này bạn đang tìm một nơi ở vừa đủ đẹp, vừa đủ ấm và vừa đủ tiện tại Phú Quốc, SK rất sẵn sàng chào đón bạn.',
  'Summer always makes people want to go somewhere for a while. It may be a family trip, a short getaway with friends, or simply a few days to slow down after a busy season.

Phu Quoc is a lovely destination for that feeling. Blue seas, sunshine, breezy afternoons, swimming pools, local food, attractions, and scenic island roads make every day feel a little different. But for a trip to feel truly comfortable, where you stay matters just as much as where you go.

At SK Boutique Hotel, we aim to offer a stay that feels both cozy and convenient. Instead of trying to be overly elaborate, SK focuses on what guests actually need: clean rooms, comfortable beds, an easy atmosphere, a practical location, and friendly support throughout the stay.

Summer in Phu Quoc can be filled with many activities: beach time, sightseeing, photos, Safari visits, cable car rides, seafood dinners, or simply a peaceful afternoon in your room. After all those moments outside, one of the best parts of the day is returning to a cool, tidy, and quiet space.

SK Boutique Hotel suits many kinds of trips: couples looking for privacy, families who need an easy place to stay, groups of friends who want convenience, or short-stay travelers who simply need a clean and restful room.

If you are looking for a stay that is warm, comfortable, and well located in Phu Quoc this summer, SK is ready to welcome you.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'trai-nghiem',
  ARRAY['PhuQuoc', 'MuaHe', 'LuuTru', 'SKBoutique'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-27',
  10
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'phu-quoc-la-dao-lon-nhat-viet-nam',
  'Bạn có biết Phú Quốc là đảo lớn nhất Việt Nam?',
  'Did You Know? Phu Quoc Is Vietnam’s Largest Island',
  'Phú Quốc là đảo lớn nhất Việt Nam với diện tích khoảng 575 km², một điểm đến mùa hè đáng nhớ cho biển, nắng và những trải nghiệm đảo ngọc.',
  'Phu Quoc is Vietnam’s largest island at around 575 km², a memorable summer destination for beaches, sunshine, and island experiences.',
  'Bạn có biết? Phú Quốc là hòn đảo lớn nhất Việt Nam, với diện tích khoảng 575 km². Nhưng với nhiều du khách, điều làm Phú Quốc trở nên đặc biệt không chỉ nằm ở con số ấy.

Phú Quốc là nơi có biển xanh, những con đường ven biển, những buổi chiều nắng vàng, làng chài, khu vui chơi, Safari, cáp treo, chợ đêm và rất nhiều trải nghiệm khác nhau cho một chuyến đi trọn vẹn. Có người đến đây để nghỉ dưỡng, có người đến để khám phá, cũng có người chỉ muốn tìm một nơi đủ xa thành phố để được thở chậm hơn trong vài ngày.

Điều thú vị của Phú Quốc là mỗi nhóm khách lại có thể tìm thấy một phiên bản riêng của hòn đảo. Gia đình có thể chọn những hoạt động nhẹ nhàng, an toàn và nhiều trải nghiệm cho trẻ nhỏ. Cặp đôi có thể dành thời gian cho biển, hoàng hôn và những bữa tối yên bình. Nhóm bạn có thể khám phá nhiều điểm vui chơi, chụp ảnh, ăn uống và tận hưởng không khí đảo theo cách sôi động hơn.

Một chuyến đi Phú Quốc cũng không nhất thiết phải quá dày đặc lịch trình. Đôi khi, chỉ cần một buổi sáng thức dậy trong căn phòng sạch sẽ, một bữa ăn nhẹ, một chuyến dạo biển và một buổi chiều nghỉ ngơi là đã đủ để cảm thấy dễ chịu hơn rất nhiều.

Tại SK Boutique Hotel, chúng tôi hy vọng trở thành nơi bạn có thể bắt đầu và kết thúc mỗi ngày ở Phú Quốc một cách nhẹ nhàng. Sau những giờ khám phá đảo lớn nhất Việt Nam, bạn có thể trở về một không gian ấm cúng, sạch sẽ và thuận tiện để nghỉ ngơi, nạp lại năng lượng và chuẩn bị cho ngày tiếp theo.

Phú Quốc có rất nhiều điều để khám phá. Và đôi khi, một nơi ở phù hợp sẽ giúp chuyến đi ấy trở nên trọn vẹn hơn.',
  'Did you know? Phu Quoc is the largest island in Vietnam, covering around 575 km². But for many travelers, what makes Phu Quoc special is not only its size.

Phu Quoc is home to blue seas, coastal roads, golden afternoons, fishing villages, entertainment areas, Safari experiences, cable cars, night markets, and many different ways to enjoy an island trip. Some people come here to relax, some come to explore, and some simply want a place far enough from the city to slow down for a few days.

What makes Phu Quoc interesting is that every type of traveler can find their own version of the island. Families can enjoy gentle, safe, and child-friendly activities. Couples can spend time by the sea, watch sunsets, and enjoy quiet dinners. Groups of friends can explore attractions, take photos, try local food, and experience the island with more energy.

A trip to Phu Quoc does not always need a packed schedule. Sometimes, waking up in a clean room, having a light breakfast, walking by the beach, and taking a restful afternoon are enough to make the whole trip feel better.

At SK Boutique Hotel, we hope to be a place where you can begin and end each day in Phu Quoc with ease. After exploring Vietnam’s largest island, you can return to a warm, clean, and convenient space to rest, recharge, and get ready for the next day.

Phu Quoc has many things to discover. And sometimes, the right place to stay helps make the journey feel complete.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'cam-nang',
  ARRAY['PhuQuoc', 'CamNang', 'DaoNgoc', 'Fact'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-25',
  20
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'summer-together-2026-khach-doan-sk-boutique-hotel',
  'Summer Together 2026: Những khoảnh khắc khách đoàn tại SK Boutique Hotel',
  'Summer Together 2026: Group Moments at SK Boutique Hotel',
  'SK Boutique Hotel Phu Quoc chào đón đoàn khách Summer Together 2026 với những khoảnh khắc vui vẻ, gần gũi và đáng nhớ tại đảo ngọc.',
  'SK Boutique Hotel Phu Quoc welcomed the Summer Together 2026 group with warm, joyful, and memorable moments on the island.',
  'SK Boutique Hotel rất vui khi được chào đón đoàn khách Summer Together 2026 trong chuyến đi vừa qua tại Phú Quốc.

Đối với một khách sạn, những khoảnh khắc đáng nhớ nhất không chỉ là căn phòng được chuẩn bị sẵn sàng hay một lịch trình lưu trú hoàn tất. Đó còn là những nụ cười, những bức ảnh tập thể, những câu chuyện nhỏ trong suốt chuyến đi và cảm giác được trở thành một phần trong hành trình của khách hàng.

Summer Together 2026 là một trong những khoảnh khắc như vậy. Một đoàn khách cùng đến Phú Quốc, cùng trải nghiệm không khí mùa hè, cùng nghỉ ngơi, cùng di chuyển và cùng lưu lại những tấm hình rất đời thường nhưng đầy năng lượng. Với SK, đó là niềm vui lớn khi được đồng hành, hỗ trợ và góp một phần nhỏ để chuyến đi của đoàn diễn ra thuận lợi hơn.

Đi nhóm hoặc đi đoàn luôn có những nhu cầu rất riêng. Khách cần nơi ở sạch sẽ, dễ sắp xếp phòng, thuận tiện khi di chuyển, có không gian để mọi người tập trung và có đội ngũ hỗ trợ khi cần. SK Boutique Hotel hiểu rằng sự thoải mái của khách đoàn không nằm ở một chi tiết riêng lẻ, mà nằm ở việc mọi thứ vận hành mượt mà và dễ chịu trong suốt thời gian lưu trú.

Chúng tôi chân thành cảm ơn đoàn Summer Together 2026 đã tin tưởng lựa chọn SK Boutique Hotel trong chuyến đi Phú Quốc. Những khoảnh khắc vui vẻ của đoàn là động lực để đội ngũ SK tiếp tục chăm chút hơn trong từng lần đón khách.

Hy vọng SK sẽ còn được gặp lại mọi người trong những chuyến đi sắp tới — có thể là một kỳ nghỉ gia đình, một chuyến đi công ty, một nhóm bạn thân hoặc một hành trình mùa hè khác tại đảo ngọc.',
  'SK Boutique Hotel was delighted to welcome the Summer Together 2026 group during their recent trip to Phu Quoc.

For a hotel, the most memorable moments are not only about a room being ready or a stay being completed. They are also about smiles, group photos, small stories during the trip, and the feeling of becoming a small part of a guest’s journey.

Summer Together 2026 was one of those moments. A group came to Phu Quoc together, enjoyed the summer atmosphere, rested together, moved around the island together, and captured simple but energetic memories. For SK, it was a pleasure to accompany, support, and contribute in a small way to making the trip smoother.

Group travel always comes with its own needs. Guests need clean rooms, easy room arrangements, convenient movement, spaces where everyone can gather, and a team that can help when needed. SK Boutique Hotel understands that comfort for groups does not come from one single detail, but from everything working smoothly and pleasantly throughout the stay.

We sincerely thank the Summer Together 2026 group for choosing SK Boutique Hotel during their Phu Quoc trip. Your joyful moments motivate our team to continue improving the way we welcome every guest.

We hope to meet everyone again on future journeys — perhaps a family holiday, a company trip, a group getaway, or another summer experience on the island.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'su-kien',
  ARRAY['PhuQuoc', 'KhachDoan', 'SummerTogether', 'SKBoutique'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-23',
  30
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'khoanh-khac-nho-tai-sk-boutique-hotel',
  'Một vài khoảnh khắc nhỏ tại SK Boutique Hotel',
  'A Few Small Moments at SK Boutique Hotel',
  'Khám phá những khoảnh khắc đời thường tại SK Boutique Hotel Phu Quoc: phòng nghỉ ấm cúng, hồ bơi, không gian thư giãn và cảm giác dễ chịu.',
  'Discover small everyday moments at SK Boutique Hotel Phu Quoc: cozy rooms, pool scenes, relaxing spaces, and an easy island stay.',
  'Có những video không cần nói quá nhiều. Chỉ vài cảnh phòng nghỉ, hồ bơi, không gian khách sạn, một vài chuyển động nhẹ và âm nhạc vừa đủ cũng có thể kể được cảm giác của một nơi lưu trú.

Tại SK Boutique Hotel, chúng tôi luôn tin rằng trải nghiệm nghỉ dưỡng được tạo nên từ những điều rất nhỏ. Một căn phòng sạch sẽ khi khách vừa mở cửa. Ánh sáng dịu trong phòng vào buổi chiều. Một góc ngồi yên tĩnh sau khi đi biển. Hồ bơi và mảng xanh ngoài cửa sổ. Nụ cười của khách trong một chuyến đi cùng gia đình hoặc bạn bè.

Những khoảnh khắc ấy có thể không quá ồn ào, nhưng lại là phần làm cho kỳ nghỉ trở nên dễ nhớ hơn. Vì sau một ngày khám phá Phú Quốc, điều khách cần đôi khi chỉ là được trở về một nơi đủ mát, đủ sạch, đủ yên và đủ ấm để nghỉ thật thoải mái.

Thước phim ngắn về SK không nhằm kể một câu chuyện quá lớn. Nó chỉ ghi lại cảm giác mà chúng tôi muốn gửi đến khách hàng: nhẹ nhàng, gần gũi, sạch sẽ và thuận tiện. Một nơi để bắt đầu ngày mới, cũng là nơi để trở về sau những buổi chiều đầy nắng ở đảo ngọc.

Dù bạn đến Phú Quốc để đi biển, nghỉ dưỡng, du lịch gia đình, gặp gỡ bạn bè hay đơn giản là đổi không khí, SK Boutique Hotel luôn mong được là một phần nhỏ trong chuyến đi ấy.

Một vài khoảnh khắc nhỏ đôi khi đủ để khiến một kỳ nghỉ trở nên đáng nhớ.',
  'Some videos do not need many words. A few scenes of the room, the pool, the hotel space, gentle movements, and the right music can already tell the feeling of a stay.

At SK Boutique Hotel, we believe that a good travel experience is built from small details. A clean room when guests open the door. Soft afternoon light inside the room. A quiet corner after a beach day. The pool and greenery outside the window. A guest’s smile during a family trip or a getaway with friends.

These moments may not be loud, but they are often what make a stay memorable. After a full day exploring Phu Quoc, what guests sometimes need most is simply a space that feels cool, clean, quiet, and warm enough to rest properly.

A short video about SK is not meant to tell a grand story. It is meant to capture the feeling we want to offer: light, friendly, clean, and convenient. A place to begin your day, and a place to return to after sunny island afternoons.

Whether you visit Phu Quoc for the beach, a family holiday, a trip with friends, or just a change of scenery, SK Boutique Hotel hopes to be a small part of your journey.

Sometimes, a few little moments are enough to make a trip worth remembering.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'trai-nghiem',
  ARRAY['PhuQuoc', 'SKBoutique', 'KhoanhKhac', 'NghiDuong'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-21',
  40
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'superior-room-nho-gon-am-cung-vua-du-nghi-ngoi',
  'Superior Room: Nhỏ gọn, ấm cúng, vừa đủ để nghỉ ngơi',
  'Superior Room: Cozy, Simple, and Just Right',
  'Superior Room tại SK Boutique Hotel Phu Quoc là lựa chọn ấm cúng, sạch sẽ, phù hợp cặp đôi hoặc khách công tác trong kỳ nghỉ ngắn ngày.',
  'Superior Room at SK Boutique Hotel Phu Quoc is a cozy, clean choice for couples or business travelers looking for a comfortable short stay.',
  'Có những chuyến đi, bạn không cần một căn phòng quá lớn. Bạn chỉ cần một nơi sạch sẽ, sáng sủa, đủ riêng tư và đủ dễ chịu để trở về sau một ngày dài ở Phú Quốc.

Superior Room tại SK Boutique Hotel được thiết kế cho cảm giác như vậy. Không gian phòng gọn gàng, ấm cúng và tập trung vào sự thoải mái thực tế. Tone gỗ ấm, giường trắng sạch, ánh sáng dịu và cách bố trí đơn giản giúp căn phòng có cảm giác rất dễ ở ngay từ lần đầu bước vào.

Đây là hạng phòng phù hợp cho cặp đôi, khách đi công tác hoặc những chuyến đi ngắn ngày cần một nơi nghỉ ngơi tử tế. Phòng không cố gây ấn tượng bằng quá nhiều chi tiết, nhưng lại mang đến cảm giác vừa vặn: đủ đẹp để thấy thích, đủ gọn để không bị rối và đủ ấm để có thể nghỉ ngơi thật sự.

Một chuyến đi Phú Quốc thường có rất nhiều hoạt động. Bạn có thể ra biển, đi ăn, dạo quanh các điểm vui chơi, chụp ảnh, khám phá những địa điểm mới hoặc gặp gỡ bạn bè. Sau tất cả, việc trở về một căn phòng sạch, mát và yên tĩnh sẽ giúp chuyến đi nhẹ nhàng hơn rất nhiều.

Superior Room không phải là lựa chọn lớn nhất tại SK, nhưng lại là một trong những lựa chọn dễ cân nhắc nhất nếu bạn muốn kiểm soát ngân sách mà vẫn có một không gian lưu trú chỉn chu. Đây là kiểu phòng dành cho những ai thích sự đơn giản, ấm áp và thực tế hơn là những lời quảng cáo quá hào nhoáng.

Nếu bạn đang tìm một căn phòng “vừa đủ” cho chuyến đi Phú Quốc, Superior Room tại SK Boutique Hotel là một lựa chọn đáng để xem.',
  'Some trips do not require a very large room. You may simply need a clean, bright, private, and comfortable space to return to after a long day in Phu Quoc.

Superior Room at SK Boutique Hotel is designed for that kind of feeling. The room is compact, warm, and focused on real comfort. Wooden tones, clean white bedding, soft lighting, and a simple layout make the space feel easy to stay in from the moment you walk in.

This room type is suitable for couples, business travelers, or short stays that require a comfortable and well-kept place to rest. It does not try to impress with too many details, but it feels just right: pleasant enough to enjoy, neat enough to feel calm, and warm enough to help you truly relax.

A trip to Phu Quoc often comes with many activities. You may spend time at the beach, try local food, visit attractions, take photos, explore new places, or meet friends. After all of that, returning to a clean, cool, and quiet room can make the whole trip feel much easier.

Superior Room may not be the largest option at SK, but it is one of the easiest choices to consider if you want to manage your budget while still enjoying a well-prepared stay. It is made for travelers who prefer simplicity, warmth, and practicality over exaggerated promises.

If you are looking for a room that feels “just right” for your Phu Quoc trip, Superior Room at SK Boutique Hotel is worth a closer look.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'meo-dat-phong',
  ARRAY['PhuQuoc', 'SuperiorRoom', 'HangPhong', 'SKBoutique'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-19',
  50
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'troi-nong-di-phu-quoc-nghi-mot-chut-thoi',
  'Trời nóng rồi, đi Phú Quốc nghỉ một chút thôi',
  'It’s Hot in the City — Take a Short Break in Phu Quoc',
  'Khi thành phố nóng 35–38°C, Phú Quốc là lựa chọn để trú nóng, nghỉ dưỡng bên biển và nạp lại năng lượng tại SK Boutique Hotel.',
  'When the city feels like 35–38°C, Phu Quoc is a refreshing place to cool down, rest by the sea, and recharge at SK Boutique Hotel.',
  'Những ngày thành phố nóng 35–38°C, đôi khi chỉ cần bước ra đường vài phút cũng đã thấy mệt. Cái nóng làm mình dễ uể oải hơn, dễ cáu hơn và chỉ muốn tìm một nơi nào đó có gió, có biển và có không gian để nghỉ thật sự.

Nếu bạn cũng đang có cảm giác đó, một chuyến đi Phú Quốc vài ngày có thể là cách rất dễ chịu để “trú nóng” và nạp lại năng lượng. Ở đảo, nhịp sống chậm hơn một chút. Bạn có thể dành buổi sáng cho biển, buổi chiều nghỉ trong phòng mát, tối đi dạo ăn uống hoặc đơn giản là ngồi yên bên hồ bơi và không cần vội.

SK Boutique Hotel mang đến một nơi lưu trú phù hợp cho những chuyến nghỉ ngắn như vậy. Không gian phòng sạch sẽ, ấm cúng, dễ nghỉ và thuận tiện cho gia đình, nhóm bạn hoặc cặp đôi muốn đổi không khí trong mùa hè. Sau một ngày di chuyển ngoài trời, cảm giác được trở về một căn phòng mát, gọn và yên sẽ khiến chuyến đi nhẹ hơn rất nhiều.

Một kỳ nghỉ hè không nhất thiết phải quá dài. Đôi khi chỉ cần hai hoặc ba ngày rời khỏi thành phố, ngủ ngon hơn, ăn ngon hơn, đi biển một chút và để cơ thể được thả lỏng cũng đã đủ để quay lại công việc với tinh thần tốt hơn.

Phú Quốc có biển, có gió, có hồ bơi, có những buổi chiều đẹp và có nhiều cách để bạn nghỉ ngơi theo nhịp riêng của mình. Còn SK Boutique Hotel sẽ là nơi để bạn bắt đầu và kết thúc mỗi ngày trong cảm giác dễ chịu hơn.

Trời nóng rồi. Có lẽ đã đến lúc tự thưởng cho mình một chuyến đi biển ngắn ngày.',
  'On days when the city feels like 35–38°C, even stepping outside for a few minutes can feel exhausting. The heat can make you feel slower, more tired, and simply in need of a place with breeze, sea, and space to rest properly.

If you feel the same way, a short trip to Phu Quoc can be a lovely way to escape the heat and recharge. On the island, life can feel a little slower. You can spend the morning by the beach, rest in a cool room in the afternoon, go out for dinner in the evening, or simply sit by the pool without rushing.

SK Boutique Hotel offers a suitable stay for short summer breaks like this. The rooms are clean, cozy, comfortable, and convenient for families, groups of friends, or couples who want a change of atmosphere. After a hot day outside, returning to a cool, tidy, and quiet room can make the whole trip feel much lighter.

A summer break does not always have to be long. Sometimes, two or three days away from the city are enough: better sleep, good food, a little beach time, and enough space for your body to slow down.

Phu Quoc has the sea, the breeze, the pool, beautiful afternoons, and many ways to relax at your own pace. SK Boutique Hotel can be the place where each day begins and ends with more comfort.

The city is hot. Maybe it is time to give yourself a short island escape.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'cam-nang',
  ARRAY['PhuQuoc', 'MuaHe', 'TruNong', 'NghiDuong'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-17',
  60
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'quadruple-room-di-cung-nhau-o-cung-nhau-tien-hon',
  'Quadruple Room: Đi cùng nhau, ở cùng nhau tiện hơn',
  'Quadruple Room: Stay Together, Travel Easier',
  'Quadruple Room tại SK Boutique Hotel Phu Quoc phù hợp cho nhóm bạn hoặc gia đình nhỏ cần không gian ấm cúng, sạch sẽ và tiện lợi.',
  'Quadruple Room at SK Boutique Hotel Phu Quoc is ideal for small families or groups of friends who want a cozy and practical shared stay.',
  'Đi Phú Quốc cùng nhóm bạn hoặc gia đình nhỏ luôn vui hơn khi mọi người có thể ở gần nhau. Nhưng chọn phòng cho nhóm 3–4 người đôi khi lại là phần khiến nhiều người phải suy nghĩ.

Nếu đặt nhiều phòng, chi phí có thể cao hơn và việc sinh hoạt chung sẽ bất tiện hơn. Nếu chọn một phòng quá nhỏ, cả nhóm lại dễ cảm thấy chật và thiếu thoải mái. Đó là lý do Quadruple Room tại SK Boutique Hotel trở thành một lựa chọn rất thực tế cho những chuyến đi đông vừa phải.

Không gian phòng được bố trí theo hướng gọn gàng, ấm cúng và dễ sử dụng. Hai giường lớn, tone gỗ sáng, ga trắng sạch và ánh sáng dịu giúp căn phòng có cảm giác thoải mái ngay từ khi bước vào. Đây không phải là hạng phòng quá phô trương, nhưng lại rất đúng nhu cầu: đủ chỗ để nghỉ, đủ tiện để sinh hoạt và đủ gần gũi để cả nhóm có thể cùng tận hưởng chuyến đi.

Quadruple Room phù hợp cho nhóm bạn muốn ở chung cho vui, gia đình nhỏ đi nghỉ hè hoặc những khách cần phòng rộng hơn Superior Room nhưng chưa cần đến Family Room. Căn phòng giúp mọi người dễ chuẩn bị lịch trình, dễ trò chuyện, dễ sắp xếp hành lý và dễ kết nối hơn trong suốt kỳ nghỉ.

Sau một ngày đi biển, ăn uống, khám phá đảo hoặc chụp ảnh quanh Phú Quốc, việc trở về một căn phòng rộng vừa đủ và sạch sẽ sẽ giúp cả nhóm nghỉ ngơi tốt hơn. Đó là giá trị lớn nhất của Quadruple Room: không quá nhiều, không quá ít, mà vừa đúng cho một chuyến đi ấm áp và nhẹ nhàng hơn.

Nếu bạn đang đi Phú Quốc cùng 3–4 người, đây là hạng phòng rất đáng để xem trước khi đặt.',
  'Traveling to Phu Quoc with a small group of friends or family is always more enjoyable when everyone can stay close. But choosing the right room for 3–4 guests can sometimes be the tricky part.

Booking separate rooms may cost more and make group activities less convenient. Choosing a room that is too small may make everyone feel cramped. That is why Quadruple Room at SK Boutique Hotel is a practical choice for small-group trips.

The room is arranged to feel neat, warm, and easy to use. Two large beds, bright wooden tones, clean white bedding, and soft lighting create a comfortable atmosphere from the moment you enter. It is not an overly flashy room, but it suits the need very well: enough space to rest, enough convenience to stay together, and enough warmth to make the trip feel connected.

Quadruple Room is suitable for friends who want to stay together, small families on a summer trip, or guests who need more space than Superior Room but do not necessarily need the full Family Room option. It helps everyone plan the day more easily, talk together, arrange luggage, and stay connected throughout the trip.

After a day at the beach, a seafood meal, island exploration, or photo stops around Phu Quoc, returning to a clean and comfortably sized room makes the group feel more rested. That is the real value of Quadruple Room: not too much, not too little, but just right for a warmer and easier trip.

If you are visiting Phu Quoc with 3–4 guests, this is a room type worth considering before booking.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'meo-dat-phong',
  ARRAY['PhuQuoc', 'QuadrupleRoom', 'HangPhong', 'SKBoutique'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-15',
  70
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'cam-on-khach-hang-da-chon-sk-boutique-hotel',
  'Cảm ơn những vị khách đáng quý đã chọn SK Boutique Hotel',
  'Thank You to the Guests Who Chose SK Boutique Hotel',
  'SK Boutique Hotel Phu Quoc gửi lời cảm ơn đến những vị khách đã lưu trú, chia sẻ khoảnh khắc và tạo nên sự ấm áp cho khách sạn.',
  'SK Boutique Hotel Phu Quoc thanks every guest who has stayed, shared moments, and brought warmth to the hotel experience.',
  'Có những khoảnh khắc làm cho một khách sạn trở nên ấm áp hơn. Đó là nụ cười của khách trong một tấm ảnh, là lời nhắn cảm ơn sau kỳ nghỉ, là một lần khách quay lại hoặc đơn giản là cảm giác vui vẻ khi mọi người có một chuyến đi trọn vẹn.

Tại SK Boutique Hotel, chúng tôi luôn trân trọng từng vị khách đã chọn lưu trú trong hành trình tại Phú Quốc. Mỗi khách hàng đến với SK đều mang theo một câu chuyện riêng: có người đi cùng gia đình, có người đi với bạn bè, có người đến để nghỉ ngắn ngày, có người chọn Phú Quốc như một nơi để nạp lại năng lượng sau thời gian bận rộn.

Với đội ngũ SK, được nhìn thấy khách thoải mái, được hỗ trợ khách trong suốt chuyến đi và được lưu giữ những khoảnh khắc đẹp là một niềm vui rất lớn. Những điều đó nhắc chúng tôi rằng khách sạn không chỉ là phòng, giường hay tiện nghi. Khách sạn còn là cảm giác được chào đón, được lắng nghe và được chăm sóc bằng sự chân thành.

Chúng tôi biết rằng mỗi chuyến đi đều là một khoảng thời gian đáng quý. Vì vậy, SK luôn cố gắng giữ mọi thứ sạch sẽ, gọn gàng, thân thiện và dễ chịu nhất có thể để khách có thể yên tâm tận hưởng những ngày ở đảo ngọc.

Cảm ơn bạn đã để SK trở thành một phần nhỏ trong chuyến đi của mình. Cảm ơn những nụ cười, những bức ảnh, những lời góp ý và cả những lần quay lại.

Hy vọng trong những kỳ nghỉ tiếp theo tại Phú Quốc, SK Boutique Hotel vẫn có cơ hội được chào đón bạn thêm một lần nữa.',
  'Some moments make a hotel feel warmer. A guest’s smile in a photo, a thank-you message after the stay, a returning visit, or simply the joy of seeing people enjoy a complete trip.

At SK Boutique Hotel, we truly appreciate every guest who has chosen to stay with us during their journey in Phu Quoc. Each guest arrives with a different story: some travel with family, some with friends, some come for a short break, and some choose Phu Quoc as a place to recharge after a busy time.

For the SK team, seeing guests feel comfortable, supporting them throughout the trip, and being part of their beautiful memories is a meaningful joy. These moments remind us that a hotel is not only about rooms, beds, or facilities. It is also about feeling welcomed, listened to, and cared for with sincerity.

We understand that every trip is valuable. That is why SK continues to focus on keeping the stay clean, tidy, friendly, and pleasant, so guests can enjoy their days on the island with peace of mind.

Thank you for letting SK become a small part of your journey. Thank you for the smiles, the photos, the feedback, and the times you return.

We hope that on your next trip to Phu Quoc, SK Boutique Hotel will have the opportunity to welcome you again.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'trai-nghiem',
  ARRAY['PhuQuoc', 'KhachHang', 'CamOn', 'SKBoutique'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-13',
  80
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'khoanh-khac-mat-lanh-tai-sk-boutique-hotel-phu-quoc',
  'Một vài khoảnh khắc mát lành tại SK Boutique Hotel Phu Quoc',
  'Cool Little Moments at SK Boutique Hotel Phu Quoc',
  'Video ngắn ghi lại không gian mát mẻ, dễ chịu và những khoảnh khắc nghỉ ngơi nhẹ nhàng tại SK Boutique Hotel Phu Quoc.',
  'A short video capturing the cool, pleasant atmosphere and simple relaxing moments at SK Boutique Hotel Phu Quoc.',
  'Đôi khi, điều làm người ta muốn đi nghỉ không phải là một kế hoạch quá lớn. Chỉ là một vài khoảnh khắc rất nhỏ: một căn phòng sạch, một góc nghỉ mát, chút ánh sáng buổi chiều, tiếng nhạc nhẹ và cảm giác được tạm rời khỏi nhịp sống hằng ngày.

Video ngắn này ghi lại một vài khoảnh khắc tại SK Boutique Hotel Phu Quoc — không gian phòng, hồ bơi, những góc nhỏ trong khách sạn và cảm giác nhẹ nhàng của một kỳ nghỉ ở đảo. Không cần kể quá nhiều, vì đôi khi hình ảnh tự nó đã đủ để gợi ra cảm giác muốn đi đâu đó một chút.

Với SK, sự thoải mái của khách không chỉ đến từ tiện nghi. Nó còn đến từ việc mọi thứ được giữ sạch sẽ, gọn gàng và dễ chịu. Phòng có đủ sự riêng tư để nghỉ ngơi. Không gian có đủ sự ấm áp để cảm thấy gần gũi. Vị trí thuận tiện giúp khách dễ di chuyển cho các lịch trình ở Phú Quốc.

Một chuyến đi ngắn có thể bắt đầu rất đơn giản: chọn ngày, chọn phòng, xếp vài món đồ cần thiết và cho mình một khoảng thời gian để nghỉ. Phú Quốc sẽ có biển, nắng, gió và những buổi chiều đẹp. SK sẽ là nơi để bạn trở về sau mỗi hành trình trong ngày.

Nếu bạn đang cần một kỳ nghỉ không quá cầu kỳ nhưng đủ dễ chịu, có lẽ những khoảnh khắc nhỏ trong video này sẽ là lời gợi ý nhẹ nhàng nhất.',
  'Sometimes, what makes people want to take a break is not a big plan. It can be a few small moments: a clean room, a cool corner, soft afternoon light, gentle music, and the feeling of stepping away from daily routines for a while.

This short video captures a few moments at SK Boutique Hotel Phu Quoc — the rooms, the pool, small hotel corners, and the easy feeling of an island stay. There is no need to explain too much, because sometimes the images are enough to make you want a short getaway.

At SK, guest comfort does not come only from facilities. It also comes from keeping everything clean, tidy, and pleasant. The rooms offer enough privacy to rest. The space feels warm enough to be welcoming. The location makes it easier for guests to move around Phu Quoc during their stay.

A short trip can begin very simply: choose the dates, choose the room, pack a few essentials, and give yourself time to rest. Phu Quoc will bring the sea, sun, breeze, and beautiful afternoons. SK will be the place you return to after each day’s journey.

If you are looking for a break that is not too complicated but still feels comfortable, the small moments in this video may be the easiest invitation.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'trai-nghiem',
  ARRAY['PhuQuoc', 'SKBoutique', 'Video', 'NghiDuong'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-11',
  90
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_posts (
  slug,
  title_vi,
  title_en,
  excerpt_vi,
  excerpt_en,
  body_vi,
  body_en,
  cover_image_path,
  author_name,
  author_role_vi,
  author_role_en,
  author_bio_vi,
  author_bio_en,
  author_image_path,
  category,
  tags,
  read_time_vi,
  read_time_en,
  is_published,
  is_featured,
  published_at,
  sort_order
) values (
  'robot-made-in-vietnam-tai-phu-quoc-vinpearl-safari',
  'Robot hình người “Made in Vietnam” đã bắt đầu đi làm tại Phú Quốc?',
  'A ‘Made in Vietnam’ Humanoid Robot Has Started Working in Phu Quoc?',
  'Robot hình người Dyno của VinDynamics xuất hiện tại Vinpearl Safari Phú Quốc, mang đến một trải nghiệm công nghệ mới cho du khách đảo ngọc.',
  'Dyno, a humanoid robot by VinDynamics, has appeared at Vinpearl Safari Phu Quoc, adding a new technology experience for island visitors.',
  'Phú Quốc đang có thêm một lý do rất mới để du khách tò mò: robot hình người “Made in Vietnam” đã bắt đầu xuất hiện trong trải nghiệm du lịch thực tế.

Theo thông tin tham khảo từ GenK, robot hình người Dyno của VinDynamics đã xuất hiện tại Vinpearl Safari Phú Quốc. Đây là một dấu hiệu thú vị cho thấy công nghệ Việt Nam đang dần bước ra khỏi phòng thí nghiệm, đi vào những không gian đời sống và du lịch gần gũi hơn với công chúng.

Với du khách, điều này làm cho hành trình Phú Quốc trở nên khác biệt hơn. Trước đây, người ta thường nghĩ đến Phú Quốc với biển xanh, cáp treo, Safari, chợ đêm, hải sản và những khu nghỉ dưỡng. Giờ đây, đảo ngọc còn có thêm một điểm chạm công nghệ: cơ hội nhìn thấy robot hình người trong một không gian tham quan thật, thân thiện và dễ tiếp cận.

Một chuyến đi Phú Quốc vì thế không chỉ là nghỉ dưỡng. Đó còn có thể là hành trình khám phá những điều mới: thiên nhiên, động vật, biển đảo, văn hoá địa phương và cả công nghệ “Made in Vietnam”. Ban ngày, bạn có thể đưa gia đình đến Safari để trải nghiệm không khí khám phá. Buổi chiều, trở về khách sạn nghỉ ngơi, tắm mát, thư giãn và chuẩn bị cho một buổi tối nhẹ nhàng ở đảo.

Tại SK Boutique Hotel, chúng tôi rất vui khi được đón những du khách đến Phú Quốc để trải nghiệm các điểm đến mới mẻ như vậy. Một nơi lưu trú sạch sẽ, ấm cúng và thuận tiện sẽ giúp chuyến đi trở nên trọn vẹn hơn, đặc biệt khi lịch trình có nhiều hoạt động ngoài trời.

Phú Quốc đang ngày càng có nhiều điều để khám phá. Và có lẽ, robot Dyno tại Vinpearl Safari là một trong những câu chuyện thú vị nhất để bắt đầu chuyến đi mùa này.

Nếu bạn đang lên kế hoạch đến Phú Quốc, hãy để SK Boutique Hotel là nơi dừng chân sau những giờ khám phá đảo ngọc.',
  'Phu Quoc now has one more new reason for travelers to be curious: a “Made in Vietnam” humanoid robot has started appearing in a real tourism experience.

According to information referenced from GenK, Dyno, a humanoid robot developed by VinDynamics, has appeared at Vinpearl Safari Phu Quoc. This is an interesting sign that Vietnamese technology is gradually moving beyond laboratories and into real-life spaces where the public can see and experience it more closely.

For visitors, this adds a different layer to a Phu Quoc trip. People usually think of the island for its blue seas, cable car, Safari, night market, seafood, and resort atmosphere. Now, Phu Quoc also has a technology touchpoint: the chance to see a humanoid robot in a real, friendly, and accessible travel setting.

A trip to Phu Quoc, therefore, can be more than a beach holiday. It can also be a journey of discovery: nature, animals, island life, local culture, and even “Made in Vietnam” technology. During the day, families can visit Safari and enjoy a sense of exploration. In the afternoon, they can return to the hotel, cool down, relax, and get ready for a gentle island evening.

At SK Boutique Hotel, we are happy to welcome travelers who come to Phu Quoc to experience new and exciting destinations like this. A clean, cozy, and convenient place to stay can make the trip feel more complete, especially when the itinerary includes many outdoor activities.

Phu Quoc is becoming richer in experiences. And perhaps Dyno at Vinpearl Safari is one of the most interesting stories to begin your island trip this season.

If you are planning to visit Phu Quoc, let SK Boutique Hotel be your comfortable stop after a day of discovery.',
  '/assets/pool/1.png',
  'SK Boutique',
  'Đội ngũ nội dung · SK Boutique',
  'Content Team · SK Boutique',
  'Những câu chuyện và cẩm nang từ đội ngũ SK Boutique Hotel Phú Quốc.',
  'Stories and guides from the team at SK Boutique Hotel Phu Quoc.',
  '/logo-fb.png',
  'tin-tuc',
  ARRAY['PhuQuoc', 'TinTuc', 'VinpearlSafari', 'Robot'],
  '3 phút đọc',
  '3 min read',
  true,
  false,
  '2026-05-30',
  100
)
on conflict (slug) do update set
  title_vi = excluded.title_vi, title_en = excluded.title_en, excerpt_vi = excluded.excerpt_vi, excerpt_en = excluded.excerpt_en, body_vi = excluded.body_vi, body_en = excluded.body_en, cover_image_path = excluded.cover_image_path, author_name = excluded.author_name, author_role_vi = excluded.author_role_vi, author_role_en = excluded.author_role_en, author_bio_vi = excluded.author_bio_vi, author_bio_en = excluded.author_bio_en, author_image_path = excluded.author_image_path, category = excluded.category, tags = excluded.tags, read_time_vi = excluded.read_time_vi, read_time_en = excluded.read_time_en, is_published = excluded.is_published, is_featured = excluded.is_featured, published_at = excluded.published_at, sort_order = excluded.sort_order;
