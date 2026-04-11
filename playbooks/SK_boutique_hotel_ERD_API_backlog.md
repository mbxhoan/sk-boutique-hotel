# SK boutique hotel – ERD Diagram, API List Draft, and Backlog Task Breakdown

Version: Draft v1  
Status: Working document  
Scope baseline: Phase 1 manual operations, future-ready for OTA and payment integration  
Language scope: Vietnamese / English

---

# 1. Document Purpose

This document extends the previously approved solution blueprint and BRD set for **SK boutique hotel**.

It provides three practical implementation artifacts:

1. **ERD diagrams** in Mermaid format for architecture and database discussion
2. **API list draft** for backend and frontend integration planning
3. **Backlog task breakdown** by phase and suggested development sprints

This document is intended for BA, PM, UI/UX, Backend, Frontend, QA, and DevOps alignment.

---

# 2. ERD – Diagram Overview

To keep the model readable, the ERD is split into 3 diagrams:

- **Diagram A:** Hotel structure, room inventory, availability, hold, reservation
- **Diagram B:** Customer, account, payment, notification, audit
- **Diagram C:** CMS, multilingual content, blog/news workflow

> Note: The diagrams below are implementation-oriented drafts, not final DDL.

---

# 3. ERD Diagram A – Hotel Structure, Inventory, Availability, Booking Core

```mermaid
erDiagram
    HOTELS ||--o{ BRANCHES : has
    BRANCHES ||--o{ FLOORS : has
    BRANCHES ||--o{ BRANCH_ROOM_TYPES : offers
    ROOM_TYPES ||--o{ BRANCH_ROOM_TYPES : available_in
    ROOM_TYPES ||--o{ ROOM_TYPE_TRANSLATIONS : translated_as
    ROOM_TYPES ||--o{ ROOM_TYPE_IMAGES : has
    ROOM_TYPES ||--o{ ROOM_TYPE_AMENITIES : mapped_to
    AMENITIES ||--o{ ROOM_TYPE_AMENITIES : used_by

    FLOORS ||--o{ ROOMS : contains
    ROOM_TYPES ||--o{ ROOMS : classifies
    ROOMS ||--o{ ROOM_BLOCKS : blocked_by
    ROOMS ||--o{ ROOM_MAINTENANCE_RECORDS : maintained_by
    ROOMS ||--o{ ROOM_OPERATIONAL_STATUS_LOGS : status_changes

    BRANCHES ||--o{ ROOM_AVAILABILITY_DAILY : summarized_as
    ROOM_TYPES ||--o{ ROOM_AVAILABILITY_DAILY : summarized_as

    BRANCHES ||--o{ AVAILABILITY_REQUESTS : receives
    CUSTOMERS ||--o{ AVAILABILITY_REQUESTS : submits
    AVAILABILITY_REQUESTS ||--o{ AVAILABILITY_REQUEST_ITEMS : includes
    ROOM_TYPES ||--o{ AVAILABILITY_REQUEST_ITEMS : requested_as

    CUSTOMERS ||--o{ RESERVATION_HOLDS : owns
    BRANCHES ||--o{ RESERVATION_HOLDS : created_for
    ROOM_TYPES ||--o{ RESERVATION_HOLDS : held_as
    ROOMS ||--o{ RESERVATION_HOLDS : held_room

    CUSTOMERS ||--o{ RESERVATIONS : places
    BRANCHES ||--o{ RESERVATIONS : belongs_to
    RESERVATIONS ||--o{ RESERVATION_ROOM_ITEMS : contains
    ROOM_TYPES ||--o{ RESERVATION_ROOM_ITEMS : sold_as
    ROOMS ||--o{ RESERVATION_ROOM_ITEMS : assigned_room

    HOTELS {
      uuid id PK
      string code
      string name
      string status
    }

    BRANCHES {
      uuid id PK
      uuid hotel_id FK
      string code
      string name
      string timezone
      string status
      time default_check_in_time
      time default_check_out_time
    }

    FLOORS {
      uuid id PK
      uuid branch_id FK
      string floor_code
      string floor_name
      int sort_order
      string status
    }

    ROOM_TYPES {
      uuid id PK
      string code
      string slug
      int max_occupancy
      int max_adult
      int max_child
      decimal room_area_sqm
      boolean show_from_price
      string status
    }

    ROOM_TYPE_TRANSLATIONS {
      uuid id PK
      uuid room_type_id FK
      string language_code
      string title
      text short_description
      text full_description
      text seo_title
      text seo_meta_description
    }

    ROOM_TYPE_IMAGES {
      uuid id PK
      uuid room_type_id FK
      string image_url
      boolean is_featured
      int sort_order
      string alt_text
    }

    AMENITIES {
      uuid id PK
      string code
      string icon_key
      string status
    }

    ROOM_TYPE_AMENITIES {
      uuid id PK
      uuid room_type_id FK
      uuid amenity_id FK
      boolean is_highlighted
      int sort_order
    }

    BRANCH_ROOM_TYPES {
      uuid id PK
      uuid branch_id FK
      uuid room_type_id FK
      decimal base_price
      decimal weekend_surcharge
      boolean public_price_visible
      boolean active
    }

    ROOMS {
      uuid id PK
      uuid floor_id FK
      uuid room_type_id FK
      string room_number
      string room_code
      string operational_status
      boolean sellable
      string notes
    }

    ROOM_BLOCKS {
      uuid id PK
      uuid room_id FK
      timestamp starts_at
      timestamp ends_at
      string block_reason
      string status
    }

    ROOM_MAINTENANCE_RECORDS {
      uuid id PK
      uuid room_id FK
      timestamp starts_at
      timestamp ends_at
      string maintenance_type
      string status
      text notes
    }

    ROOM_OPERATIONAL_STATUS_LOGS {
      uuid id PK
      uuid room_id FK
      string from_status
      string to_status
      uuid changed_by FK
      timestamp changed_at
      text notes
    }

    ROOM_AVAILABILITY_DAILY {
      uuid id PK
      uuid branch_id FK
      uuid room_type_id FK
      date stay_date
      int total_rooms
      int held_rooms
      int booked_rooms
      int blocked_rooms
      int maintenance_rooms
      int available_rooms
    }

    AVAILABILITY_REQUESTS {
      uuid id PK
      uuid customer_id FK
      uuid branch_id FK
      string request_code
      timestamp planned_check_in_at
      timestamp planned_check_out_at
      string request_type
      string status
      uuid assigned_to FK
      timestamp first_response_due_at
    }

    AVAILABILITY_REQUEST_ITEMS {
      uuid id PK
      uuid availability_request_id FK
      uuid room_type_id FK
      int quantity_requested
      text notes
    }

    RESERVATION_HOLDS {
      uuid id PK
      string hold_code
      uuid customer_id FK
      uuid branch_id FK
      uuid room_type_id FK
      uuid room_id FK
      timestamp hold_starts_at
      timestamp hold_expires_at
      string status
      uuid created_by FK
    }

    RESERVATIONS {
      uuid id PK
      string reservation_code
      uuid customer_id FK
      uuid branch_id FK
      string status
      string source
      decimal total_amount
      decimal deposit_amount
      timestamp planned_check_in_at
      timestamp planned_check_out_at
      uuid created_by FK
    }

    RESERVATION_ROOM_ITEMS {
      uuid id PK
      uuid reservation_id FK
      uuid room_type_id FK
      uuid room_id FK
      decimal base_price
      decimal weekend_surcharge
      decimal manual_override_price
      decimal final_price
      string pricing_note
    }

    CUSTOMERS {
      uuid id PK
      string customer_code
      string full_name
      string email
      string phone
      string status
      string preferred_language
    }
```

