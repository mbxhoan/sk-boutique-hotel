# Architecture

## Recommended stack
- Frontend: Next.js (App Router)
- Styling: Tailwind CSS
- Forms/validation: Zod + React Hook Form
- State: server-first, minimal client state
- Data/Auth/Storage/Realtime: Supabase
- Database: PostgreSQL
- Email: Postmark or Resend
- PDF generation: server-side route or worker
- Deployment: Vercel + Supabase
- Background jobs: cron / scheduled jobs / worker

## Architecture layers

### 1. Public web layer
Responsibilities:
- public content rendering
- SEO pages
- branch and room type pages
- availability check and hold request forms
- member login pages
- request / booking history pages

### 2. Admin portal layer
Responsibilities:
- CMS
- branch/floor/room admin
- room type admin
- request processing
- reservation management
- payment verification
- analytics dashboards
- audit log views

### 3. Application layer
Responsibilities:
- business rules
- authorization
- request to hold conversion
- reservation state transitions
- payment state transitions
- PDF/email generation
- background expiry logic

### 4. Data layer
Responsibilities:
- normalized relational data
- room type vs physical room model
- logs and analytics events
- bilingual content storage
- permissions and assignments

### 5. Integration layer
Future-ready adapters:
- OTA connectors
- payment providers
- OAuth providers
- email providers
- marketing/event sinks

## Key domain modeling decisions
1. Public availability is by **room type**
2. Operational control is by **physical room**
3. Hold and reservation are separate entities
4. Reservation data must stay extensible even if UI allows 1 room only in phase 1
5. Payment request and payment proof are distinct entities
6. Content translations should not be hard-coded into one giant blob field

## Suggested app structure
- `(public)` routes for website
- `(auth)` routes for sign-in / first password setup
- `(member)` routes for member portal
- `(admin)` routes for admin portal
- `features/*` for domain modules
- `lib/*` for shared infra and utilities
- `server/*` or `actions/*` for server-side operations

## Background jobs needed
- auto-expire holds
- auto-cancel overdue reservations awaiting deposit
- SLA escalation notifications
- reminder emails
- publish scheduler if later needed

## Security principles
- role-based access control
- branch-scoped permissions
- audit log for sensitive actions
- signed URLs or secure token access for payment proof uploads
- never trust client-side availability calculations
- server must re-check room allocation conflicts before saving reservation state

## Performance principles
- public pages statically optimized when possible
- server render dynamic room data where needed
- cache read-heavy content
- keep analytics writes lightweight and append-only where practical

## Bilingual strategy
- VI/EN only in phase 1
- translation tables or locale-aware content structures
- publish status per locale if needed
