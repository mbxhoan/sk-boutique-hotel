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

### Entry 035
- `time`: 2026-04-14T10:15:53+07:00
- `prompt_summary`: Dời overlay của 2 ảnh collage xuống phần đáy để highlight cụm text ngay khu vực được khoanh đỏ.
- `commit_message`: `style(cms-feature): move collage overlays to bottom bands`
- `main_files`:
  - `app/globals.css`

### Entry 036
- `time`: 2026-04-14T10:15:53+07:00
- `prompt_summary`: Thay ô VI/EN trên homepage bằng metric hỗ trợ 24/7 để phần stat đọc đúng nội dung dịch vụ.
- `commit_message`: `feat(homepage-metrics): swap bilingual stat for 24-7 support`
- `main_files`:
  - `lib/mock/marketing-home.ts`

### Entry 037
- `time`: 2026-04-14T10:15:53+07:00
- `prompt_summary`: Làm section About-us của homepage thành collage editorial có backdrop mờ phía sau, giống ảnh minh hoạ user gửi.
- `commit_message`: `feat(home-about): add editorial collage backdrop`
- `main_files`:
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 038
- `time`: 2026-04-14T10:41:12+07:00
- `prompt_summary`: Chỉnh about-us ở homepage theo ảnh minh hoạ với 2 card overlay chồng lớp, backdrop blur và bỏ stat row để section giống mẫu hơn.
- `commit_message`: `feat(home-about): add layered overlay collage for about section`
- `main_files`:
  - `components/public-cms.tsx`
  - `app/globals.css`
  - `lib/mock/public-cms.ts`
  - `supabase/seed-content-pages.sql`
  - `supabase/seed.sql`

### Entry 039
- `time`: 2026-04-14T11:05:54+07:00
- `prompt_summary`: Thêm lại stat row bên dưới about us trên homepage, đổi thứ tự nội dung thành 03 hạng phòng, 20 phút để vào trung tâm, và 24/7 hỗ trợ.
- `commit_message`: `feat(home-about): restore stats strip under about collage`
- `main_files`:
  - `components/public-cms.tsx`
  - `lib/mock/public-cms.ts`
  - `supabase/seed-content-pages.sql`
  - `supabase/seed.sql`

### Entry 040
- `time`: 2026-04-14T11:25:08+07:00
- `prompt_summary`: Buộc dropdown menu header desktop chỉ cho phép mở một menu tại một thời điểm để mở menu mới thì menu cũ tự đóng.
- `commit_message`: `fix(header-dropdown): keep only one desktop dropdown open`
- `main_files`:
  - `components/site-header.tsx`

### Entry 041
- `time`: 2026-04-14T11:25:08+07:00
- `prompt_summary`: Bỏ vết cắt ngang còn lộ trong about us bằng cách làm mềm shell overlay và tắt lớp chân trời cứng phía sau section.
- `commit_message`: `fix(home-about): soften shell overlay to remove horizontal seam`
- `main_files`:
  - `app/globals.css`

### Entry 042
- `time`: 2026-04-14T11:32:06+07:00
- `prompt_summary`: Bỏ toàn bộ nền riêng của about us để section dùng nền page mặc định, tránh mọi vết cắt ngang còn lộ phía sau stats/collage.
- `commit_message`: `fix(home-about): remove custom about background layers`
- `main_files`:
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 043
- `time`: 2026-04-14T11:52:00+07:00
- `prompt_summary`: Sửa responsive mobile/iPad cho menu drawer và about us: submenu chỉ mở một mục, about section chuyển sang layout gọn hơn ở tablet/mobile, bỏ chồng overlay gây lỗi giao diện.
- `commit_message`: `fix(responsive-header-about): stabilize mobile menu and about layout`
- `main_files`:
  - `components/site-header.tsx`
  - `app/globals.css`