---

# 4. ERD Diagram B – Customer Account, Marketing, Payment, Notification, Audit

```mermaid
erDiagram
    CUSTOMERS ||--|| CUSTOMER_ACCOUNTS : owns
    CUSTOMERS ||--o{ CUSTOMER_NOTES : has
    CUSTOMERS ||--o{ CUSTOMER_MARKETING_CONSENTS : records
    CUSTOMERS ||--o{ CUSTOMER_ACTIVITY_LOGS : generates
    CUSTOMERS ||--o{ PAYMENT_REQUESTS : billed_for
    RESERVATIONS ||--o{ PAYMENT_REQUESTS : requires
    BRANCH_BANK_ACCOUNTS ||--o{ PAYMENT_REQUESTS : receives_to
    PAYMENT_REQUESTS ||--o{ PAYMENT_QR_PAYLOADS : generates
    PAYMENT_REQUESTS ||--o{ PAYMENT_PROOFS : receives
    PAYMENT_REQUESTS ||--o{ PAYMENT_STATUS_LOGS : changes

    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ CUSTOMER_NOTES : writes
    USERS ||--o{ PAYMENT_STATUS_LOGS : verifies

    CUSTOMERS {
      uuid id PK
      string customer_code
      string full_name
      string email
      string phone
      string status
      string preferred_language
    }

    CUSTOMER_ACCOUNTS {
      uuid id PK
      uuid customer_id FK
      string auth_provider
      boolean email_verified
      boolean password_set
      boolean first_login_activation_required
      string account_status
      timestamp last_login_at
    }

    CUSTOMER_NOTES {
      uuid id PK
      uuid customer_id FK
      uuid created_by FK
      string note_type
      text content
      timestamp created_at
    }

    CUSTOMER_MARKETING_CONSENTS {
      uuid id PK
      uuid customer_id FK
      boolean consent_value
      string consent_source
      string consent_text_version
      timestamp consent_at
      string ip_address
      string user_agent
    }

    CUSTOMER_ACTIVITY_LOGS {
      uuid id PK
      uuid customer_id FK
      string activity_type
      string entity_type
      uuid entity_id
      json metadata
      timestamp created_at
    }

    BRANCH_BANK_ACCOUNTS {
      uuid id PK
      uuid branch_id FK
      string bank_name
      string account_number
      string account_name
      string qr_template
      boolean active
    }

    PAYMENT_REQUESTS {
      uuid id PK
      uuid reservation_id FK
      uuid customer_id FK
      uuid branch_bank_account_id FK
      string payment_request_code
      decimal amount
      string currency
      string transfer_content
      timestamp expires_at
      string status
      uuid created_by FK
    }

    PAYMENT_QR_PAYLOADS {
      uuid id PK
      uuid payment_request_id FK
      string qr_provider
      json qr_payload
      string qr_image_url
      timestamp created_at
    }

    PAYMENT_PROOFS {
      uuid id PK
      uuid payment_request_id FK
      string file_url
      string upload_source
      uuid uploaded_by_customer_id FK
      timestamp uploaded_at
      text notes
    }

    PAYMENT_STATUS_LOGS {
      uuid id PK
      uuid payment_request_id FK
      string from_status
      string to_status
      uuid changed_by FK
      timestamp changed_at
      text notes
    }

    USERS {
      uuid id PK
      string email
      string full_name
      string status
    }

    NOTIFICATIONS {
      uuid id PK
      uuid user_id FK
      string channel
      string title
      string message
      string entity_type
      uuid entity_id
      boolean is_read
      timestamp created_at
    }

    AUDIT_LOGS {
      uuid id PK
      uuid actor_user_id FK
      string module_key
      string action_key
      string entity_type
      uuid entity_id
      json payload_before
      json payload_after
      timestamp created_at
    }
```

