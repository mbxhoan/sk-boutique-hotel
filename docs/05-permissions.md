# Permissions

## Roles
- System Admin
- Admin
- Branch Manager
- Staff
- Member
- Guest (public)

## Permission model principles
1. System Admin can access technical/admin-only areas
2. Admin can manage most business operations globally
3. Branch Manager is scoped to assigned branches
4. Staff is scoped by assigned permissions and branch access
5. Member permissions are limited to their own data
6. Guest has only public access

## High-level module access

### Content CMS
- System Admin: full
- Admin: full
- Branch Manager: optional branch-scoped or disabled
- Staff: optional if granted
- Member/Guest: none

### Branch/Floor/Room management
- System Admin: full
- Admin: full
- Branch Manager: assigned branches
- Staff: mostly read or limited update
- Member/Guest: none

### Room type management
- System Admin: full
- Admin: full
- Branch Manager: assigned branches
- Staff: optional if granted
- Member/Guest: none

### Request handling
- System Admin: full
- Admin: full
- Branch Manager: assigned branches
- Staff: assigned requests and/or branch queue
- Member: own request history read-only
- Guest: create only through public flow

### Reservations
- System Admin: full
- Admin: full
- Branch Manager: assigned branches
- Staff: create/update if granted
- Member: view own
- Guest: none

### Payment verification
- System Admin: full
- Admin: full
- Branch Manager: if granted
- Staff: if granted
- Member: upload/view own proof/status only

### Blog/news approval
- System Admin: full
- Admin: reviewer/approver
- Branch Manager: optional reviewer if later needed
- Staff: draft/create if granted
- Member/Guest: none

### Analytics
- System Admin: full
- Admin: full
- Branch Manager: branch-scoped
- Staff: limited if granted
- Member/Guest: none

### Audit logs
- System Admin: full
- Admin: read
- others: none unless explicitly required

## Sensitive actions requiring explicit permission
- confirm payment
- extend hold expiry
- cancel confirmed reservation
- change room operational status to blocked/maintenance
- publish or approve content
- edit SEO metadata
- export customer data
- view audit logs
- change role assignments

## Branch scoping
For manager/staff roles:
- must be restricted to assigned branches unless explicitly global
- UI should not leak data from unassigned branches

## Member access rules
Member can:
- view own profile
- view own requests
- view own reservations
- view own payment requests
- upload own payment proof
- update selected profile fields

Member cannot:
- change pricing
- access staff notes
- access branch operations
