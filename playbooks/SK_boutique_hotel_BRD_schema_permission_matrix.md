# SK boutique hotel – Detailed BRD, Database Schema Draft, and Permission Matrix

Version: Draft v1  
Status: Working document  
Language scope: Vietnamese / English only  
Architecture target: Phase 1 manual operations, future-ready for OTA and automated payment

---

# 1. Executive Summary

This document defines the detailed business requirements, core data model draft, and role-based permissions for the **SK boutique hotel** website and booking operations platform.

The system is designed for two immediate realities:

1. **Phase 1 is manual in booking operations**  
   Visitors can check room availability and request room hold, but staff will confirm availability, contact the guest, create the booking, issue a deposit request, and verify payment manually.

2. **The architecture must be future-ready**  
   The platform must be extensible for:
   - OTA integration
   - online bank/payment gateway integration
   - Google login / OAuth
   - more advanced room pricing and automation

---

# 2. Business Objectives

## 2.1 Primary objectives
- Build a premium public website for SK boutique hotel
- Manage multilingual content for the hotel and room types
- Allow visitors to check room availability and request room hold
- Provide internal staff with an efficient manual booking workflow
- Provide deposit collection via dynamic VietQR and manual verification
- Track engagement, room interest, and branch interest
- Maintain customer history and member accounts
- Enable branch-based operational management with audit logging

## 2.2 Secondary objectives
- Prepare data structures for OTA mapping
- Prepare payment models for future automation
- Prepare login architecture for Google OAuth in later phases
- Support future pricing sophistication without redesigning the core schema

---

# 3. Scope

## 3.1 In scope for Phase 1
- Public hotel website
- Room type showcase
- Branch pages and Google Map integration
- Offers, services, about, contact, support, recruitment pages
- Blog/news with approval workflow
- Membership capture and login
- Availability request workflow
- Hold-room workflow
- Manual booking workflow
- Dynamic VietQR deposit request
- Payment proof upload
- Payment confirmation by staff
- Booking confirmation email + PDF
- Branch, floor, and physical room management
- Basic pricing model
- Simplified promotions
- Dashboard analytics
- Audit logs
- Role-based permission control

## 3.2 Out of scope for Phase 1
- Full OTA synchronization
- Real-time payment gateway/webhook verification
- Fully automated self-service booking checkout
- Housekeeping management module
- Staff payroll / HR
- Full loyalty engine
- Advanced revenue management pricing engine

---

# 4. Core Product Model

## 4.1 Product domains
The system consists of six core product domains:

1. **Public Website**
2. **Content CMS**
3. **Availability / Hold / Booking Operations**
4. **Customer / Member CRM**
5. **Payment & Confirmation**
6. **Analytics / Audit / Notification**

## 4.2 Core architecture rule
- Public website is driven by **room type**
- Operations are managed by **physical room**
- Pricing is stored at the room-type/business level but may be overridden per booking
- Hold and Booking are different business states
- Manual verification exists in phase 1, but entity structure supports future automation

---

# 5. Detailed Functional Requirements (BRD)

## 5.1 Public Website Module

### BRD-PUB-001 Home / Landing Page
**Description:**  
A premium, modern, visually refined landing page with a boutique hospitality feel.

**Requirements:**
- Hero slider/carousel
- Modular content sections
- Featured room types
- Featured branches
- Featured offers/promotions
- Contact CTA
- Membership CTA
- Google Map snippet
- VI/EN language switch
- Responsive on mobile and desktop

### BRD-PUB-002 Branch Pages
**Requirements:**
- Branch list page
- Branch detail page
- Branch-specific room types
- Address, hotline, opening information
- Embedded Google Map
- Gallery
- Optional branch-specific offers

### BRD-PUB-003 Room Type Listing
**Requirements:**
- List room types per branch or all branches
- Filter by branch
- Room thumbnail, title, short description
- Show/hide “From xxx / night” based on admin setting
- Availability / Hold CTA
- Support multilingual room content

### BRD-PUB-004 Room Type Detail
**Requirements:**
- Title
- Slug
- Short description
- Full description
- Amenities
- Hashtags / tags
- Featured image
- Gallery images
- Capacity
- Bed type
- Area
- View
- Policy summary
- Public visible remaining-room indicator by room type
- Show price or hide price according to system setting
- CTA: Check room / Hold room / Contact

### BRD-PUB-005 Offers / Promotions
**Requirements:**
- Promotion listing page
- Promotion detail page
- Basic campaign banner support
- Multilingual content

### BRD-PUB-006 Services / About / Contact / Support / Recruitment
**Requirements:**
- Standard content pages
- Modular sections
- SEO title/meta support
- VN/EN support

### BRD-PUB-007 Blog / News
**Requirements:**
- Blog listing
- Blog detail
- Search/filter by category or tag
- Approval workflow before publish
- SEO support
- VI/EN content support

### BRD-PUB-008 Membership / Authentication
**Requirements:**
- Guest account creation may originate from availability requests
- Member login by email
- First login requires password setup
- Prepare schema for Google login later
- Separate marketing consent checkbox, default checked
- Member can view history after login

### BRD-PUB-009 Availability Check
**Requirements:**
- Select branch
- Select room type
- Select check-in/check-out date and time
- Enter contact details
- Optional notes
- Submit request
- Show acknowledgment on screen
- Send confirmation email