---

# 5. ERD Diagram C – CMS, Multilingual Content, Offers, Blog/News Workflow

```mermaid
erDiagram
    PAGES ||--o{ PAGE_TRANSLATIONS : translated_as
    PAGES ||--o{ PAGE_SECTIONS : contains
    PAGE_SECTIONS ||--o{ PAGE_SECTION_TRANSLATIONS : translated_as
    POSTS ||--o{ POST_TRANSLATIONS : translated_as
    POSTS ||--o{ POST_REVIEW_WORKFLOWS : reviewed_by
    BANNERS ||--o{ BANNER_TRANSLATIONS : translated_as
    MEDIA_ASSETS ||--o{ PAGE_SECTIONS : used_by
    MEDIA_ASSETS ||--o{ POSTS : used_by
    MEDIA_ASSETS ||--o{ BANNERS : used_by

    PAGES {
      uuid id PK
      string page_key
      string page_type
      string status
      boolean is_homepage
      timestamp published_at
    }

    PAGE_TRANSLATIONS {
      uuid id PK
      uuid page_id FK
      string language_code
      string title
      string slug
      text seo_title
      text seo_meta_description
    }

    PAGE_SECTIONS {
      uuid id PK
      uuid page_id FK
      string section_key
      string section_type
      int sort_order
      string status
      json settings
    }

    PAGE_SECTION_TRANSLATIONS {
      uuid id PK
      uuid page_section_id FK
      string language_code
      string heading
      string subheading
      text body_content
      json cta_config
    }

    POSTS {
      uuid id PK
      string post_type
      string status
      uuid featured_media_id FK
      uuid created_by FK
      timestamp published_at
    }

    POST_TRANSLATIONS {
      uuid id PK
      uuid post_id FK
      string language_code
      string title
      string slug
      text excerpt
      text content
      text seo_title
      text seo_meta_description
    }

    POST_REVIEW_WORKFLOWS {
      uuid id PK
      uuid post_id FK
      string status
      uuid submitted_by FK
      uuid reviewed_by FK
      timestamp submitted_at
      timestamp reviewed_at
      text review_notes
    }

    BANNERS {
      uuid id PK
      string banner_key
      string campaign_type
      string status
      timestamp starts_at
      timestamp ends_at
      uuid media_asset_id FK
    }

    BANNER_TRANSLATIONS {
      uuid id PK
      uuid banner_id FK
      string language_code
      string title
      string subtitle
      string cta_label
      string cta_url
    }

    MEDIA_ASSETS {
      uuid id PK
      string file_type
      string file_url
      string alt_text
      string storage_provider
      uuid uploaded_by FK
      timestamp created_at
    }
```