### Entry 044
- `time`: 2026-04-14T12:03:00+07:00
- `prompt_summary`: Rút about visual về một ảnh duy nhất thay vì hai ảnh chồng nhau, đồng thời giảm chiều cao responsive để không tạo khoảng trống vô ích trên tablet/mobile.
- `commit_message`: `fix(home-about): reduce visual stack to a single image`
- `main_files`:
  - `components/public-cms.tsx`
  - `app/globals.css`

### Entry 045
- `time`: 2026-04-14T12:24:00+07:00
- `prompt_summary`: Chuyển Selected rooms thành slider carousel responsive theo layout minh hoạ, với card overlay dạng premium, arrows/dots, và hiển thị 1 ảnh mỗi card trên mobile.
- `commit_message`: `feat(home-selected-rooms): add responsive room carousel`
- `main_files`:
  - `components/selected-rooms-carousel.tsx`
  - `components/public-cms.tsx`
  - `app/globals.css`
  - `lib/mock/public-cms.ts`
  - `supabase/seed-content-pages.sql`
  - `supabase/seed.sql`

### Entry 047
- `time`: 2026-04-14T12:48:00+07:00
- `prompt_summary`: Đồng bộ seed hạng phòng theo nội dung mới nhất: Family Room, Superior Room, Quadruple Room, cùng số khách, diện tích, giường và mô tả mới.
- `commit_message`: `fix(room-types): sync latest room type seed data`
- `main_files`:
  - `supabase/seed.sql`
  - `lib/mock/public-cms.ts`
  - `supabase/seed-content-pages.sql`

### Entry 049
- `time`: 2026-04-15T00:10:00+07:00
- `prompt_summary`: Bổ sung images.qualities cho Next/Image để dập warning quality 85 và chuẩn bị tương thích Next.js 16.
- `commit_message`: `fix(next-image): configure allowed image qualities`
- `main_files`:
  - `next.config.ts`

### Entry 050
- `time`: 2026-04-15T00:35:00+07:00
- `prompt_summary`: Redesign footer content theo boutique luxury style với brand intro, navigation nhóm, và contact info trên nền tối sang, responsive 3 cột sang 1 cột mobile.
- `commit_message`: `feat(footer): redesign boutique luxury footer`
- `main_files`:
  - `components/site-footer.tsx`
  - `app/globals.css`

### Entry 051
- `time`: 2026-04-15T01:20:00+07:00
- `prompt_summary`: Thêm section tiện nghi sau mục hạng phòng trên trang chủ với 2 panel boutique, nội dung song ngữ, và responsive mượt trên desktop/tablet/mobile.
- `commit_message`: `feat(home-amenities): add responsive room amenities section`
- `main_files`:
  - `components/room-amenities-section.tsx`
  - `components/public-cms.tsx`
  - `lib/mock/public-cms.ts`
  - `app/globals.css`
  - `supabase/seed-content-pages.sql`

### Entry 052
- `time`: 2026-04-15T01:45:00+07:00
- `prompt_summary`: Thu gọn typography và width của section tiện nghi, đồng thời đổi các trạng thái yes/no sang dấu check và câu chữ tích cực hơn cho các chính sách không phụ thu.
- `commit_message`: `fix(home-amenities): tighten copy and checkmark states`
- `main_files`:
  - `components/room-amenities-section.tsx`
  - `lib/mock/public-cms.ts`
  - `app/globals.css`
  - `supabase/seed-content-pages.sql`

### Entry 053
- `time`: 2026-04-15T02:05:00+07:00
- `prompt_summary`: Thêm hồ bơi ngoài trời vào amenities với icon nước, tạm ẩn các mục Ưu đãi/Dịch vụ/Khám phá khỏi menu, và đồng bộ seed/config lẫn ghi chú nơi thay ảnh.
- `commit_message`: `fix(home-nav-amenities): hide menu items and add pool amenity`
- `main_files`:
  - `components/room-amenities-section.tsx`
  - `components/site-footer.tsx`
  - `lib/site-content.ts`
  - `lib/mock/public-cms.ts`
  - `app/globals.css`
  - `supabase/seed-content-pages.sql`
  - `supabase/seed.sql`