### BRD-PUB-010 Hold Room Request
**Requirements:**
- Similar to availability request but treated as hold-intent
- Create stronger priority request for staff review
- Does not auto-confirm booking
- Staff still controls actual hold creation

### BRD-PUB-011 Customer History
**Requirements:**
After login, customer can view:
- availability requests
- hold-related requests
- bookings
- payment requests
- payment proof status
- booking confirmation documents

---

## 5.2 CMS / Content Management Module

### BRD-CMS-001 Page Management
- Create/edit/publish pages
- Modular page sections
- VI/EN translations
- SEO title/meta/slug

### BRD-CMS-002 Banner Management
- Seasonal/campaign banner support
- Simple banner placement logic
- Schedule publish window
- Branch-scope or global-scope option

### BRD-CMS-003 Room Content Management
- Manage room type content
- Featured image + gallery
- Hashtags/tags
- VI/EN content
- Amenities assignment
- Display order
- Publish control

### BRD-CMS-004 Blog Approval Workflow
- Staff/editor creates draft
- Submit for approval
- Admin receives notification
- Admin can approve / reject / request changes
- Publish only after approval

### BRD-CMS-005 SEO Management
- SEO title
- Meta description
- Slug
- Open Graph image selection
- Index/follow toggles (optional if needed)

---

## 5.3 Branch / Floor / Physical Room Module

### BRD-OPS-001 Branch Management
- Two branches initially
- Manage branch profile
- Contact details
- Bank account association
- Public visibility
- Language content

### BRD-OPS-002 Floor Management
- Create floors per branch
- Floor name/number
- Sort order
- Public hidden; admin only

### BRD-OPS-003 Physical Room Management
- Room number/code
- Branch assignment
- Floor assignment
- Room type assignment
- Operational status
- Maintenance/blocked support
- Notes
- Grid/list by floor

### BRD-OPS-004 Room Type to Physical Room Relationship
- One room type can map to many physical rooms
- Public inventory view must aggregate from physical room states

### BRD-OPS-005 Room Operational Status
Supported states:
- available
- held
- booked
- blocked
- maintenance

---

## 5.4 Availability / Hold / Booking Operations Module

### BRD-BKG-001 Availability Request Queue
- New requests list
- Filters by branch, room type, date range, status
- SLA clock visible
- Assign to staff
- Status updates

### BRD-BKG-002 Hold Workflow
- Separate from booking
- Staff can create actual hold
- Hold is linked to physical room
- Hold has expiry time
- Default 30 minutes, editable
- Staff with permission may extend hold
- Auto-release when expired

### BRD-BKG-003 Manual Reservation Creation
- Create booking manually
- One booking in phase 1 = one room
- Backend schema remains extensible
- Link to branch, room type, physical room, customer, pricing, dates
- Status transitions must be logged

### BRD-BKG-004 Room Suggestion Engine
- System suggests suitable available physical rooms
- Staff may override if permitted
- Recommendation based on:
  - room type match
  - availability
  - not blocked/maintenance
  - simple ordered rule (e.g. floor/room number)

### BRD-BKG-005 Booking Expiry
- If deposit is not confirmed within allowed hold/deposit time:
  - booking auto-cancels
  - held room is released
  - logs are stored
  - notification may be triggered

### BRD-BKG-006 Confirmation Document
- Booking confirmation email
- Booking confirmation PDF
- Confirmed after staff verifies payment

---

## 5.5 Pricing & Promotion Module

### BRD-PRI-001 Core Price Fields
Required in phase 1:
- `base_price`
- `weekend_surcharge`
- `manual_override_price`

### BRD-PRI-002 Public Price Display
- Toggle show/hide public price
- If visible: display “From xxx / night”
- If hidden: display only CTA

### BRD-PRI-003 Price Calculation Rule
Priority:
1. manual override price
2. base price
3. weekend surcharge if applicable
4. promotion if applicable

### BRD-PRI-004 Basic Promotion Support
Phase 1 only:
- percentage discount
- fixed amount discount
- display label / campaign badge
- effective date range
- branch targeting
- room type targeting

---

## 5.6 Payment / Deposit Module

### BRD-PAY-001 Branch Bank Account
- Each branch has its own bank account
- One active primary account per branch
- Configurable transfer instructions

### BRD-PAY-002 Dynamic VietQR
- Generate QR by:
  - amount
  - booking code
  - branch bank account
- Display in email and portal / secure page

### BRD-PAY-003 Payment Proof Upload
- Customer can upload via secure email link
- Or upload after login in member portal
- Multiple proofs optional if resubmission is needed
- File type and size controls

### BRD-PAY-004 Manual Verification
- Staff verifies transfer manually
- Verify / reject / request re-upload
- Verification must be permission-controlled and logged

### BRD-PAY-005 Payment Confirmation
- Verified payment triggers:
  - booking status update
  - payment status update
  - confirmation email
  - PDF issuance

---

## 5.7 Customer / Member CRM Module

### BRD-CRM-001 Customer Profile
- Name
- Email
- Phone
- Preferences
- Notes
- Membership status
- Consent status

