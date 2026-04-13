# Scope — Phase 1

## In scope

### Public website
- Home page
- Brand / about pages
- Branch pages
- Room type listing and room type detail
- Services
- Offers / promotions
- Contact page
- Support page
- Recruitment page
- Blog / news
- VI/EN language switch
- Google Map embeds
- Contact CTAs
- Member login
- History view for requests and bookings

### Room discovery and demand capture
- Availability check request
- Hold room request
- Form capture for guest name, email, phone, note
- Marketing consent checkbox (default checked, editable in copy)
- Email acknowledgement after submit

### Member / account
- Customer account created from request form
- Password setup on first real login
- Login for member history and notifications
- Future-ready auth design for Google login

### Admin / staff portal
- Branch management
- Floor management
- Physical room management
- Room type content management
- Amenities, tags, images
- SEO fields
- CMS page and section management
- Blog/news with approval workflow
- Availability request inbox
- Hold management
- Manual reservation creation
- Deposit request generation
- Payment proof review
- PDF + email booking confirmation
- Analytics dashboard
- Audit logs
- Notification center

### Pricing / commercial
- base_price
- weekend_surcharge
- manual_override_price
- basic promotion support
- show/hide public price switch

### Statuses
- available / held / booked / blocked / maintenance
- payment states
- request states
- reservation states

### Non-functional
- responsive UI
- admin role-based access
- bilingual content support
- audit logging
- SLA tracking
- background jobs for expiry/cancellation reminders

## Out of scope for phase 1
- OTA sync implementation
- real-time channel manager
- automatic bank reconciliation
- payment gateway automation
- coupon engine complexity
- loyalty engine complexity
- housekeeping full workflow
- full PMS functionality
- advanced revenue pricing engine
- multi-room checkout flow in UI
- social login enablement (design only)

## Recommended phase boundaries
### Phase 1A
Foundation, auth, roles, branches, floors, rooms, room types, CMS basics

### Phase 1B
Public website, multilingual content, room pages, requests, member shell

### Phase 1C
Hold workflow, manual reservations, deposit workflow, confirmations

### Phase 1D
Analytics, SLA tracking, audit logs, polish, release readiness

## Scope control rules
- Do not introduce OTA logic in phase 1 implementation
- Do not implement auto-booking from public website
- Keep booking manual after staff confirmation
- Keep promotion rules simple
- Prefer stable core workflows over flashy extras