### Entry 054
- `time`: 2026-04-15T02:25:00+07:00
- `prompt_summary`: Cập nhật thông tin liên hệ SK Boutique Hotel, đưa Facebook/Zalo vào footer, và chỉnh dòng hồ bơi ngoài trời để có icon nước bên trái nhưng vẫn giữ dấu check bên phải.
- `commit_message`: `fix(contact-amenities): refresh contact details and pool icon`
- `main_files`:
  - `components/site-footer.tsx`
  - `components/room-amenities-section.tsx`
  - `lib/site-content.ts`
  - `app/globals.css`
  - `supabase/seed-content-pages.sql`
  - `supabase/seed.sql`

### Entry 055
- `time`: 2026-04-15T14:42:07+07:00
- `prompt_summary`: Chuyển mục mạng xã hội ở footer sang icon button clickable theo mẫu, gọn hơn và có hover/focus rõ ràng.
- `commit_message`: `feat(footer): add clickable social icon links`
- `main_files`:
  - `components/site-footer.tsx`
  - `app/globals.css`

### Entry 056
- `time`: 2026-04-15T14:42:07+07:00
- `prompt_summary`: Đồng bộ thẻ room carousel theo số dòng cố định, và đẩy nút hero carousel ra mép để không che chữ tiêu đề trên desktop/mobile.
- `commit_message`: `fix(home-carousels): align room cards and move hero arrows out`
- `main_files`:
  - `app/globals.css`

### Entry 057
- `time`: 2026-04-15T15:24:20+07:00
- `prompt_summary`: Giữ hero carousel arrows ở vị trí tự nhiên hơn với nền trong suốt, đồng thời thu hẹp title room card để Family Room cũng có thể wrap thành 2 dòng như các card còn lại.
- `commit_message`: `fix(home-carousels): soften hero arrows and tighten room titles`
- `main_files`:
  - `app/globals.css`

### Entry 058
- `time`: 2026-04-15T16:27:04+07:00
- `prompt_summary`: Thay icon social footer bằng file SVG brand thật từ public/logos cho Facebook và Zalo, giữ click behavior nhưng làm icon nhìn đẹp hơn.
- `commit_message`: `feat(footer): use branded svg social icons`
- `main_files`:
  - `components/site-footer.tsx`
  - `app/globals.css`

### Entry 048
- `time`: 2026-04-14T13:05:00+07:00
- `prompt_summary`: Sửa Selected rooms carousel vẫn bị lệch trái bằng cách căn track của carousel ra giữa trong chính viewport flex track.
- `commit_message`: `fix(home-selected-rooms): center carousel track content`
- `main_files`:
  - `app/globals.css`

### Entry 046
- `time`: 2026-04-14T12:31:00+07:00
- `prompt_summary`: Căn lại carousel Selected rooms vào giữa khung section để không bị bám mép trái trên desktop, đồng thời giữ scroll-snap responsive cho tablet/mobile.
- `commit_message`: `fix(home-selected-rooms): center carousel track`
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

### Entry 059
- `time`: 2026-04-17T13:01:25+07:00
- `prompt_summary`: Thêm khối kiểm tra phòng dưới hero trang chủ, đổi route phòng sang `/rooms`, refactor trang chọn phòng theo mockup, và mở chi tiết hạng phòng bằng modal canvas ngay trong trang.
- `commit_message`: `feat(rooms): add availability search, rooms listing, and room canvas modal`
- `main_files`:
  - `app/(marketing)/rooms/page.tsx`
  - `app/(marketing)/rooms/[slug]/page.tsx`
  - `app/(marketing)/phong/page.tsx`
  - `app/(marketing)/phong/[slug]/page.tsx`
  - `components/availability-check-bar.tsx`
  - `components/room-canvas-modal.tsx`
  - `components/rooms-catalog-page.tsx`
  - `components/public-cms.tsx`
  - `components/analytics-link.tsx`
  - `components/site-footer.tsx`
  - `lib/room-routes.ts`
  - `lib/rooms/catalog.ts`
  - `lib/site-content.ts`
  - `lib/supabase/queries/room-types.ts`
  - `app/globals.css`