### BRD-CRM-002 Account Lifecycle
Possible state model:
- lead_only
- pending_first_login
- active
- suspended

### BRD-CRM-003 Marketing Consent
- Separate checkbox required
- Default checked
- Must log:
  - status
  - timestamp
  - source
  - consent text version

### BRD-CRM-004 Customer Notes
- Staff note
- Manager note
- Timestamp
- Author
- Private/internal only

### BRD-CRM-005 Customer History
- Room views
- Availability requests
- Hold requests
- Reservations
- Payment requests
- Payment proof uploads
- Confirmation documents

---

## 5.8 Dashboard / Analytics Module

### BRD-ANA-001 Dashboard KPIs
- Total visits
- New leads/members
- Availability requests
- Hold requests
- Reservations
- Confirmed bookings
- Pending deposits
- Expired bookings
- Top branches
- Top room types

### BRD-ANA-002 Filters
- Date range
- Branch
- Room type
- Traffic source

### BRD-ANA-003 Behavior Tracking
- Page view
- Room detail view
- Gallery image click
- Availability request submit
- Hold intent submit
- Login
- Payment request open
- Proof upload

### BRD-ANA-004 Customer History Insight
- Ability to identify repeated room interest for known customers after account association

---

## 5.9 Notification & SLA Module

### BRD-NOT-001 Realtime Notifications
- Request received
- Request assigned
- Hold expiring
- Booking expiring
- Payment proof uploaded
- Content approval pending

### BRD-NOT-002 Email Notifications
Configurable recipients based on role or assignment.

### BRD-NOT-003 SLA
- First response SLA for availability request: **30 minutes default, editable**
- Hold/payment deadline before auto-cancel: **30 minutes default, editable**

---

## 5.10 Audit & Security Module

### BRD-SEC-001 Audit Log
Log all important changes:
- content edits
- booking creation/update/cancel
- payment verification
- permission changes
- publish approval
- room operational status change

### BRD-SEC-002 Permissions
- Role-based permissions
- Branch-scoped permissions where applicable
- Explicit verification rights for payment and approval actions

---

# 6. Non-Functional Requirements

## 6.1 Performance
- Public pages should load quickly and feel premium on mobile
- Admin lists should support pagination and filtering
- Dashboard should load within acceptable internal-use thresholds

## 6.2 Security
- Role-based access control
- Branch-scoped visibility where applicable
- Secure tokenized link for public payment proof upload
- Protected file access for proofs and booking confirmations

## 6.3 Localization
- Phase 1 supports VN/EN only
- Hospitality terminology should be standardized in English content

## 6.4 Auditability
- Every critical operation must create a traceable log entry
- Payment verification must be auditable

## 6.5 Extensibility
- Schema must support future:
  - OTA mapping
  - payment provider integration
  - OAuth login
  - richer price rules
  - multi-room reservations

---

# 7. State Models

## 7.1 Availability Request Status
- new
- assigned
- in_progress
- contacted
- converted
- closed
- cancelled

## 7.2 Hold Status
- active
- extended
- expired
- released
- converted_to_booking

## 7.3 Reservation Status
- draft
- pending_contact
- pending_deposit
- confirmed
- cancelled
- expired
- checked_in
- checked_out

## 7.4 Payment Status
- pending
- sent
- proof_uploaded
- pending_verification
- verified
- rejected
- expired

## 7.5 Content Status
- draft
- in_review
- approved
- published
- rejected
- archived

---

# 8. Database Schema Draft (PostgreSQL-Oriented)

> Notes:
> - Data types are suggested for PostgreSQL.
> - `id` fields may use UUID.
> - Timestamps use `timestamptz`.
> - `created_at`, `updated_at`, and `deleted_at` are implied where useful even if not repeated every time.
> - Foreign key indexes should be added on all major relationships.
> - Branch scoping should be applied where needed.

## 8.1 Hotel / Branch / Floor / Room

### `branches`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(30) | UQ | Branch code |
| name_vi | varchar(255) |  | |
| name_en | varchar(255) |  | |
| slug | varchar(255) | UQ | |
| phone | varchar(50) |  | |
| email | varchar(255) |  | |
| address_vi | text |  | |
| address_en | text |  | |
| google_map_url | text |  | |
| status | varchar(30) |  | active/inactive |
| sort_order | int |  | |
| created_at | timestamptz |  | |
| updated_at | timestamptz |  | |

### `floors`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| branch_id | uuid | FK | references branches(id) |
| floor_code | varchar(30) |  | |
| floor_name | varchar(100) |  | e.g. Floor 2 |
| floor_number | int |  | |
| sort_order | int |  | |
| status | varchar(30) |  | |

### `room_types`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(30) | UQ | internal room type code |
| slug | varchar(255) | UQ | |
| featured_image_id | uuid | FK | media_assets |
| default_capacity_adult | int |  | |
| max_capacity_adult | int |  | |
| max_capacity_child | int |  | |
| max_occupancy | int |  | |
| bed_type_summary | varchar(255) |  | |
| bed_count | int |  | |
| room_area_sqm | numeric(8,2) |  | |
| view_type | varchar(100) |  | |
| bathroom_type | varchar(100) |  | |
| smoking_allowed | boolean |  | |
| pet_allowed | boolean |  | |
| extra_bed_allowed | boolean |  | |
| display_price_enabled | boolean |  | |
| base_price | numeric(12,2) |  | |
| weekend_surcharge | numeric(12,2) |  | |
| status | varchar(30) |  | draft/published/inactive |

