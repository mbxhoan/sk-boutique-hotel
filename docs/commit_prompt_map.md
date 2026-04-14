# Commit Prompt Map

Mục đích: lưu quan hệ giữa prompt/user request và commit message đề xuất để truy vết thay đổi.

## 2026-04-11

### Entry 000
- `time`: 2026-04-11T17:30:00+07:00
- `prompt_summary`: Tách frontend foundation thành marketing, member, và admin shell theo App Router, giữ thay đổi tối thiểu.
- `commit_message`: `feat(shells): split marketing, member, and admin App Router layouts`
- `main_files`:
  - `app/(marketing)/layout.tsx`
  - `app/(marketing)/page.tsx`
  - `app/(marketing)/[slug]/page.tsx`
  - `app/(member)/layout.tsx`
  - `app/(admin)/layout.tsx`
  - `components/portal-ui.tsx`
  - `components/member-shell.tsx`
  - `components/admin-shell.tsx`
  - `lib/mock/marketing-home.ts`
  - `lib/mock/member-dashboard.ts`
  - `lib/mock/admin-dashboard.ts`

### Entry 001
- `time`: 2026-04-11T18:15:19+07:00
- `prompt_summary`: Dựng public frontend CMS-ready với homepage config-driven, room/branch detail có VI/EN zones, và news list/detail có layout riêng.
- `commit_message`: `feat(public-cms): add CMS-ready public content routes`
- `main_files`:
  - `components/public-cms.tsx`
  - `components/marketing-home.tsx`
  - `app/(marketing)/page.tsx`
  - `app/(marketing)/phong/page.tsx`
  - `app/(marketing)/phong/[slug]/page.tsx`
  - `app/(marketing)/chi-nhanh/page.tsx`
  - `app/(marketing)/chi-nhanh/[slug]/page.tsx`
  - `app/(marketing)/tin-tuc/layout.tsx`
  - `app/(marketing)/tin-tuc/page.tsx`
  - `app/(marketing)/tin-tuc/[slug]/page.tsx`
  - `lib/mock/public-cms.ts`
  - `lib/site-content.ts`
  - `lib/locale.ts`
  - `app/globals.css`

### Entry 002
- `time`: 2026-04-11T18:45:33+07:00
- `prompt_summary`: Thiết lập nền Supabase thật cho phase C: clients, auth helpers, migration/seed cho branches, floors, rooms, room_types, customers, và nối route public qua query helpers theo feature.
- `commit_message`: `feat(supabase): add hotel base schema and SSR data layer`
- `main_files`:
  - `package.json`
  - `package-lock.json`
  - `middleware.ts`
  - `lib/supabase/auth.ts`
  - `lib/supabase/browser.ts`
  - `lib/supabase/content.ts`
  - `lib/supabase/database.types.ts`
  - `lib/supabase/env.ts`
  - `lib/supabase/middleware.ts`
  - `lib/supabase/read-client.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/service.ts`
  - `lib/supabase/queries/branches.ts`
  - `lib/supabase/queries/customers.ts`
  - `lib/supabase/queries/floors.ts`
  - `lib/supabase/queries/room-types.ts`
  - `lib/supabase/queries/rooms.ts`
  - `lib/supabase/queries/shared.ts`
  - `app/(marketing)/chi-nhanh/page.tsx`
  - `app/(marketing)/chi-nhanh/[slug]/page.tsx`
  - `app/(marketing)/phong/page.tsx`
  - `app/(marketing)/phong/[slug]/page.tsx`
  - `components/public-cms.tsx`
  - `components/portal-ui.tsx`
  - `lib/mock/public-cms.ts`
  - `supabase/config.toml`
  - `supabase/migrations/20260411112559_phase_c_hotel_core.sql`
  - `supabase/seed.sql`

### Entry 003
- `time`: 2026-04-11T20:40:40+07:00
- `prompt_summary`: Đồng bộ typography public site với DESIGN.md: chuyển headline sang Montserrat, giảm cỡ tiêu đề quá lớn, và nới line-height cho desktop/mobile.
- `commit_message`: `fix(typography): align display scale with Montserrat spec`
- `main_files`:
  - `app/layout.tsx`
  - `app/globals.css`
  - `package.json`
  - `package-lock.json`

### Entry 004
- `time`: 2026-04-11T20:44:35+07:00
- `prompt_summary`: Thiết lập MCP client cho Supabase trong workspace bằng cấu hình .vscode/mcp.json để có thể inspect schema và data từ VS Code.
- `commit_message`: `chore(vscode): add Supabase MCP client config`
- `main_files`:
  - `.vscode/mcp.json`