---

# 6. API Design Principles

## 6.1 General principles
- REST-first for phase 1
- JSON request/response format
- Authentication via secure session/JWT
- Public APIs separated from admin APIs
- Branch scoping enforced in admin APIs where applicable
- Audit logging on all important mutating admin endpoints
- Idempotent design for critical actions where possible
- Pagination, filtering, sorting supported on list endpoints

## 6.2 Base route proposal
- Public API: `/api/public/...`
- Customer/member API: `/api/member/...`
- Admin API: `/api/admin/...`
- System API/internal jobs: `/api/internal/...`

---

# 7. API List Draft – Public Website APIs

## 7.1 Site and content
- `GET /api/public/site-config`
- `GET /api/public/pages/:slug`
- `GET /api/public/homepage`
- `GET /api/public/branches`
- `GET /api/public/branches/:slug`
- `GET /api/public/room-types`
- `GET /api/public/room-types/:slug`
- `GET /api/public/offers`
- `GET /api/public/services`
- `GET /api/public/blog`
- `GET /api/public/blog/:slug`
- `GET /api/public/faqs`
- `GET /api/public/contact-settings`

## 7.2 Search and availability inquiry
- `POST /api/public/availability-requests`
- `POST /api/public/availability-requests/:requestCode/confirm-email-sent`
- `GET /api/public/room-types/:slug/availability-preview`
- `POST /api/public/hold-requests`

## 7.3 Marketing and member capture
- `POST /api/public/member-capture`
- `POST /api/public/newsletter-subscriptions`
- `POST /api/public/contact-requests`

## 7.4 Visitor analytics tracking
- `POST /api/public/track/page-view`
- `POST /api/public/track/room-view`
- `POST /api/public/track/gallery-click`
- `POST /api/public/track/check-availability-click`
- `POST /api/public/track/hold-room-click`
- `POST /api/public/track/map-click`

---

# 8. API List Draft – Member / Customer APIs

## 8.1 Authentication and account activation
- `POST /api/member/auth/login`
- `POST /api/member/auth/logout`
- `POST /api/member/auth/request-first-password-setup`
- `POST /api/member/auth/set-first-password`
- `POST /api/member/auth/request-password-reset`
- `POST /api/member/auth/reset-password`
- `GET /api/member/auth/me`

## 8.2 Profile and preferences
- `GET /api/member/profile`
- `PATCH /api/member/profile`
- `PATCH /api/member/preferences`
- `PATCH /api/member/marketing-consent`

## 8.3 History and bookings
- `GET /api/member/availability-requests`
- `GET /api/member/availability-requests/:requestCode`
- `GET /api/member/reservations`
- `GET /api/member/reservations/:reservationCode`
- `GET /api/member/payment-requests`
- `GET /api/member/payment-requests/:paymentRequestCode`
- `POST /api/member/payment-requests/:paymentRequestCode/proofs`

## 8.4 Notifications
- `GET /api/member/notifications`
- `PATCH /api/member/notifications/:id/read`

---

# 9. API List Draft – Admin APIs

