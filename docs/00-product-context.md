# Product Context — SK boutique hotel

## Product summary
SK boutique hotel is a hotel website and internal operations system that combines:
- a premium public-facing hotel website
- content management for branches, room types, offers, services, and blog/news
- a member/light CRM layer for guests and leads
- a manual booking workflow with hold room, deposit QR, payment proof upload, and staff confirmation
- analytics, audit logs, and notification workflows
- an architecture prepared for future OTA and payment automation integration

## Phase 1 product positioning
Phase 1 is **not** a full automatic online booking engine.
Phase 1 is a:
- hotel website
- content CMS
- availability request + hold room workflow
- manual reservation operations portal
- deposit confirmation workflow
- member history portal

Guests can:
- browse content
- view branches and room types
- view “From xxx / night” price if enabled
- submit availability check requests
- submit hold-room requests
- register as members implicitly through request forms
- log in later to view history, notifications, booking status, and upload payment proof

Internal users can:
- manage content
- manage branches, floors, physical rooms, room types
- process requests within SLA
- create reservations manually
- generate deposit requests with dynamic VietQR payload
- verify payment manually
- send email + PDF confirmation
- monitor analytics and logs

## Core design principles
1. Public website displays availability by **room type**
2. Operations are managed by **physical room**
3. Phase 1 can be manual, but data model must be ready for automation later
4. UI must feel boutique, modern, refined, and not over-decorated
5. Bilingual content is mandatory in **VI/EN**

## Known scope decisions
- 2 branches initially
- floor-based room organization
- physical room tracking by branch and floor
- default check-in/out time is configurable
- hold room and booking are separate states
- booking overdue for deposit auto-cancels
- public price display can be toggled on/off
- Google login is future-ready, not enabled in initial phase
- OTA and full payment integrations are future phases

## Primary user groups
- Guest / visitor
- Member / returning customer
- Staff
- Branch manager
- Admin
- System admin

## Success outcomes for phase 1
- Premium public brand experience
- Faster response to room inquiries
- Reduced manual confusion around room availability
- Centralized room/branch/content management
- Trackable pipeline from visit → request → hold → reservation → deposit confirmation