### Entry 005
- `time`: 2026-04-11T22:10:00+07:00
- `prompt_summary`: Triển khai phase D cho availability, hold, reservation workflow với schema Supabase, query/service helpers, và admin console tối thiểu.
- `commit_message`: `feat(workflow): add availability, hold, and reservation console`
- `main_files`:
  - `app/(admin)/admin/actions.ts`
  - `app/(admin)/admin/page.tsx`
  - `app/globals.css`
  - `components/admin-dashboard.tsx`
  - `components/admin-workflow-dashboard.tsx`
  - `lib/supabase/database.types.ts`
  - `lib/supabase/workflow.types.ts`
  - `lib/supabase/workflows.ts`
  - `lib/supabase/queries/operations.ts`
  - `lib/supabase/queries/availability-requests.ts`
  - `lib/supabase/queries/room-holds.ts`
  - `lib/supabase/queries/reservations.ts`
  - `lib/supabase/queries/audit-logs.ts`
  - `lib/supabase/queries/availability.ts`
  - `lib/supabase/queries/branches.ts`
  - `lib/supabase/queries/room-types.ts`
  - `supabase/migrations/20260411214500_phase_d_availability_hold_reservation.sql`

### Entry 006
- `time`: 2026-04-11T21:42:37+07:00
- `prompt_summary`: Sửa lỗi `supabase db reset --linked --debug` do seed `room_types` dư 1 expression so với schema, khiến INSERT fail ở bước import seed.
- `commit_message`: `fix(seed): align room_types seed rows with schema`
- `main_files`:
  - `supabase/seed.sql`

### Entry 007
- `time`: 2026-04-11T23:20:00+07:00
- `prompt_summary`: Triển khai phase E cho deposit QR, payment proof upload, manual payment verification, booking confirmation hooks, và member history UI trên nền Supabase thật.
- `commit_message`: `feat(payments): add deposit QR, proof upload, and member history`
- `main_files`:
  - `app/(admin)/admin/actions.ts`
  - `app/(marketing)/thanh-toan/[token]/page.tsx`
  - `app/actions/payments.ts`
  - `app/(member)/member/page.tsx`
  - `components/admin-workflow-dashboard.tsx`
  - `components/member-history-dashboard.tsx`
  - `lib/supabase/payments.ts`
  - `lib/supabase/audit.ts`
  - `lib/supabase/database.types.ts`
  - `lib/supabase/env.ts`
  - `lib/supabase/queries/branch-bank-accounts.ts`
  - `lib/supabase/queries/member-history.ts`
  - `lib/supabase/queries/payment-proofs.ts`
  - `lib/supabase/queries/payment-requests.ts`
  - `lib/supabase/queries/operations.ts`
  - `lib/supabase/queries/customers.ts`
  - `lib/supabase/workflow.types.ts`
  - `supabase/migrations/20260411235500_phase_e_payment_proof_confirmation.sql`
  - `supabase/seed.sql`

### Entry 008
- `time`: 2026-04-11T23:45:00+07:00
- `prompt_summary`: Bổ sung phần còn sót từ blueprint/BRD/backlog bằng analytics tracking foundation, public CTA/page view instrumentation, và admin analytics stats.
- `commit_message`: `feat(analytics): add public event tracking and admin stats`
- `main_files`:
  - `app/(marketing)/[slug]/page.tsx`
  - `app/(marketing)/chi-nhanh/[slug]/page.tsx`
  - `app/(marketing)/chi-nhanh/page.tsx`
  - `app/(marketing)/phong/[slug]/page.tsx`
  - `app/(marketing)/phong/page.tsx`
  - `app/(marketing)/thanh-toan/[token]/page.tsx`
  - `app/(marketing)/tin-tuc/[slug]/page.tsx`
  - `app/(marketing)/tin-tuc/page.tsx`
  - `app/api/public/track/route.ts`
  - `components/analytics-link.tsx`
  - `components/marketing-home.tsx`
  - `components/page-view-tracker.tsx`
  - `components/public-cms.tsx`
  - `components/sections.tsx`
  - `components/site-header.tsx`
  - `lib/supabase/analytics.ts`
  - `lib/supabase/database.types.ts`
  - `lib/supabase/queries/analytics-events.ts`
  - `lib/supabase/queries/operations.ts`
  - `supabase/migrations/20260412011500_phase_e_analytics_tracking.sql`

