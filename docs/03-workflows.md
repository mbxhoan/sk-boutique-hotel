# Workflows

## 1. Availability Check Request
1. Guest opens room page or booking CTA
2. Guest selects:
   - branch
   - date range
   - planned check-in/out
   - room type
3. Guest enters:
   - full name
   - email
   - phone
   - note
4. Guest optionally keeps marketing checkbox checked
5. System creates availability request
6. System sends acknowledgement email
7. System creates/updates customer profile
8. Internal users receive realtime and/or email notification
9. Staff handles request within SLA (default 30 minutes, editable)

## 2. Hold Room Workflow
1. Staff reviews request
2. Staff checks availability by room type and physical rooms
3. System suggests a matching physical room
4. Staff can accept or override suggested room
5. Staff creates hold
6. Hold expiry is set (default 30 minutes, editable if permission allows)
7. If expired:
   - hold auto-releases room
   - staff sees status change
   - notification/log entry created

## 3. Manual Reservation Workflow
1. Staff creates reservation from request or directly
2. Reservation includes:
   - customer
   - branch
   - room type
   - physical room
   - stay window
   - pricing
3. Phase 1 UI supports 1 room only
4. Reservation enters pending deposit or confirmed based on business action
5. Reservation status log is recorded

## 4. Deposit Request Workflow
1. Staff creates payment request
2. System generates:
   - amount
   - transfer content
   - QR payload
   - branch bank account reference
3. System sends email and shows request in member portal
4. Guest uploads proof via secure link or while logged in
5. Staff manually verifies bank receipt
6. Staff marks payment verified/rejected
7. If verified:
   - reservation confirmed
   - confirmation email sent
   - PDF generated

## 5. Member First Login Workflow
1. Guest already exists from request form
2. Guest clicks login
3. If password not set:
   - redirect to first-time password setup
4. After setup:
   - guest can log in
   - guest can view request history
   - guest can view reservation history
   - guest can upload proof or read notifications

## 6. Blog / News Approval Workflow
1. Staff drafts post
2. Staff submits for review
3. Admin receives notification
4. Admin approves / rejects / requests edits
5. Approved content becomes publishable

## 7. SLA Escalation Workflow
1. Request enters new state
2. Timer starts
3. If not accepted/handled within SLA:
   - escalate to configured recipients
4. Escalation logged

## 8. Room Status Workflow
Allowed statuses in phase 1:
- available
- held
- booked
- blocked
- maintenance

Important rule:
- blocked/maintenance rooms must never be suggested for holds or reservations
- server-side conflict checks are mandatory before commit

## 9. Public Price Display Workflow
If enabled:
- display “From xxx / night”
If disabled:
- hide price
- show CTA only

## 10. History Views for Members
Member can see:
- availability requests
- hold requests
- reservation list
- reservation detail
- payment request status
- uploaded proof status