### Entry 060
- `time`: 2026-04-17T13:33:16+07:00
- `prompt_summary`: Sửa lỗi calendar không đổi được ngày bắt đầu, tăng độ ưu tiên popup ngày, bỏ thanh topbar phụ ở trang phòng, và thêm mục Vị trí dùng chung để scroll tới section map ở mọi trang public.
- `commit_message`: `fix(public-site): restore date selection and shared location anchor`
- `main_files`:
  - `components/availability-check-bar.tsx`
  - `components/location-section.tsx`
  - `components/public-cms.tsx`
  - `components/rooms-catalog-page.tsx`
  - `components/site-header.tsx`
  - `lib/site-content.ts`
  - `app/globals.css`

### Entry 061
- `time`: 2026-04-17T14:08:12+07:00
- `prompt_summary`: Ẩn menu Chi nhánh và route /chi-nhanh, bỏ block kiểm tra phòng ở homepage, đưa Vị trí và Tiện ích xuống mọi trang public trước footer, tạm ẩn Liên hệ/Tuyển dụng/Hỗ trợ trong menu Về SK, bỏ nút chuyển ảnh trực tiếp trên card phòng, và chỉnh canvas chi tiết phòng để cuộn cả khối với width gọn hơn.
- `commit_message`: `fix(public-site): centralize shared sections and refine room canvas`
- `main_files`:
  - `app/(marketing)/layout.tsx`
  - `components/marketing-bottom-sections.tsx`
  - `components/public-cms.tsx`
  - `components/page-template.tsx`
  - `components/rooms-catalog-page.tsx`
  - `components/location-section.tsx`
  - `components/facilities-section.tsx`
  - `app/(marketing)/chi-nhanh/page.tsx`
  - `app/(marketing)/chi-nhanh/[slug]/page.tsx`
  - `app/globals.css`
  - `lib/site-content.ts`

### Entry 062
- `time`: 2026-04-17T14:28:29+07:00
- `prompt_summary`: Sửa lỗi cuộn canvas phòng để overlay đứng yên và chính khung chi tiết phòng tự cuộn bên trong, tránh tình trạng nội dung bị lệch như ảnh chụp.
- `commit_message`: `fix(room-canvas): keep modal scroll within dialog`
- `main_files`:
  - `app/globals.css`

### Entry 063
- `time`: 2026-04-17T14:40:23+07:00
- `prompt_summary`: Thêm section payment dùng chung nằm trên footer mọi trang public, tạm ẩn ba section editorial trên trang phòng, và bổ sung carousel ảnh tự chạy 3s bên dưới danh sách phòng với responsive desktop/tablet/mobile.
- `commit_message`: `feat(public-site): add shared payment band and room image carousel`
- `main_files`:
  - `components/payment-section.tsx`
  - `components/marketing-bottom-sections.tsx`
  - `components/rooms-image-carousel.tsx`
  - `components/rooms-catalog-page.tsx`
  - `app/globals.css`

### Entry 064
- `time`: 2026-04-17T14:54:45+07:00
- `prompt_summary`: Mở rộng carousel ảnh phòng thành full-width tràn ngang viewport và chỉnh lại tỉ lệ khung để khớp mockup slider panorama trên desktop, tablet, và mobile.
- `commit_message`: `fix(room-gallery): expand room carousel to full width`
- `main_files`:
  - `components/rooms-image-carousel.tsx`
  - `app/globals.css`