### Entry 009
- `time`: 2026-04-12T00:10:00+07:00
- `prompt_summary`: Dập warning dev cross-origin HMR khi mở Next.js bằng IP mạng nội bộ, để giảm full reload và ổn định local admin/public refresh.
- `commit_message`: `chore(next-dev): allow local network dev origins`
- `main_files`:
  - `next.config.ts`

### Entry 010
- `time`: 2026-04-12T00:45:00+07:00
- `prompt_summary`: Seed authentication users cho admin portal, thêm gate đăng nhập admin, làm sidebar icon/collapse, và hạ size typography cho header/title trong admin UI.
- `commit_message`: `feat(admin-auth): seed users and compact admin shell`
- `main_files`:
  - `app/(admin)/layout.tsx`
  - `app/admin/sign-in/page.tsx`
  - `app/globals.css`
  - `components/admin-shell.tsx`
  - `components/admin-sign-in-form.tsx`
  - `lib/supabase/auth.ts`
  - `supabase/seed.sql`

### Entry 011
- `time`: 2026-04-12T00:55:00+07:00
- `prompt_summary`: Sửa seed auth users để không còn fail ở `crypt()` do literal chưa ép kiểu trong local Supabase reset.
- `commit_message`: `fix(seed): cast auth password literals for crypt`
- `main_files`:
  - `supabase/seed.sql`

### Entry 012
- `time`: 2026-04-12T01:00:00+07:00
- `prompt_summary`: Bỏ hẳn phụ thuộc `crypt()` trong auth seed bằng bcrypt hash literal để Supabase local reset không còn lỗi thiếu function.
- `commit_message`: `fix(seed): replace crypt with bcrypt hash literal`
- `main_files`:
  - `supabase/seed.sql`

### Entry 013
- `time`: 2026-04-12T01:05:00+07:00
- `prompt_summary`: Sửa `ON CONFLICT` của auth seed từ email sang id vì local `auth.users` không có unique arbiter trên email.
- `commit_message`: `fix(seed): upsert auth users by id`
- `main_files`:
  - `supabase/seed.sql`

### Entry 014
- `time`: 2026-04-12T01:12:00+07:00
- `prompt_summary`: Sửa Supabase browser client để đọc env public bằng access trực tiếp, tránh Next.js bỏ qua biến khi bundle client.
- `commit_message`: `fix(supabase): inline public envs for browser client`

### Entry 015
- `time`: 2026-04-12T01:30:00+07:00
- `prompt_summary`: Chốt lại seeded admin password cho auth demo, đồng bộ hint UI để hết mơ hồ khi đăng nhập admin portal.
- `commit_message`: `fix(auth-seed): use explicit dev password for seeded users`
- `main_files`:
  - `supabase/seed.sql`
  - `components/admin-sign-in-form.tsx`

### Entry 016
- `time`: 2026-04-12T01:20:00+07:00
- `prompt_summary`: Thêm rule trong AGENTS.md yêu cầu mọi error UI phải có fallback song ngữ VI/EN và sửa admin sign-in để không hiển thị lỗi raw/generic của Supabase.
- `commit_message`: `fix(admin-auth): localize sign-in errors bilingually`
- `main_files`:
  - `AGENTS.md`
  - `components/admin-sign-in-form.tsx`

### Entry 017
- `time`: 2026-04-12T01:32:00+07:00
- `prompt_summary`: Thêm toggle VI/EN cho admin sign-in và hiển thị copy/error theo đúng ngôn ngữ đang chọn hoặc mặc định.
- `commit_message`: `feat(admin-auth): add bilingual locale switch to sign-in`
- `main_files`:
  - `AGENTS.md`
  - `app/admin/sign-in/page.tsx`
  - `app/globals.css`
  - `components/admin-sign-in-form.tsx`

### Entry 018
- `time`: 2026-04-12T01:45:00+07:00
- `prompt_summary`: Thu nhỏ typography của portal shell/admin member area để text thường, tiêu đề, stats và auth heading không còn quá to.
- `commit_message`: `fix(portal-typography): reduce admin and member text scale`
- `main_files`:
  - `app/globals.css`

