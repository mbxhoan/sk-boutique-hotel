# AGENTS.md

## Project identity
This repository is for **SK boutique hotel**.
The product is a **hotel website + content CMS + availability request + hold room + manual reservation + deposit QR + member portal + analytics** system.

Phase 1 is **not** a full online booking engine.
Phase 1 focuses on:
- premium public-facing hotel website
- bilingual content management (VI/EN)
- room availability requests
- room holds with expiry
- manual reservations by staff
- deposit QR workflow with manual payment verification
- member portal with history of requests and bookings
- admin analytics and audit logs

The architecture must remain ready for future:
- OTA integrations
- payment gateway automation
- Google login / OAuth
- OTP / stronger activation flow
- more advanced pricing and rate plans

---

## Core product rules
1. Public users can **check room availability** and **request hold**, but phase 1 does not allow fully automatic instant booking.
2. Operations are managed by **physical rooms**, while the public site presents **room types**.
3. In phase 1 UI, one reservation maps to one room, but the underlying data model should avoid permanently blocking future multi-room expansion.
4. Hold and reservation are separate concepts.
5. Holds expire automatically. Default SLA/hold expiry is 30 minutes, but it must be editable.
6. Payment is manual in phase 1:
   - branch-specific bank account
   - QR generated from amount + booking code
   - customer uploads payment proof
   - staff verifies manually
   - system sends email + PDF booking confirmation after verification
7. VI/EN bilingual support is mandatory in phase 1.
8. Public price display defaults to “From xxx / night”, but must be configurable to hide price and show CTA only.
9. Marketing consent must have a separate checkbox and be logged.
10. Audit logging is important for operationally sensitive actions.

---

## Tech expectations
- Framework: **Next.js App Router + TypeScript**
- Styling: modern, premium, clean, not flashy, not cluttered
- Database target: **Supabase PostgreSQL**
- Auth target: Supabase Auth
- Storage target: Supabase Storage or S3-compatible
- Realtime/notifications target: Supabase Realtime + email service

Prefer:
- server-first where appropriate
- typed data models
- feature-based organization
- reusable UI primitives
- clear separation between UI, business logic, and data access

Avoid:
- putting too much business logic inside page components
- tight coupling between presentation and database details
- magic strings scattered across the codebase
- unnecessary dependencies
- broad rewrites when a surgical change is enough

---

## Repository working model
Treat the repo as layered:
- `src/app` for routes/layouts
- `src/components` for reusable presentation
- `src/features` for feature-level logic
- `src/lib` for shared services/helpers/infrastructure
- `supabase` for migrations, policies, seed, functions
- `docs` for repo knowledge and operating guidance

When adding new code:
1. find the correct layer first
2. prefer extending an existing pattern over inventing a new one
3. keep modules cohesive
4. update types/validation alongside behavior changes

---

## UX/UI guidance
The visual direction is **boutique hotel premium**:
- refined typography hierarchy
- generous spacing
- calm visual rhythm
- image-led sections where appropriate
- restrained color usage
- elegant cards, badges, inputs, and CTA hierarchy
- polished loading, empty, and error states

Do not produce UI that feels:
- template-like and generic
- too crowded
- too colorful
- too “cheap SaaS dashboard” for public pages

Admin UI should still be clean and compact, but optimized for operations speed.

---

## i18n guidance
Phase 1 must support **Vietnamese and English**.
When adding content-bearing UI or CMS structures:
- design with VI/EN in mind
- avoid hard-coding strings deeply into components when a translation strategy is already present
- keep hospitality terminology natural and professional

If translation infrastructure is not fully built yet, at minimum:
- keep strings organized
- avoid creating barriers to later extraction

When rendering user-facing errors:
- always provide a bilingual VI/EN fallback
- never surface raw generic platform messages directly to the UI
- prefer short, explicit, action-oriented messages over vague failures
- if an upstream error is unknown, map it to a safe bilingual fallback before displaying it

---

## Pricing guidance
Phase 1 pricing should support:
- `base_price`
- `weekend_surcharge`
- `manual_override_price`
- basic promotions

Preferred pricing order:
1. manual override if present
2. otherwise base price
3. add weekend surcharge when applicable
4. apply basic promotion if active

Do not over-engineer a full pricing engine in early tasks unless explicitly asked.

---

## Availability / holds / reservations guidance
Availability is driven by physical rooms and operational status.
Minimum operational states in phase 1:
- `available`
- `held`
- `booked`
- `blocked`
- `maintenance`

When working on holds/reservations:
- always think about overlap rules for check-in/check-out timestamps
- avoid date-only shortcuts when the task obviously depends on time boundaries
- preserve future extensibility for more advanced rules

When building suggestion logic for staff:
- prefer available rooms
- exclude blocked/maintenance rooms
- prefer room types that match exactly
- keep the suggestion overrideable by staff

---

## Permissions guidance
Expected internal roles:
- `system_admin`
- `admin`
- `manager`
- `staff`

Do not assume all internal users can do everything.
If a task touches:
- payment verification
- content publishing
- booking cancellation
- hold extension
- sensitive settings
- audit logs

then permission implications must be considered.

---