### `room_type_translations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| room_type_id | uuid | FK | |
| locale | varchar(10) | IDX | vi / en |
| title | varchar(255) |  | |
| short_description | text |  | |
| full_description | text |  | |
| policy_summary | text |  | |
| seo_title | varchar(255) |  | |
| seo_description | text |  | |
| publish_status | varchar(30) |  | |
| UNIQUE(room_type_id, locale) |  |  | |

### `rooms`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| branch_id | uuid | FK | |
| floor_id | uuid | FK | |
| room_type_id | uuid | FK | |
| room_number | varchar(30) |  | physical room number |
| room_code | varchar(30) | UQ | internal code |
| operational_status | varchar(30) |  | available/held/booked/blocked/maintenance |
| is_sellable | boolean |  | |
| note | text |  | |
| sort_order | int |  | |

### `room_operational_status_logs`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| room_id | uuid | FK | |
| old_status | varchar(30) |  | |
| new_status | varchar(30) |  | |
| reason | text |  | |
| changed_by_user_id | uuid | FK | |
| changed_at | timestamptz |  | |

### `room_blocks`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| room_id | uuid | FK | |
| block_type | varchar(30) |  | maintenance/manual/other |
| starts_at | timestamptz |  | |
| ends_at | timestamptz |  | |
| reason | text |  | |
| created_by_user_id | uuid | FK | |

## 8.2 Media / Amenities / Tags

### `media_assets`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| storage_path | text |  | |
| mime_type | varchar(100) |  | |
| alt_text_vi | varchar(255) |  | |
| alt_text_en | varchar(255) |  | |
| width | int |  | |
| height | int |  | |
| uploaded_by_user_id | uuid | FK | |

### `room_type_images`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| room_type_id | uuid | FK | |
| media_asset_id | uuid | FK | |
| is_featured | boolean |  | |
| sort_order | int |  | |

### `amenities`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(50) | UQ | |
| icon_name | varchar(100) |  | optional |

### `amenity_translations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| amenity_id | uuid | FK | |
| locale | varchar(10) | IDX | |
| label | varchar(255) |  | |

### `room_type_amenities`
| Field | Type | Key | Notes |
|---|---|---|---|
| room_type_id | uuid | PK/FK | |
| amenity_id | uuid | PK/FK | |

### `tags`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(50) | UQ | |
| type | varchar(30) |  | public/internal |

### `tag_translations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| tag_id | uuid | FK | |
| locale | varchar(10) | IDX | |
| label | varchar(255) |  | |

### `room_type_tags`
| Field | Type | Key | Notes |
|---|---|---|---|
| room_type_id | uuid | PK/FK | |
| tag_id | uuid | PK/FK | |

## 8.3 CMS / Pages / Blog

### `pages`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| page_code | varchar(50) | UQ | home/about/contact/support/etc |
| slug | varchar(255) | UQ | |
| status | varchar(30) |  | draft/published |
| created_by_user_id | uuid | FK | |

### `page_translations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| page_id | uuid | FK | |
| locale | varchar(10) | IDX | |
| title | varchar(255) |  | |
| body_json | jsonb |  | modular content |
| seo_title | varchar(255) |  | |
| seo_description | text |  | |
| publish_status | varchar(30) |  | |

### `banners`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(50) | UQ | |
| placement | varchar(50) |  | home_hero/home_mid/etc |
| branch_id | uuid | FK nullable | branch-specific if needed |
| starts_at | timestamptz |  | |
| ends_at | timestamptz |  | |
| status | varchar(30) |  | |

### `banner_translations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| banner_id | uuid | FK | |
| locale | varchar(10) | IDX | |
| title | varchar(255) |  | |
| subtitle | text |  | |
| cta_label | varchar(100) |  | |
| cta_url | text |  | |
| media_asset_id | uuid | FK | |

### `posts`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| category_code | varchar(50) |  | |
| slug | varchar(255) | UQ | |
| author_user_id | uuid | FK | |
| approval_status | varchar(30) |  | draft/in_review/approved/published/rejected |
| featured_image_id | uuid | FK | |
| published_at | timestamptz |  | |

### `post_translations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| post_id | uuid | FK | |
| locale | varchar(10) | IDX | |
| title | varchar(255) |  | |
| excerpt | text |  | |
| body_markdown | text |  | |
| seo_title | varchar(255) |  | |
| seo_description | text |  | |
| UNIQUE(post_id, locale) |  |  | |

### `post_review_workflows`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| post_id | uuid | FK | |
| action | varchar(30) |  | submitted/approved/rejected/commented |
| actor_user_id | uuid | FK | |
| note | text |  | |
| acted_at | timestamptz |  | |

## 8.4 Customers / Membership / CRM

### `customers`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| full_name | varchar(255) |  | |
| email | varchar(255) | IDX | |
| phone | varchar(50) |  | |
| source | varchar(50) |  | website/request/manual |
| account_state | varchar(30) |  | lead_only/pending_first_login/active/suspended |
| email_verified | boolean |  | |
| first_seen_at | timestamptz |  | |
| last_activity_at | timestamptz |  | |

