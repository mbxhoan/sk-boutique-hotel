# Full Open Graph + Social Sharing Meta Tags

## Vấn đề
Khi chia sẻ link phòng (vd: `https://www.skhotel.com.vn/rooms?room=quadruple-room`) trên Zalo, Messenger, Facebook... → link hiển thị trắng trơn, không có ảnh, tiêu đề, hay mô tả nào. So sánh với YouTube luôn hiển thị thumbnail + title + description đầy đủ.

### Nguyên nhân gốc
1. **Room detail page** (`/rooms/[slug]`) chỉ set `openGraph.images` với raw path, **thiếu** `title`, `description`, `type`, `siteName` trong OG
2. **Event detail page** (`/su-kien/[slug]`) — cùng vấn đề
3. **Không có dynamic OG image** cho từng phòng/sự kiện — chỉ có 1 route `/api/og/home`
4. **Các trang listing** (rooms, su-kien, about-us, home) — không override OG gì → fallback về global OG (chung chung)
5. **Thiếu Twitter Card** trên tất cả trang con
6. **Thiếu `og:locale`** cho bilingual support

---

## Proposed Changes

### 1. Tạo OG Image Generation Utility

#### [NEW] [og-utils.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/lib/og-utils.tsx)
Shared utilities cho tất cả OG image routes:
- `loadLogoDataUrl()` — load logo PNG as base64 (tái sử dụng từ home route)
- `OgBaseLayout` — shared JSX layout (gradient background, logo panel, gold border)
- Tránh duplicate code giữa các route

---

### 2. Dynamic OG Image Routes

#### [NEW] [route.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/api/og/room/route.tsx)
**Route**: `/api/og/room?slug=family-room`
- Fetch room type by slug
- Render 1200×630 image with:
  - Room name (vi by default)
  - Room summary/description snippet
  - Room cover image as background (or gradient fallback)
  - "SK Boutique Hotel" branding
  - Bed type, capacity, size info badges
  - Warm premium styling matching `/api/og/home`

#### [NEW] [route.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/api/og/event/route.tsx)
**Route**: `/api/og/event?slug=event-slug`
- Fetch event by slug
- Render 1200×630 image with:
  - Event title
  - Event date
  - Cover image or gradient fallback
  - Hotel branding

#### [NEW] [route.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/api/og/rooms/route.tsx)
**Route**: `/api/og/rooms`
- Static OG for rooms listing page
- "Hạng phòng" / room types overview image
- Hotel branding

#### [NEW] [route.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/api/og/about/route.tsx)
**Route**: `/api/og/about`
- OG for about-us page

#### [NEW] [route.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/api/og/events/route.tsx)
**Route**: `/api/og/events`
- OG for events listing page

---

### 3. Shared Metadata Builder

#### [NEW] [metadata.ts](file:///Users/leviackerman/Codes/sk-boutique-hotel/lib/metadata.ts)
Helper function để tạo complete metadata object:

```typescript
function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  ogImagePath: string;
  locale?: Locale;
  type?: "website" | "article";
}): Metadata
```

Tự động bao gồm:
- `openGraph.title`, `description`, `images`, `siteName`, `type`, `locale`, `url`
- `twitter.card`, `title`, `description`, `images`
- `alternates.canonical`
- `alternates.languages` (vi/en)

---