## Content workflow guidance
The system includes:
- public pages
- room type content
- branch content
- blog/news
- offers/promotions

Blog/news should support review workflow in phase 1:
- author creates draft
- admin reviews
- admin approves/rejects
- publish by language

When building CMS features, prefer structures that can later map cleanly to database-driven content.

---

## Payment workflow guidance
Payment in phase 1 is manual.
When implementing payment-related features:
- do not pretend payment is automatically confirmed
- always preserve a clear verification state
- support upload via secure public link and via member portal
- generate confirmation artifacts only after manual verification

Recommended payment states:
- `pending`
- `sent`
- `proof_uploaded`
- `pending_verification`
- `verified`
- `rejected`
- `expired`

---

## Analytics guidance
The product needs meaningful operational analytics, not vanity noise.
Expected event classes include:
- page visits
- room views
- image/gallery clicks
- branch interest
- availability request submits
- hold request submits
- booking conversion events
- customer activity history

Track with restraint and structure.
If implementing analytics, keep event names and payloads consistent.

---

## How to work on a task
Before editing code:
1. read this file
2. inspect the relevant feature/module files
3. identify the smallest correct implementation path
4. preserve existing patterns when reasonable
5. only then edit

When finishing a task, report briefly:
- what changed
- which files were added/updated
- any assumptions made
- follow-up work that would improve completeness

---

## Bug fixing instructions
When fixing bugs:
- identify likely root cause first
- prefer minimal but correct fixes
- avoid speculative rewrites
- add missing validation/guards if they reduce recurrence
- keep UI/business/data responsibilities separate

If the bug might be data-related, schema-related, or policy-related, say so clearly.

---

## Database / Supabase instructions
When working with Supabase or PostgreSQL:
- prefer explicit migrations for schema changes
- do not silently mutate production data assumptions
- keep foreign keys/indexes in mind
- think ahead about auditability and permissions
- keep phase 1 scope practical, but do not sabotage future OTA/payment expansion

If inspecting data through MCP or admin tools:
- default to read-only investigation unless explicitly told to modify data
- if a data fix is required, propose a safe migration/script path first

---

## What not to do
- Do not rebuild the project architecture without strong reason.
- Do not introduce heavy abstractions too early.
- Do not scatter business rules across random UI files.
- Do not ignore VI/EN requirements.
- Do not implement phase 2 complexity when phase 1 flow is incomplete.
- Do not sacrifice maintainability for short-term hacks.
- Do not repeat the issue that has already been done.

---

## Preferred output style for code tasks
For substantial tasks:
- first understand
- then implement
- then summarize clearly

For UI tasks:
- explain the visual/UX intent briefly in the summary

For schema/tasks involving operations:
- call out edge cases and operational risks

---

## Recommended companion docs
If present, also consult:
- `docs/00-product-context.md`
- `docs/01-scope.md`
- `docs/02-architecture.md`
- `docs/03-workflows.md`
- `docs/04-data-model.md`
- `docs/05-permissions.md`
- `docs/06-ui-rules.md`
- `docs/08-api-list.md`
- `docs/09-testing-checklist.md`

If a review-specific doc exists, follow it during review tasks as well.

---

### 1. README release notes chỉ cập nhật khi có thay đổi lớn
Agent **được phép** tự cập nhật `README.md` phần **What's New** nhưng chỉ khi có **major release** hoặc thay đổi đủ quan trọng. Tham khảo thêm ở `docs/RELEASE_POLICY.md`.

Được cập nhật khi có một trong các điều sau:
- thêm module lớn mới,
- thay đổi kiến trúc đáng kể,
- thay đổi workflow chính của người dùng,
- thêm capability lớn như dynamic QR, analytics, auth, billing, API,
- tối ưu hiệu năng có tác động rõ rệt đến toàn app,
- milestone phát hành mới mà team cần ghi nhận.

Không được thêm entry mới vào `README.md` nếu chỉ là:
- UI polish nhỏ,
- spacing,
- màu sắc,
- icon,
- wording/copy,
- refactor nhỏ,
- fix CSS,
- fix bug nhỏ,
- tinh chỉnh validation nhỏ,
- cập nhật docs vụn.

---

## 2. Commit Discipline (bắt buộc cho Codex)
- Khi hoàn tất mỗi task, agent phải đề xuất **đúng 1 commit message duy nhất** theo phạm vi thay đổi.
- Commit message phải theo cấu trúc:
  - `<type>(<scope>): <summary>`
  - Ví dụ: `fix(users-audit): stabilize created_by/updated_by for service-role flows`
- Đồng thời phải lưu mapping giữa prompt và commit message vào file:
  - `/docs/commit_prompt_map.md`
- Mỗi entry mapping cần có:
  - thời gian
  - tóm tắt prompt/user request
  - commit message duy nhất
  - danh sách file chính đã sửa
  - Nếu prompt/message có bắt đầu với ID của tickets/issues thì hãy ghi lại nó trong file, ví dụ như message bắt đầu như sau: `1. IT-1-20260406-000010: danh sách sản phẩm: Số lượng trang thể hiện không đúng,... 2 IT-1-20260404-000007: Đề xuất tất cả cá phiều chứng từ  đều có mã Qrcode /mã vạch.`