### `customer_accounts`
| Field | Type | Key | Notes |
|---|---|---|---|
| customer_id | uuid | PK/FK | |
| auth_provider | varchar(30) |  | email/google future |
| password_set_at | timestamptz |  | |
| activation_required_on_first_login | boolean |  | |
| last_login_at | timestamptz |  | |

### `customer_marketing_consents`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| customer_id | uuid | FK | |
| consent_status | boolean |  | |
| consent_source | varchar(50) |  | availability_form/signup/etc |
| consent_text_version | varchar(50) |  | |
| consent_at | timestamptz |  | |
| ip_address | inet |  | optional |
| user_agent | text |  | optional |

### `customer_notes`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| customer_id | uuid | FK | |
| author_user_id | uuid | FK | |
| note | text |  | internal note |
| created_at | timestamptz |  | |

## 8.5 Availability, Holds, Reservations

### `availability_requests`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| request_code | varchar(30) | UQ | |
| customer_id | uuid | FK | |
| branch_id | uuid | FK | |
| assigned_user_id | uuid | FK nullable | |
| request_type | varchar(30) |  | availability_check / hold_intent |
| status | varchar(30) |  | |
| planned_check_in_at | timestamptz |  | |
| planned_check_out_at | timestamptz |  | |
| response_sla_due_at | timestamptz |  | |
| note_from_customer | text |  | |
| source_url | text |  | |
| created_at | timestamptz |  | |

### `availability_request_items`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| availability_request_id | uuid | FK | |
| room_type_id | uuid | FK | |
| quantity_requested | int |  | phase 1 UI may be 1 |

### `reservation_holds`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| hold_code | varchar(30) | UQ | |
| availability_request_id | uuid | FK nullable | |
| customer_id | uuid | FK | |
| branch_id | uuid | FK | |
| room_id | uuid | FK | physical room |
| room_type_id | uuid | FK | |
| status | varchar(30) |  | active/extended/expired/released/converted_to_booking |
| starts_at | timestamptz |  | |
| expires_at | timestamptz |  | |
| created_by_user_id | uuid | FK | |
| extended_by_user_id | uuid | FK nullable | |
| extension_count | int |  | default 0 |
| note | text |  | |

### `reservations`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| reservation_code | varchar(40) | UQ | |
| customer_id | uuid | FK | |
| branch_id | uuid | FK | |
| source | varchar(30) |  | manual/web future/ota future |
| status | varchar(30) |  | |
| planned_check_in_at | timestamptz |  | |
| planned_check_out_at | timestamptz |  | |
| base_price | numeric(12,2) |  | copied snapshot |
| weekend_surcharge | numeric(12,2) |  | copied snapshot |
| manual_override_price | numeric(12,2) |  | |
| promotion_amount | numeric(12,2) |  | |
| total_amount | numeric(12,2) |  | |
| deposit_amount | numeric(12,2) |  | |
| deposit_due_at | timestamptz |  | |
| created_by_user_id | uuid | FK | |
| confirmed_at | timestamptz |  | nullable |
| cancelled_at | timestamptz |  | nullable |

### `reservation_room_items`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| reservation_id | uuid | FK | |
| room_id | uuid | FK | physical room |
| room_type_id | uuid | FK | |
| nightly_rate_snapshot | numeric(12,2) |  | |
| note | text |  | |
| UNIQUE(reservation_id, room_id) |  |  | |

### `reservation_status_logs`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| reservation_id | uuid | FK | |
| old_status | varchar(30) |  | |
| new_status | varchar(30) |  | |
| actor_user_id | uuid | FK | |
| note | text |  | |
| changed_at | timestamptz |  | |

## 8.6 Pricing and Promotions

### `promotions`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(50) | UQ | |
| promotion_type | varchar(30) |  | percentage/fixed_amount/display_only |
| label | varchar(255) |  | |
| value_amount | numeric(12,2) |  | |
| starts_at | timestamptz |  | |
| ends_at | timestamptz |  | |
| status | varchar(30) |  | active/inactive |

### `promotion_targets`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| promotion_id | uuid | FK | |
| branch_id | uuid | FK nullable | |
| room_type_id | uuid | FK nullable | |

## 8.7 Payment / QR / Proof

### `branch_bank_accounts`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| branch_id | uuid | FK | |
| bank_name | varchar(100) |  | |
| account_number | varchar(100) |  | |
| account_name | varchar(255) |  | |
| qr_provider | varchar(50) |  | vietqr |
| is_primary | boolean |  | |
| status | varchar(30) |  | |

### `payment_requests`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| reservation_id | uuid | FK | |
| branch_bank_account_id | uuid | FK | |
| payment_code | varchar(40) | UQ | |
| payment_type | varchar(30) |  | deposit/balance |
| amount | numeric(12,2) |  | |
| transfer_content | varchar(255) |  | |
| qr_payload_json | jsonb |  | |
| secure_upload_token | varchar(255) |  | |
| expires_at | timestamptz |  | |
| status | varchar(30) |  | |
| sent_at | timestamptz |  | |