### Entry 065
- `time`: 2026-04-17T14:57:50+07:00
- `prompt_summary`: Rút payment band còn 3 phương thức chính Mastercard, Visa, và tiền mặt, dùng đúng các logo SVG trong public/logos cho section thanh toán dùng chung.
- `commit_message`: `fix(payment-band): simplify payment methods to three logos`
- `main_files`:
  - `components/payment-section.tsx`
  - `app/globals.css`

### Entry 066
- `time`: 2026-04-17T15:07:22+07:00
- `prompt_summary`: Đổi slug trang Về chúng tôi sang chuẩn tiếng Anh `/about-us`, giữ redirect legacy từ `/ve-chung-toi`, và đồng bộ lại menu/footer cùng các CTA nội bộ.
- `commit_message`: `fix(slugs): migrate about us route to english slug`
- `main_files`:
  - `lib/site-content.ts`
  - `components/site-footer.tsx`
  - `app/(marketing)/about-us/page.tsx`
  - `app/(marketing)/ve-chung-toi/page.tsx`

### Entry 067
- `time`: 2026-04-17T15:18:40+07:00
- `prompt_summary`: Chuyển CTA đặt phòng trên topbar từ điều hướng sang popup chọn ngày và khách dùng lại flow availability, rồi dẫn tiếp sang trang chọn phòng.
- `commit_message`: `feat(header-booking): open room search modal from topbar cta`
- `main_files`:
  - `components/site-header.tsx`
  - `components/booking-search-modal.tsx`
  - `components/availability-check-bar.tsx`
  - `app/globals.css`

### Entry 068
- `time`: 2026-04-17T15:31:12+07:00
- `prompt_summary`: Sửa popup đặt phòng topbar bị lệch lên đầu bằng portal/body mount và khôi phục lại khối kiểm tra phòng ngay dưới hero carousel trên homepage.
- `commit_message`: `fix(header-booking): center booking modal and restore home availability`
- `main_files`:
  - `components/booking-search-modal.tsx`
  - `components/public-cms.tsx`
  - `components/marketing-home.tsx`
  - `components/home-availability-section.tsx`
  - `app/globals.css`

### Entry 069
- `time`: 2026-04-17T15:44:20+07:00
- `prompt_summary`: Sửa menu responsive mobile/tablet để drawer không bị page lấn lên bằng cách mount qua portal và cho drawer phủ full viewport trên breakpoint nhỏ.
- `commit_message`: `fix(header-menu): make responsive drawer overlay full viewport`
- `main_files`:
  - `components/site-header.tsx`
  - `app/globals.css`

### Entry 070
- `time`: 2026-04-17T15:59:40+07:00
- `prompt_summary`: Làm nhỏ chữ phần tiện nghi khách sạn trên tablet/iphone để label và check icon giữ cùng một dòng, đồng thời sửa popup chọn phòng cho dropdown hiển thị gọn trong modal như mockup.
- `commit_message`: `fix(booking-ui): tighten facilities rows and room popup dropdowns`
- `main_files`:
  - `app/globals.css`

### Entry 071
- `time`: 2026-04-17T16:18:43+07:00
- `prompt_summary`: Chốt CTA đặt phòng trên topbar về thẳng `/rooms`, làm gọn lại trang about-us theo hướng ảnh-led với slider khách hàng từ `/public/customers`, ẩn các nút tuyển dụng/contact dư thừa, và thêm cờ vào nút đổi ngôn ngữ.
- `commit_message`: `feat(public-site): simplify about-us and restore rooms booking cta`
- `main_files`:
  - `components/site-header.tsx`
  - `components/site-footer.tsx`
  - `components/about-us-page.tsx`
  - `components/about-us-customer-carousel.tsx`
  - `app/(marketing)/about-us/page.tsx`
  - `app/globals.css`
  - `lib/site-content.ts`