### Entry 019
- `time`: 2026-04-12T02:00:00+07:00
- `prompt_summary`: Tách seeding authentication users ra khỏi seed.sql sang script riêng dùng Supabase Auth admin API, đồng thời nối lại customer member sau khi seed auth.
- `commit_message`: `feat(auth-seed): move seeded users into auth admin script`
- `main_files`:
  - `package.json`
  - `scripts/seed-auth-users.mjs`
  - `supabase/auth-users.seed.mjs`
  - `supabase/seed.sql`
  - `components/admin-sign-in-form.tsx`

### Entry 020
- `time`: 2026-04-12T02:15:00+07:00
- `prompt_summary`: Chỉnh homepage hero theo bố cục header, title lớn ở giữa, subtitle và banner lớn bên dưới; giữ hero split nguyên cho các trang con.
- `commit_message`: `feat(homepage-hero): center hero copy and add banner layout`
- `main_files`:
  - `lib/mock/public-cms.ts`
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 021
- `time`: 2026-04-12T02:30:00+07:00
- `prompt_summary`: Đổi phần nội dung ngay dưới hero của homepage sang layout about-us với chữ bên trái, collage 2 ảnh bên phải và stats row bên dưới, đồng thời giữ các section CMS-ready phía sau.
- `commit_message`: `feat(homepage-content): add about section with image collage`
- `main_files`:
  - `lib/mock/public-cms.ts`
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 022
- `time`: 2026-04-12T02:45:00+07:00
- `prompt_summary`: Tạo favicon và meta social preview từ `public/logo.png`, đồng thời cập nhật metadata root để link trang chính hiển thị logo đúng brand.
- `commit_message`: `feat(brand-assets): generate favicon and social preview from logo`
- `main_files`:
  - `app/layout.tsx`
  - `app/icon.tsx`
  - `app/opengraph-image.tsx`
  - `public/favicon.ico`
  - `public/apple-touch-icon.png`
  - `public/favicon-16x16.png`
  - `public/favicon-32x32.png`
  - `public/favicon-512.png`

### Entry 023
- `time`: 2026-04-12T03:00:00+07:00
- `prompt_summary`: Sửa favicon để browser ưu tiên icon vuông tương phản cao hơn, vì logo wordmark ngang quá nhỏ và khó nhận diện trong tab trình duyệt.
- `commit_message`: `fix(brand-assets): make favicon use square logo tile`
- `main_files`:
  - `app/icon.tsx`
  - `app/favicon.ico`
  - `app/favicon-512.png`
  - `app/apple-icon.png`
  - `public/favicon.ico`
  - `public/favicon-512.png`
  - `public/apple-touch-icon.png`

### Entry 024
- `time`: 2026-04-12T03:10:00+07:00
- `prompt_summary`: Gỡ code route metadata icon/OG và chuyển hoàn toàn sang file tĩnh trong app để tránh runtime error và giúp favicon/meta preview ổn định hơn trong dev.
- `commit_message`: `fix(brand-assets): switch icon and og preview to static files`
- `main_files`:
  - `app/layout.tsx`
  - `app/icon.tsx`
  - `app/opengraph-image.tsx`
  - `app/favicon.ico`
  - `app/icon.png`
  - `app/apple-icon.png`
  - `app/opengraph-image.jpg`

### Entry 025
- `time`: 2026-04-13T09:03:28+07:00
- `prompt_summary`: Dựng content_pages/loader để homepage và các trang public đọc từ Supabase trước, rồi seed lại toàn bộ public content hiện tại để có thể chỉnh sửa sau trong admin portal.
- `commit_message`: `feat(content-pages): move public content into Supabase seed`
- `main_files`:
  - `app/(marketing)/page.tsx`
  - `app/(marketing)/[slug]/page.tsx`
  - `app/(marketing)/tin-tuc/page.tsx`
  - `app/(marketing)/tin-tuc/[slug]/page.tsx`
  - `components/marketing-home.tsx`
  - `lib/supabase/content-pages.seed-data.ts`
  - `lib/supabase/queries/content-pages.ts`
  - `lib/supabase/database.types.ts`
  - `scripts/generate-content-pages-seed.mjs`
  - `supabase/migrations/20260413093000_phase_f_content_pages.sql`
  - `supabase/seed-content-pages.sql`
  - `supabase/seed.sql`
  - `package.json`
  - `tsconfig.json`

### Entry 026
- `time`: 2026-04-13T09:23:57+07:00
- `prompt_summary`: Sửa lỗi Next.js conflict giữa public favicon file và app favicon file bằng cách giữ một nguồn favicon duy nhất để `/favicon.ico` không còn 500 khi dev.
- `commit_message`: `fix(brand-assets): remove duplicate public favicon`
- `main_files`:
  - `public/favicon.ico`
  - `app/layout.tsx`
  - `app/favicon.ico`