## 9.1 Authentication and current user
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`
- `GET /api/admin/auth/permissions`

## 9.2 Dashboard and analytics
- `GET /api/admin/dashboard/overview`
- `GET /api/admin/dashboard/conversion`
- `GET /api/admin/dashboard/traffic-sources`
- `GET /api/admin/dashboard/branch-performance`
- `GET /api/admin/dashboard/room-performance`
- `GET /api/admin/dashboard/sla-status`

## 9.3 Branches, floors, rooms
- `GET /api/admin/branches`
- `POST /api/admin/branches`
- `GET /api/admin/branches/:id`
- `PATCH /api/admin/branches/:id`
- `GET /api/admin/branches/:id/floors`
- `POST /api/admin/branches/:id/floors`
- `GET /api/admin/floors/:id/rooms`
- `POST /api/admin/floors/:id/rooms`
- `PATCH /api/admin/rooms/:id`
- `PATCH /api/admin/rooms/:id/status`
- `POST /api/admin/rooms/:id/block`
- `POST /api/admin/rooms/:id/unblock`
- `POST /api/admin/rooms/:id/maintenance`

## 9.4 Room types and amenities
- `GET /api/admin/room-types`
- `POST /api/admin/room-types`
- `GET /api/admin/room-types/:id`
- `PATCH /api/admin/room-types/:id`
- `POST /api/admin/room-types/:id/translations`
- `POST /api/admin/room-types/:id/images`
- `DELETE /api/admin/room-type-images/:id`
- `POST /api/admin/room-types/:id/amenities`
- `POST /api/admin/room-types/:id/tags`
- `PATCH /api/admin/branch-room-types/:id/pricing`
- `PATCH /api/admin/branch-room-types/:id/public-visibility`

## 9.5 Availability requests
- `GET /api/admin/availability-requests`
- `GET /api/admin/availability-requests/:id`
- `PATCH /api/admin/availability-requests/:id/assign`
- `PATCH /api/admin/availability-requests/:id/status`
- `POST /api/admin/availability-requests/:id/notes`
- `POST /api/admin/availability-requests/:id/convert-to-hold`
- `POST /api/admin/availability-requests/:id/convert-to-reservation`

## 9.6 Holds and reservation workflow
- `GET /api/admin/holds`
- `GET /api/admin/holds/:id`
- `POST /api/admin/holds`
- `PATCH /api/admin/holds/:id/extend`
- `PATCH /api/admin/holds/:id/cancel`
- `GET /api/admin/reservations`
- `POST /api/admin/reservations`
- `GET /api/admin/reservations/:id`
- `PATCH /api/admin/reservations/:id`
- `PATCH /api/admin/reservations/:id/status`
- `POST /api/admin/reservations/:id/reassign-room`
- `POST /api/admin/reservations/:id/send-confirmation`
- `POST /api/admin/reservations/:id/generate-pdf`

## 9.7 Pricing and promotions
- `GET /api/admin/promotions`
- `POST /api/admin/promotions`
- `PATCH /api/admin/promotions/:id`
- `PATCH /api/admin/promotions/:id/status`
- `GET /api/admin/pricing-rules`
- `PATCH /api/admin/branch-room-types/:id/base-price`
- `PATCH /api/admin/branch-room-types/:id/weekend-surcharge`

## 9.8 Payment and deposit verification
- `GET /api/admin/payment-requests`
- `POST /api/admin/payment-requests`
- `GET /api/admin/payment-requests/:id`
- `POST /api/admin/payment-requests/:id/send`
- `GET /api/admin/payment-requests/:id/proofs`
- `PATCH /api/admin/payment-requests/:id/verify`
- `PATCH /api/admin/payment-requests/:id/reject`
- `PATCH /api/admin/payment-requests/:id/expire`
- `POST /api/admin/payment-requests/:id/regenerate-qr`

## 9.9 Customer/member management
- `GET /api/admin/customers`
- `GET /api/admin/customers/:id`
- `PATCH /api/admin/customers/:id`
- `POST /api/admin/customers/:id/notes`
- `GET /api/admin/customers/:id/activity`
- `GET /api/admin/customers/:id/reservations`
- `GET /api/admin/customers/:id/availability-requests`
- `PATCH /api/admin/customers/:id/marketing-consent`

## 9.10 CMS and blog workflow
- `GET /api/admin/pages`
- `POST /api/admin/pages`
- `GET /api/admin/pages/:id`
- `PATCH /api/admin/pages/:id`
- `POST /api/admin/pages/:id/sections`
- `PATCH /api/admin/page-sections/:id`
- `GET /api/admin/posts`
- `POST /api/admin/posts`
- `PATCH /api/admin/posts/:id`
- `POST /api/admin/posts/:id/submit-review`
- `PATCH /api/admin/posts/:id/approve`
- `PATCH /api/admin/posts/:id/reject`
- `GET /api/admin/banners`
- `POST /api/admin/banners`
- `PATCH /api/admin/banners/:id`

## 9.11 Users, roles, and configuration
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/roles`
- `POST /api/admin/roles`
- `PATCH /api/admin/roles/:id`
- `GET /api/admin/settings/general`
- `PATCH /api/admin/settings/general`
- `GET /api/admin/settings/booking`
- `PATCH /api/admin/settings/booking`
- `GET /api/admin/settings/payment`
- `PATCH /api/admin/settings/payment`
- `GET /api/admin/settings/notifications`
- `PATCH /api/admin/settings/notifications`

## 9.12 Audit and notifications
- `GET /api/admin/audit-logs`
- `GET /api/admin/notifications`
- `PATCH /api/admin/notifications/:id/read`

---

# 10. Internal / Job / Automation APIs

These may be implemented as queue workers, cron jobs, or internal services.

