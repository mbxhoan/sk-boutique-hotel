# Testing Checklist

## Public website
- Home page loads correctly on desktop/mobile
- VI/EN content switches correctly
- branch pages render expected content
- room type listing and detail pages work
- price shows or hides according to configuration
- forms validate properly
- SEO basics render correctly

## Availability / hold flows
- guest can submit availability request
- guest can submit hold request
- acknowledgement email is sent
- customer profile is created/updated
- internal notification is triggered
- SLA timer starts
- hold expires automatically when overdue
- expired hold releases room

## Reservation flows
- staff can create reservation
- server prevents double-allocation conflicts
- reservation status changes log correctly
- confirmed reservations show in member history
- auto-cancel works when deposit window is exceeded

## Payment flows
- payment request email is sent
- QR payload renders correctly
- guest can upload proof via secure link
- member can upload proof after login
- staff can verify/reject payment
- confirmation email sends after verification
- PDF generation works

## Member account flows
- guest-created account can later set first password
- login works after password setup
- member sees own request history only
- member sees own reservation history only
- unauthorized access is denied

## CMS / content
- admin can create/edit pages
- translations save correctly
- blog review workflow works
- publish states behave correctly
- media uploads succeed

## Permission checks
- staff without permission cannot confirm payment
- branch-scoped users cannot access other branches
- only approvers can approve posts
- only permitted roles can view audit logs

## Analytics / logs
- visit tracking records events
- room view tracking records events
- gallery click tracking records events
- audit logs record sensitive actions
- notification logs record dispatch events

## Non-functional
- responsive layouts
- reasonable performance on public pages
- image optimization works
- error states are readable
- no sensitive data leaks in client responses