### `payment_proofs`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| payment_request_id | uuid | FK | |
| uploaded_by_customer_id | uuid | FK nullable | |
| media_asset_id | uuid | FK | |
| upload_source | varchar(30) |  | email_link/member_portal |
| uploaded_at | timestamptz |  | |
| note | text |  | |

### `payment_status_logs`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| payment_request_id | uuid | FK | |
| old_status | varchar(30) |  | |
| new_status | varchar(30) |  | |
| actor_user_id | uuid | FK nullable | nullable if system |
| note | text |  | |
| changed_at | timestamptz |  | |

### `booking_confirmation_documents`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| reservation_id | uuid | FK | |
| document_type | varchar(30) |  | email/pdf |
| media_asset_id | uuid | FK nullable | if stored file |
| generated_at | timestamptz |  | |
| generated_by_user_id | uuid | FK nullable | |

## 8.8 Roles / Permissions / Audit / Notifications

### `roles`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(50) | UQ | system_admin/admin/manager/staff |
| name | varchar(100) |  | |

### `permissions`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| module_code | varchar(50) |  | |
| permission_code | varchar(100) | UQ | e.g. reservation.create |

### `role_permissions`
| Field | Type | Key | Notes |
|---|---|---|---|
| role_id | uuid | PK/FK | |
| permission_id | uuid | PK/FK | |

### `user_branch_assignments`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK | |
| branch_id | uuid | FK | |

### `audit_logs`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| actor_user_id | uuid | FK | |
| module_code | varchar(50) |  | |
| entity_type | varchar(50) |  | |
| entity_id | uuid |  | |
| action_code | varchar(100) |  | |
| old_data_json | jsonb |  | |
| new_data_json | jsonb |  | |
| created_at | timestamptz |  | |

### `notifications`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | uuid | PK | |
| recipient_user_id | uuid | FK | |
| channel | varchar(30) |  | in_app/email |
| notification_type | varchar(50) |  | |
| title | varchar(255) |  | |
| body | text |  | |
| related_entity_type | varchar(50) |  | |
| related_entity_id | uuid |  | |
| is_read | boolean |  | |
| created_at | timestamptz |  | |

## 8.9 Analytics

### `page_visits`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | bigserial | PK | |
| customer_id | uuid | FK nullable | |
| anonymous_session_id | varchar(100) | IDX | |
| page_type | varchar(50) |  | |
| page_ref_id | uuid | nullable | |
| referrer | text |  | |
| utm_source | varchar(100) |  | |
| utm_medium | varchar(100) |  | |
| utm_campaign | varchar(100) |  | |
| ip_country | varchar(50) |  | optional |
| ip_region | varchar(100) |  | optional |
| visited_at | timestamptz |  | |

### `room_views`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | bigserial | PK | |
| customer_id | uuid | FK nullable | |
| anonymous_session_id | varchar(100) | IDX | |
| room_type_id | uuid | FK | |
| branch_id | uuid | FK nullable | |
| viewed_at | timestamptz |  | |

### `gallery_clicks`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | bigserial | PK | |
| customer_id | uuid | FK nullable | |
| anonymous_session_id | varchar(100) | IDX | |
| room_type_id | uuid | FK | |
| media_asset_id | uuid | FK | |
| clicked_at | timestamptz |  | |

### `availability_check_events`
| Field | Type | Key | Notes |
|---|---|---|---|
| id | bigserial | PK | |
| availability_request_id | uuid | FK | |
| customer_id | uuid | FK nullable | |
| submitted_at | timestamptz |  | |

---

# 9. Suggested Indexes and Constraints

## 9.1 Essential unique constraints
- branches.code
- branches.slug
- room_types.code
- room_types.slug
- rooms.room_code
- pages.slug
- posts.slug
- reservation_holds.hold_code
- reservations.reservation_code
- payment_requests.payment_code

## 9.2 Essential indexes
- rooms(branch_id, floor_id, operational_status)
- availability_requests(branch_id, status, created_at)
- reservation_holds(room_id, status, expires_at)
- reservations(branch_id, status, planned_check_in_at, planned_check_out_at)
- payment_requests(reservation_id, status, expires_at)
- room_views(room_type_id, viewed_at)
- page_visits(visited_at)
- customers(email)

## 9.3 Key overlap rule
When creating hold or reservation for a physical room:
- no overlapping active hold or reservation is allowed for the same room and time range
- implementation should use timestamp overlap logic, not date-only logic

---

# 10. Permission Matrix by Module

Legend:
- **F** = full access
- **V** = view
- **C/U** = create and update
- **A** = approve/assign/advanced action
- **L** = limited by assigned branch or assigned item
- **-** = no access by default

Roles:
- **SA** = System Admin
- **AD** = Admin
- **MG** = Manager
- **ST** = Staff
- **MB** = Member / Customer portal

## 10.1 High-Level Module Matrix