- `POST /api/internal/jobs/recompute-room-availability`
- `POST /api/internal/jobs/expire-holds`
- `POST /api/internal/jobs/expire-payment-requests`
- `POST /api/internal/jobs/escalate-sla`
- `POST /api/internal/jobs/send-booking-confirmation`
- `POST /api/internal/jobs/send-payment-reminders`
- `POST /api/internal/jobs/publish-scheduled-content`
- `POST /api/internal/jobs/build-daily-analytics-snapshot`

---

# 11. Suggested API Response Standards

## 11.1 Success response
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## 11.2 Error response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid check-in date",
    "details": {}
  }
}
```

## 11.3 Pagination response
```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

---

# 12. Backlog Planning Principles

## 12.1 Sprint assumptions
Suggested execution model:
- 2-week sprint cadence
- 1 product owner / BA
- 1 UI/UX designer
- 1 frontend engineer
- 1 backend engineer
- 1 QA shared or part-time
- DevOps support as needed

## 12.2 Delivery philosophy
- Build the **core data model and auth foundation first**
- Prioritize **public website + content + room management** next
- Then implement **lead/hold/booking/payment operations**
- Keep OTA and full payment automation out of sprint 1–4

---

# 13. Phase Breakdown

## Phase A – Foundation and Architecture
Focus:
- project scaffolding
- auth/roles baseline
- data model setup
- branch/floor/room model
- core CMS foundation

## Phase B – Public Website and CMS
Focus:
- homepage
- branch pages
- room type listing/detail
- VI/EN content management
- offers/blog/services pages

## Phase C – Booking Operations
Focus:
- availability request
- hold flow
- manual reservation
- room suggestion
- SLA workflow

## Phase D – Deposit and Member Experience
Focus:
- member login flow
- history view
- payment request + QR
- proof upload
- confirmation email + PDF

## Phase E – Analytics, Audit, Hardening
Focus:
- dashboards
- content review workflow
- audit logs
- notification rules
- QA/UAT/performance hardening

---

# 14. Suggested Sprint Plan

## Sprint 0 – Discovery and Technical Setup
### Goal
Align requirements, environments, and implementation rules.

### Key tasks
- finalize sitemap and module boundaries
- finalize naming conventions and entity glossary
- set up repositories and environments
- set up CI/CD baseline
- initialize Next.js app and design system base
- initialize Supabase project, auth, storage, migrations
- define API standards and coding conventions

### Deliverables
- approved technical setup
- baseline repository structure
- migration framework
- component system skeleton

---

## Sprint 1 – Core Master Data and Admin Foundation
### Goal
Enable admin to manage branch, floor, room, room type, and role scaffolding.

### Backend
- create tables for hotels, branches, floors, rooms, room types
- create translation tables for room types
- create amenities and mapping tables
- create users, roles, permissions, branch assignments
- seed default statuses and enums

### Frontend/Admin
- login/logout admin shell
- branch management UI
- floor list and room grid by floor
- room type CRUD UI
- amenity mapping UI
- basic role assignment UI

### QA
- CRUD validation
- branch-scope authorization tests
- migration rollback tests

### Deliverables
- usable admin foundation
- physical room management baseline

---

## Sprint 2 – CMS and Multilingual Content
### Goal
Publish structured public content with VN/EN support.

### Backend
- create pages, page translations, page sections
- create media assets storage and upload endpoints
- create posts, post translations, banner tables
- create content publish status workflow

### Frontend/Public
- homepage layout shell
- room type listing page
- room type detail page
- branch detail page
- blog/news listing and detail pages
- VI/EN language switcher

### Frontend/Admin
- page builder-lite section ordering
- post editor basic form
- banner CRUD basic form
- translation management UI

### QA
- translation fallback tests
- SEO slug uniqueness tests
- media upload tests

### Deliverables
- public website content baseline
- VN/EN content management working

---

## Sprint 3 – Availability Request and Lead Capture
### Goal
Allow visitors to check room availability and create customer records.

### Backend
- create customer, account placeholder, consent, request tables
- create availability request and request item endpoints
- implement first-response SLA timestamps
- implement email notification dispatching
- implement tracking events for room/page/check actions

### Frontend/Public
- availability check form
- lead capture form embedded in check flow
- marketing consent checkbox flow
- success state and email confirmation message

### Frontend/Admin
- availability request inbox
- request detail page
- assignment and status update flow
- request notes

### QA
- duplicate customer handling tests
- consent logging tests
- email send tests
- SLA countdown tests

### Deliverables
- end-to-end request intake workflow
- lead/member capture baseline

---

## Sprint 4 – Hold Workflow and Manual Reservation Core
### Goal
Allow staff to hold a room and convert requests into bookings.

### Backend
- create hold tables and expiration jobs
- create reservation and reservation item tables
- implement room suggestion logic
- implement conflict detection by timestamp overlap
- implement auto-release expired hold job

