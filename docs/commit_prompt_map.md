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
