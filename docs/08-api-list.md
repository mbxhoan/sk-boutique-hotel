# API List (Draft)

## Public APIs
- `GET /api/public/branches`
- `GET /api/public/branches/:slug`
- `GET /api/public/room-types`
- `GET /api/public/room-types/:slug`
- `GET /api/public/offers`
- `GET /api/public/posts`
- `GET /api/public/pages/:slug`
- `POST /api/public/availability-requests`
- `POST /api/public/hold-requests`
- `POST /api/public/track-event`

## Auth / member APIs
- `POST /api/auth/first-password-setup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/member/profile`
- `PATCH /api/member/profile`
- `GET /api/member/requests`
- `GET /api/member/reservations`
- `GET /api/member/notifications`
- `GET /api/member/payment-requests/:id`
- `POST /api/member/payment-proofs`

## Admin CMS APIs
- `GET /api/admin/pages`
- `POST /api/admin/pages`
- `PATCH /api/admin/pages/:id`
- `GET /api/admin/posts`
- `POST /api/admin/posts`
- `PATCH /api/admin/posts/:id`
- `POST /api/admin/posts/:id/submit-review`
- `POST /api/admin/posts/:id/approve`
- `POST /api/admin/posts/:id/reject`
- `GET /api/admin/banners`
- `POST /api/admin/banners`

## Admin hotel structure APIs
- `GET /api/admin/branches`
- `POST /api/admin/branches`
- `GET /api/admin/floors`
- `POST /api/admin/floors`
- `GET /api/admin/rooms`
- `POST /api/admin/rooms`
- `PATCH /api/admin/rooms/:id/status`
- `GET /api/admin/room-types`
- `POST /api/admin/room-types`

## Request / reservation APIs
- `GET /api/admin/availability-requests`
- `POST /api/admin/availability-requests/:id/assign`
- `POST /api/admin/availability-requests/:id/convert-to-hold`
- `POST /api/admin/availability-requests/:id/convert-to-reservation`
- `GET /api/admin/holds`
- `POST /api/admin/holds/:id/extend`
- `POST /api/admin/holds/:id/cancel`
- `GET /api/admin/reservations`
- `POST /api/admin/reservations`
- `PATCH /api/admin/reservations/:id`
- `POST /api/admin/reservations/:id/confirm`

## Payment APIs
- `POST /api/admin/reservations/:id/payment-request`
- `GET /api/payment/public/:token`
- `POST /api/payment/public/:token/upload-proof`
- `POST /api/admin/payment-requests/:id/verify`
- `POST /api/admin/payment-requests/:id/reject`
- `GET /api/admin/payment-requests`

## Analytics / logs APIs
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/rooms`
- `GET /api/admin/analytics/branches`
- `GET /api/admin/audit-logs`
- `GET /api/admin/notifications`

## Internal jobs / server actions
- expire holds
- cancel overdue pending deposit reservations
- SLA escalation notifications
- send confirmation emails
- generate booking confirmation PDF

## Notes
- use server-side authorization checks for all admin/member endpoints
- treat availability checks as server-authoritative
- avoid exposing internal room allocation logic to public clients