### Frontend/Admin
- hold creation UI
- room suggestion panel
- manual room override selection
- reservation create/edit pages
- branch/floor room selection helper

### QA
- overlap and conflict tests
- expired hold tests
- status transition tests
- permission tests for extend/cancel hold

### Deliverables
- hold-room workflow
- manual booking core

---

## Sprint 5 – Pricing, Promotion, and Public Price Display
### Goal
Introduce practical price operations without full pricing engine complexity.

### Backend
- add branch_room_type pricing fields
- add promotion tables and simple rules
- calculate public from-price
- implement manual override priority logic

### Frontend/Public
- show/hide price toggle support
- render “From xxx / night” display
- promotion ribbon/tag rendering

### Frontend/Admin
- base price management
- weekend surcharge management
- simple promotion CRUD
- public price visibility setting

### QA
- price precedence tests
- weekend pricing tests
- public visibility toggle tests

### Deliverables
- usable pricing baseline
- simplified promotional logic

---

## Sprint 6 – Deposit QR, Payment Proof, Confirmation Email + PDF
### Goal
Support manual deposit collection and booking confirmation.

### Backend
- create branch bank account tables
- create payment request, QR payload, proof, status log tables
- implement dynamic VietQR payload generation
- implement secure proof upload link flow
- implement reservation confirmation email generation
- implement confirmation PDF generation
- implement auto-cancel expired pending deposit booking job

### Frontend/Public/Member
- payment request view page
- proof upload form via secure link
- member booking/payment detail page

### Frontend/Admin
- payment request create/send UI
- proof review UI
- verify/reject actions
- send confirmation action

### QA
- proof upload tests
- secure link expiry tests
- QR payload tests
- PDF generation validation
- auto-cancel tests

### Deliverables
- deposit workflow operational
- confirmation email and PDF operational

---

## Sprint 7 – Member Portal, History, and Notifications
### Goal
Give members visibility and give internal users actionable alerts.

### Backend
- finalize customer account activation flow
- first-login password setup flow
- member notification APIs
- reservation/request history APIs

### Frontend/Member
- login page
- first password setup page
- forgot/reset password pages
- request history page
- reservation history/detail page
- notification center basic UI

### Frontend/Admin
- in-app notifications list
- quick links from notifications to request/reservation/payment

### QA
- account activation tests
- history visibility tests
- notification permission tests

### Deliverables
- member portal operational
- history visibility delivered

---

## Sprint 8 – Dashboard, Audit Log, Content Review Workflow, UAT Hardening
### Goal
Complete the product for stakeholder review and operational launch.

### Backend
- audit log middleware/hooks
- analytics aggregation queries
- dashboard APIs
- post review workflow endpoints
- SLA escalation jobs

### Frontend/Admin
- dashboard overview with filters
- content approval workflow UI
- audit log explorer
- SLA risk widgets
- top room/branch interest widgets

### QA/UAT
- regression suite
- role matrix validation
- content workflow validation
- performance and responsive checks
- final UAT support

### Deliverables
- release candidate
- stakeholder demo-ready system

---

# 15. Detailed Backlog by Module

## 15.1 Auth and RBAC
### Epic
Authentication, branch-scoped authorization, and role-driven admin UI.

### Stories
- as an internal user, I can log in to the admin portal
- as a system admin, I can manage roles and permission assignments
- as an admin, I can assign branch access to managers and staff
- as a staff user, I can only see modules and records I am permitted to access
- as a customer, I can activate my account on first login

### Tasks
- create role/permission schema
- create permission constants per module
- implement middleware/guards
- implement admin session flow
- implement member session flow

---

## 15.2 Branch/Floor/Room Operations
### Epic
Model hotel inventory as physical rooms grouped by floor and room type.

### Stories
- as an admin, I can create branches
- as a manager, I can manage floors for my branch
- as staff, I can see a grid of rooms by floor
- as staff, I can mark a room as blocked or maintenance

### Tasks
- room status enum definitions
- floor room grid UI
- room detail drawer/modal
- maintenance/block forms
- room availability recalculation trigger

---

## 15.3 Room Type Content
### Epic
Manage premium public-facing room content in VN/EN.

### Stories
- as content admin, I can create room types in VI and EN
- as content admin, I can upload room galleries and choose featured image
- as visitor, I can view room details with amenities and gallery

### Tasks
- translation forms
- gallery uploader
- amenity/tag mapping
- SEO fields
- public render templates

---

## 15.4 Availability and Hold Workflow
### Epic
Capture room-check requests and convert them into operational holds.

