# Data Model (Conceptual)

## Core domain groups

### Hotel structure
- hotels
- branches
- floors
- rooms

### Content
- pages
- page_sections
- posts
- banners
- media_assets
- translations

### Room commerce
- room_types
- room_type_images
- amenities
- tags
- branch_room_types
- promotions

### Operations
- availability_requests
- room_holds
- reservations
- reservation_room_items
- room_blocks
- maintenance records

### Customers
- customers
- customer_accounts
- customer_notes
- marketing_consents

### Payments
- branch_bank_accounts
- payment_requests
- payment_proofs
- payment_logs

### Governance
- roles
- permissions
- assignments
- audit_logs
- notification_logs

### Analytics
- page_visits
- room_views
- gallery_clicks
- availability_events
- traffic_sources

## Important modeling rules
1. Room type content is separate from physical rooms
2. Physical rooms belong to:
   - one branch
   - one floor
   - one room type
3. Reservations reference room type and assigned physical room
4. Holds are not the same as reservations
5. Payment requests are not the same as payment proofs
6. Content must support VI/EN
7. Pricing is simple in phase 1 but extensible:
   - base_price
   - weekend_surcharge
   - manual_override_price

## Suggested minimal entity notes

### branches
Stores:
- brand branch identity
- address/map/contact data
- active status

### floors
Stores:
- branch ownership
- floor code/name
- sort order

### rooms
Stores:
- branch_id
- floor_id
- room_type_id
- room_number/code
- operational_status
- notes

### room_types
Stores:
- displayable room type info
- occupancy
- featured content
- price visibility eligibility

### room_type_translations
Stores:
- locale
- title
- slug
- short description
- long description
- seo fields

### room_holds
Stores:
- request/reservation association
- hold expiry
- staff ownership
- assigned room

### reservations
Stores:
- customer
- branch
- room type
- check-in/out timestamps
- pricing fields
- status

### payment_requests
Stores:
- reservation reference
- bank account
- amount
- transfer content
- QR payload
- expiry
- status

### payment_proofs
Stores:
- upload file path
- uploaded by
- note
- review status

## Data evolution notes
Future phase may add:
- rate plans
- channel mappings
- OTA sync logs
- payment transactions
- OAuth identities