| Module | SA | AD | MG | ST | MB |
|---|---|---|---|---|---|
| Dashboard (global) | F | F | L | L | - |
| Branch management | F | F | V | - | - |
| Floor management | F | F | L | V | - |
| Physical room management | F | F | L | L | - |
| Room type master/content | F | F | L | L if permitted | V public only |
| Pricing & promotions | F | F | L | L if permitted | V public only |
| Availability request handling | F | F | L | L | submit/view own |
| Hold workflow | F | F | L | L if permitted | view own only |
| Reservation workflow | F | F | L | L if permitted | view own only |
| Payment/deposit verification | F | F | L | L if permitted | upload/view own |
| Customer/CRM | F | F | L | L if permitted | view own |
| CMS pages | F | F | L | L if permitted | V public only |
| Blog/news approval | F | F | V | draft only if permitted | V public only |
| SEO/banners | F | F | L | L if permitted | V public only |
| Notifications | F | F | L | L | view own |
| Analytics | F | F | L | L filtered | own history only |
| Users & roles | F | F limited | - | - | - |
| Audit logs | F | V | L limited | - | - |
| System settings | F | L | - | - | - |
| Integration settings | F | L | - | - | - |

## 10.2 Detailed Permission Set by Module

### A. Branch & Structure
| Permission Code | SA | AD | MG | ST |
|---|---|---|---|---|
| branch.read | ✓ | ✓ | assigned only | - |
| branch.create | ✓ | ✓ | - | - |
| branch.update | ✓ | ✓ | assigned only (limited fields optional) | - |
| branch.delete | ✓ | limited | - | - |
| floor.read | ✓ | ✓ | assigned only | assigned only |
| floor.create | ✓ | ✓ | assigned only | - |
| floor.update | ✓ | ✓ | assigned only | - |
| room.read | ✓ | ✓ | assigned only | assigned only |
| room.create | ✓ | ✓ | assigned only | - |
| room.update | ✓ | ✓ | assigned only | assigned only if permitted |
| room.change_status | ✓ | ✓ | assigned only | assigned only if permitted |
| room.block_maintenance | ✓ | ✓ | assigned only | assigned only if permitted |

### B. Room Type & Content
| Permission Code | SA | AD | MG | ST |
|---|---|---|---|---|
| room_type.read | ✓ | ✓ | assigned only | assigned only |
| room_type.create | ✓ | ✓ | assigned only | if permitted |
| room_type.update | ✓ | ✓ | assigned only | if permitted |
| room_type.publish | ✓ | ✓ | assigned only if policy allows | - |
| room_image.manage | ✓ | ✓ | assigned only | if permitted |
| room_amenity.manage | ✓ | ✓ | assigned only | if permitted |
| room_tag.manage | ✓ | ✓ | assigned only | if permitted |
| room_price.manage | ✓ | ✓ | assigned only | if permitted |

### C. Availability Requests
| Permission Code | SA | AD | MG | ST | MB |
|---|---|---|---|---|---|
| availability_request.submit | - | - | - | - | ✓ |
| availability_request.read | ✓ | ✓ | assigned branch | assigned items/branch | own only |
| availability_request.assign | ✓ | ✓ | assigned branch | - | - |
| availability_request.update_status | ✓ | ✓ | assigned branch | assigned items/branch | - |
| availability_request.add_note | ✓ | ✓ | assigned branch | assigned items/branch | - |
| availability_request.export | ✓ | ✓ | assigned branch | - | - |

### D. Holds
| Permission Code | SA | AD | MG | ST | MB |
|---|---|---|---|---|---|
| hold.create | ✓ | ✓ | assigned branch | if permitted | - |
| hold.read | ✓ | ✓ | assigned branch | assigned items/branch | own only |
| hold.extend | ✓ | ✓ | assigned branch | if permitted | - |
| hold.release | ✓ | ✓ | assigned branch | if permitted | - |
| hold.convert_to_booking | ✓ | ✓ | assigned branch | if permitted | - |

### E. Reservations
| Permission Code | SA | AD | MG | ST | MB |
|---|---|---|---|---|---|
| reservation.create | ✓ | ✓ | assigned branch | if permitted | - |
| reservation.read | ✓ | ✓ | assigned branch | assigned items/branch | own only |
| reservation.update | ✓ | ✓ | assigned branch | if permitted | - |
| reservation.cancel | ✓ | ✓ | assigned branch | if permitted | - |
| reservation.confirm | ✓ | ✓ | assigned branch | if permitted | - |
| reservation.generate_confirmation | ✓ | ✓ | assigned branch | if permitted | view own |
| reservation.export | ✓ | ✓ | assigned branch | - | - |

### F. Payments / Deposit
| Permission Code | SA | AD | MG | ST | MB |
|---|---|---|---|---|---|
| payment_request.create | ✓ | ✓ | assigned branch | if permitted | - |
| payment_request.read | ✓ | ✓ | assigned branch | assigned items/branch | own only |
| payment_request.send | ✓ | ✓ | assigned branch | if permitted | - |
| payment_proof.upload | - | - | - | - | ✓ |
| payment_proof.read | ✓ | ✓ | assigned branch | assigned items/branch | own only |
| payment.verify | ✓ | ✓ | assigned branch | if permitted | - |
| payment.reject | ✓ | ✓ | assigned branch | if permitted | - |

### G. CMS & Blog
| Permission Code | SA | AD | MG | ST |
|---|---|---|---|---|
| page.read | ✓ | ✓ | assigned scope | assigned scope |
| page.create | ✓ | ✓ | assigned scope | if permitted |
| page.update | ✓ | ✓ | assigned scope | if permitted |
| page.publish | ✓ | ✓ | if permitted | - |
| banner.manage | ✓ | ✓ | assigned scope | if permitted |
| post.create | ✓ | ✓ | ✓ | if permitted |
| post.submit_review | ✓ | ✓ | ✓ | if permitted |
| post.approve | ✓ | ✓ | - | - |
| post.publish | ✓ | ✓ | if policy allows | - |