### Stories
- as a visitor, I can check room availability
- as staff, I can assign myself or another staff member to a request
- as staff, I can create a hold with expiry
- as manager, I can see overdue or expired holds

### Tasks
- request form API
- SLA timestamps
- hold creation service
- expiry scheduler
- conflict detection service
- request-to-hold conversion action

---

## 15.5 Reservation Workflow
### Epic
Create manual reservations based on confirmed room availability.

### Stories
- as staff, I can create a reservation for one room
- as staff, I receive suggested rooms but can override selection
- as manager, I can cancel or reassign reservation room if allowed

### Tasks
- reservation schema
- room assignment logic
- reservation status machine
- calendar/list view for reservations
- confirmation action hooks

---

## 15.6 Pricing and Promotions
### Epic
Support practical selling price control without full revenue management complexity.

### Stories
- as admin, I can set base price per branch-room type
- as admin, I can add a weekend surcharge
- as staff, I can override price manually when creating reservation
- as marketer, I can create basic promotions

### Tasks
- price precedence function
- promotion rule schema
- admin forms
- public price rendering toggle
- pricing audit logging

---

## 15.7 Payment Request and Deposit Verification
### Epic
Manage deposit collection via dynamic QR and manual payment verification.

### Stories
- as staff, I can send a payment request with QR
- as a customer, I can upload transfer proof
- as staff, I can verify or reject payment proof
- as customer, I receive booking confirmation after verification

### Tasks
- payment request lifecycle
- QR payload generator
- secure upload link flow
- payment proof storage
- email template and PDF renderer
- expire-and-cancel job

---

## 15.8 Member Portal and Customer History
### Epic
Allow customers to revisit activity and reduce friction for future bookings.

### Stories
- as a member, I can log in and view my history
- as a member, I can see old room-check requests
- as a member, I can see booking and payment request status
- as staff, I can write notes on a customer profile

### Tasks
- profile page
- history endpoints
- member notification center
- note entry UI
- activity timeline

---

## 15.9 CMS, Blog, and Review Workflow
### Epic
Publish hotel content with moderation and multilingual control.

### Stories
- as a staff author, I can create a draft blog post
- as an admin, I can review and approve content
- as a visitor, I can read blog and offer pages in VN/EN

### Tasks
- post editor
- review states
- approval notifications
- translation handling
- publish scheduling optional hook

---

## 15.10 Analytics, Audit, and Monitoring
### Epic
Give management visibility into traffic, room interest, conversions, and user actions.

### Stories
- as admin, I can see dashboard metrics by date range
- as manager, I can filter dashboard by branch
- as system admin, I can inspect audit logs for sensitive changes

### Tasks
- event ingestion
- aggregation queries/materialized view strategy
- dashboard charts
- audit middleware
- export CSV optional hook

---

# 16. Suggested Non-Functional Backlog

## Security
- role and branch scoping tests
- secure file upload validation
- signed URL expiration
- password reset rate limiting
- audit trail for sensitive actions

## Performance
- image optimization pipeline
- list endpoint pagination and indexing
- dashboard query optimization
- caching for public content pages

## Reliability
- retryable email jobs
- background job observability
- failed job dashboard/logging
- backup and restore checklist

## Quality
- fixture/seed data for UAT
- end-to-end happy path scenarios
- multilingual regression tests
- responsive test matrix

---

# 17. Key Dependencies and Risks

## Dependencies
- final UI direction for premium hotel website style
- final room list and room type content from customer
- bank account and QR format confirmation by branch
- email provider setup and domain verification
- PDF template approval
- final permission mapping sign-off

## Risks
- content entry volume in VN/EN may delay publishing
- price policy ambiguity can expand scope quickly
- manual payment verification can create operational bottlenecks
- role matrix complexity may grow if branch exceptions multiply
- analytics expectations may become BI-level if not bounded early

---

# 18. Recommended Immediate Next Deliverables

After this document, the most practical next items are:

1. **Screen list / sitemap + admin navigation map**
2. **Wireframe set for public website and admin portal**
3. **Final PostgreSQL DDL draft**
4. **OpenAPI-style endpoint specification**
5. **Dev task board import version** in CSV or spreadsheet format
6. **ERD visual export** in polished PNG/PDF if needed for client presentation

---

# 19. Conclusion

This document translates the approved concept for **SK boutique hotel** into an implementation-oriented plan.

It keeps the product aligned with the agreed direction:
- premium public website
- operationally useful admin portal
- manual phase 1 booking and deposit flow
- room management based on physical rooms
- future-ready data model for OTA and automated payment expansion

The proposed ERD, API list, and sprint backlog are intentionally practical so the project can move from planning into UI, development, and delivery without rethinking the core structure again.