### Entry 027
- `time`: 2026-04-13T09:23:38+07:00
- `prompt_summary`: Sửa lỗi Supabase seed `\i` không được support trong `seed.sql` bằng cách inline content pages seed vào SQL thuần để `supabase db reset` chạy qua được.
- `commit_message`: `fix(seed): inline content pages seed into main seed file`
- `main_files`:
  - `supabase/seed.sql`
  - `supabase/seed-content-pages.sql`
  - `scripts/generate-content-pages-seed.mjs`

### Entry 028
- `time`: 2026-04-13T10:01:31+07:00
- `prompt_summary`: Harden Supabase middleware against malformed auth cookies so `next dev` and `/admin` no longer crash on JSON parse errors from stale session data.
- `commit_message`: `fix(auth-middleware): ignore malformed supabase cookies`
- `main_files`:
  - `lib/supabase/middleware.ts`

### Entry 029
- `time`: 2026-04-13T10:08:45+07:00
- `prompt_summary`: Add admin sidebar groups and route pages for account management, roles/permissions, and pages/posts so the operational shell also exposes the missing admin content menus.
- `commit_message`: `feat(admin-menu): add account role and content management routes`
- `main_files`:
  - `components/admin-shell.tsx`
  - `components/admin-management-page.tsx`
  - `lib/mock/admin-dashboard.ts`
  - `lib/mock/admin-management.ts`
  - `app/(admin)/admin/accounts/page.tsx`
  - `app/(admin)/admin/roles/page.tsx`
  - `app/(admin)/admin/content-pages/page.tsx`
  - `app/globals.css`

### Entry 030
- `time`: 2026-04-13T17:11:04+07:00
- `prompt_summary`: Turn the section below About us into a curated showcase of three selected room types, each with an image, title, and short description like the reference layout.
- `commit_message`: `feat(homepage-showcase): add selected room cards below about section`
- `main_files`:
  - `lib/mock/public-cms.ts`
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 031
- `time`: 2026-04-13T17:14:20+07:00
- `prompt_summary`: Replace the two collage frames in the About section with real images so the feature block reads like a visual editorial collage instead of mock panels.
- `commit_message`: `feat(homepage-collage): swap feature frames to real images`
- `main_files`:
  - `lib/mock/public-cms.ts`
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 032
- `time`: 2026-04-13T17:20:19+07:00
- `prompt_summary`: Replace the 30m hold SLA stat with a more content-led metric and add a soft warm-gray overlay layer to the about collage images so text reads more clearly over the visuals.
- `commit_message`: `fix(homepage-collage): soften feature images and update metric copy`
- `main_files`:
  - `lib/mock/public-cms.ts`
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 033
- `time`: 2026-04-13T17:28:24+07:00
- `prompt_summary`: Redesign the public site header into a premium boutique menu with compact top-level nav, dropdowns for Discover/About SK, a tablet/mobile drawer, and a stronger booking CTA.
- `commit_message`: `feat(header-nav): redesign public menu for boutique hotel navigation`
- `main_files`:
  - `components/site-header.tsx`
  - `lib/site-content.ts`
  - `app/globals.css`

### Entry 034
- `time`: 2026-04-14T10:15:53+07:00
- `prompt_summary`: Áp overlay riêng cho 2 ảnh collage trong feature hero để chữ đọc rõ hơn và giữ cảm giác boutique ấm, mềm.
- `commit_message`: `style(cms-feature): add warm overlays to collage frames`
- `main_files`:
  - `app/globals.css`

### Entry 030
- `time`: 2026-04-13T13:21:00+07:00
- `prompt_summary`: Chuyển hero section trang chính từ visual-panel tĩnh sang carousel slider nhiều ảnh, mỗi slide có ảnh nền, nội dung VI/EN riêng và CTA riêng.
- `commit_message`: `feat(homepage): add hero carousel slider with 3 slides and bilingual content`
- `main_files`:
  - `lib/mock/public-cms.ts`
  - `components/hero-carousel.tsx`
  - `components/public-cms.tsx`
  - `app/globals.css`
  - `public/hero/hero-1.png`
  - `public/hero/hero-2.png`
  - `public/hero/hero-3.png`
  - `supabase/seed-content-pages.sql`
