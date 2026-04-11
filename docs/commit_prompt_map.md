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