### H. Customers / CRM
| Permission Code | SA | AD | MG | ST | MB |
|---|---|---|---|---|---|
| customer.read | ✓ | ✓ | assigned branch only | assigned items/branch | own only |
| customer.update | ✓ | ✓ | assigned branch only | if permitted | limited own fields |
| customer.note.create | ✓ | ✓ | assigned branch only | if permitted | - |
| customer.note.read | ✓ | ✓ | assigned branch only | assigned items/branch | - |
| customer.history.read | ✓ | ✓ | assigned branch only | assigned items/branch | own only |
| consent.read | ✓ | ✓ | assigned branch only | if permitted | own only |

### I. Analytics / Audit / Settings
| Permission Code | SA | AD | MG | ST |
|---|---|---|---|---|
| analytics.read_global | ✓ | ✓ | - | - |
| analytics.read_branch | ✓ | ✓ | assigned branch | assigned branch limited |
| audit_log.read | ✓ | ✓ limited | assigned branch limited | - |
| user.manage | ✓ | ✓ | - | - |
| role.manage | ✓ | limited | - | - |
| system_settings.manage | ✓ | limited | - | - |
| integration_settings.manage | ✓ | limited | - | - |

---

# 11. Guest / Member Portal Capabilities

| Capability | Guest | Logged-in Member |
|---|---|---|
| Browse public pages | ✓ | ✓ |
| View room detail | ✓ | ✓ |
| Submit availability request | ✓ | ✓ |
| Submit hold-intent request | ✓ | ✓ |
| Receive confirmation email | ✓ | ✓ |
| View request history | - | ✓ |
| View booking history | - | ✓ |
| View payment request | secure link or login | ✓ |
| Upload proof | secure link or login | ✓ |
| Manage marketing preferences | - | ✓ |
| Set password first login | if account exists | ✓ |

---

# 12. Suggested Admin Screens

## 12.1 Public CMS screens
- Home section editor
- Page editor (VI/EN)
- Room type editor (VI/EN)
- Banner manager
- Blog draft/review/publish manager
- SEO panel

## 12.2 Operations screens
- Dashboard overview
- Availability request inbox
- Hold queue
- Reservation list
- Floor-by-floor room grid
- Physical room status board
- Payment verification queue
- Customer profile and notes
- Confirmation document list

## 12.3 Management screens
- Users / roles / branch assignments
- Audit logs
- Settings
- Notification rules
- Branch bank account configuration
- Pricing/promotion manager

---

# 13. Background Jobs / Automation Needed

## 13.1 Required jobs
- Expire holds automatically
- Auto-cancel overdue pending-deposit bookings
- Send SLA reminders
- Send pending approval notifications
- Generate/send confirmation documents
- Optional daily digest emails later

## 13.2 Recommended event triggers
- request.created
- request.assigned
- hold.created
- hold.expired
- reservation.created
- payment_request.created
- payment_proof.uploaded
- payment.verified
- content.review_requested
- content.approved

---

# 14. Risks and Design Recommendations

## 14.1 Risks
- Manual verification can cause operational delay if notifications are not well-routed
- Public display of price may cause mismatch expectations if rate explanation is unclear
- No early email verification may allow low-quality leads
- Branch-based complexity increases when physical room inventory data is incomplete at project start

## 14.2 Recommendations
1. Keep UI premium and simple, but keep backend state transitions strict.
2. Use explicit status logs for all booking and payment transitions.
3. Prepare schema for multi-room future even if phase 1 UI limits to one room.
4. Use secure public upload links for deposit proof to reduce customer friction.
5. Add disclaimers when public price is displayed: “reference starting price only”.
6. Define assignment and notification routing rules early, not after launch.
7. Use English hospitality terminology review before publishing EN content.

---

# 15. Delivery Phasing Recommendation

## Phase 1A – Foundation
- auth & roles
- branches / floors / rooms
- room types / multilingual content
- media
- CMS skeleton

## Phase 1B – Public Website
- home
- room listing/detail
- branch pages
- offers/services/about/contact/support/recruitment
- blog/news
- SEO
- VI/EN

## Phase 1C – Operations
- availability request
- hold workflow
- reservation workflow
- room suggestion
- notifications
- customer history
- notes
- audit logs

## Phase 1D – Deposit & Confirmation
- branch bank accounts
- VietQR flow
- payment proof upload
- verification queue
- email + PDF confirmation
- auto-expiry and auto-cancel jobs

## Phase 2
- Google login
- OTP
- OTA mapping and sync
- payment gateway/webhook
- advanced pricing
- deeper marketing automation

---

# 16. Final Summary

This platform should be understood as:

> A premium multilingual hotel website with CMS, member capture, physical-room-aware booking operations, manual deposit verification, and a scalable data model prepared for OTA and automated payment expansion.

It is not just a marketing website, and it is not yet a fully automated booking engine.  
It is a strong operational foundation that can evolve in a controlled way.