### 4. Update All Page Metadata

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/rooms/[slug]/page.tsx)
Room detail — add full OG + Twitter:
```typescript
return buildPageMetadata({
  title: seoTitle || name,
  description: seoDescription || summary,
  path: `/rooms/${slug}`,
  ogImagePath: `/api/og/room?slug=${slug}`,
  locale,
  type: "article"
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/su-kien/[slug]/page.tsx)
Event detail — add full OG + Twitter:
```typescript
return buildPageMetadata({
  title,
  description,
  path: `/su-kien/${slug}`,
  ogImagePath: `/api/og/event?slug=${slug}`,
  locale,
  type: "article"
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/rooms/page.tsx)
Rooms listing — add OG override:
```typescript
return buildPageMetadata({
  title,
  description,
  path: "/rooms",
  ogImagePath: "/api/og/rooms",
  locale
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/page.tsx)
Home page — ensure explicit OG with `/api/og/home`:
```typescript
return buildPageMetadata({
  title: localize(locale, page.seo.title),
  description: localize(locale, page.seo.description),
  path: "/",
  ogImagePath: "/api/og/home",
  locale
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/about-us/page.tsx)
About us — add OG:
```typescript
return buildPageMetadata({
  title,
  description,
  path: "/about-us",
  ogImagePath: "/api/og/about",
  locale
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/su-kien/page.tsx)
Events listing — add OG:
```typescript
return buildPageMetadata({
  title,
  description,
  path: "/su-kien",
  ogImagePath: "/api/og/events",
  locale
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/[slug]/page.tsx)
Dynamic CMS pages — add OG with home fallback image:
```typescript
return buildPageMetadata({
  title,
  description,
  path: `/${slug}`,
  ogImagePath: "/api/og/home",
  locale
});
```

#### [MODIFY] [page.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/(marketing)/thanh-toan/[token]/page.tsx)
Payment page — minimal OG (no sensitive info), `robots: noindex`:
```typescript
return {
  ...buildPageMetadata({
    title,
    description,
    path: `/thanh-toan/${token}`,
    ogImagePath: "/api/og/home",
    locale
  }),
  robots: { index: false, follow: false }
};
```

---

### 5. Refactor existing OG home route

#### [MODIFY] [route.tsx](file:///Users/leviackerman/Codes/sk-boutique-hotel/app/api/og/home/route.tsx)
- Extract shared layout logic to `lib/og-utils.tsx`
- Keep unique home content (headline, description)

---

### 6. Event select fix

#### [MODIFY] [events.ts](file:///Users/leviackerman/Codes/sk-boutique-hotel/lib/supabase/queries/events.ts)
- Add `show_detail_link` to `eventSelect` string (currently missing but used in page component)

---

## Verification Plan

### Automated Tests
1. `curl -I https://localhost:3000/api/og/room?slug=family-room` → should return `200` with `content-type: image/png`
2. `curl -I https://localhost:3000/api/og/event?slug=...` → should return `200`
3. `curl -I https://localhost:3000/api/og/rooms` → `200`
4. `curl -I https://localhost:3000/api/og/about` → `200`
5. `curl -I https://localhost:3000/api/og/events` → `200`
6. Check HTML source of `/rooms/family-room` → verify `og:title`, `og:description`, `og:image`, `twitter:card` present
7. Check HTML source of `/rooms` → verify OG tags
8. Check HTML source of `/` → verify OG tags

### Manual Verification
1. Share `/rooms/family-room` link on Zalo → should show rich preview card
2. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to validate OG tags
3. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) for Twitter cards
4. Visually verify each OG image at `/api/og/room?slug=family-room`, etc.

---

## Summary of Deliverables

| Page | OG Image | OG Title | OG Desc | Twitter Card | Locale |
|------|----------|----------|---------|--------------|--------|
| `/` (Home) | `/api/og/home` | ✅ | ✅ | ✅ | ✅ |
| `/rooms` | `/api/og/rooms` | ✅ | ✅ | ✅ | ✅ |
| `/rooms/[slug]` | `/api/og/room?slug=x` | ✅ | ✅ | ✅ | ✅ |
| `/about-us` | `/api/og/about` | ✅ | ✅ | ✅ | ✅ |
| `/su-kien` | `/api/og/events` | ✅ | ✅ | ✅ | ✅ |
| `/su-kien/[slug]` | `/api/og/event?slug=x` | ✅ | ✅ | ✅ | ✅ |
| `/[slug]` (CMS) | `/api/og/home` | ✅ | ✅ | ✅ | ✅ |
| `/thanh-toan/[token]` | `/api/og/home` | ✅ | ✅ | ✅ | noindex |
