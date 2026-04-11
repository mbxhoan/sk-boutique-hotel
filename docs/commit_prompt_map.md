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
