# Security Specification - Namma Mela

## Data Invariants
1. A booking must be associated with an authenticated user.
2. Users can only read their own bookings from the root `/bookings` collection.
3. Users can only create bookings for themselves.
4. Admins have full access to all data.
5. All IDs must be valid (not poisoned).
6. Timestamps and system fields must be protected.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Theft (Create)**: User A tries to create a booking with `userId: "UserB"`.
   - Result: `PERMISSION_DENIED`
2. **Identity Theft (Read)**: User A tries to read User B's bookings from `/bookings`.
   - Result: `PERMISSION_DENIED`
3. **Admin Escalation**: User A tries to update their profile `role` to `admin`.
   - Result: `PERMISSION_DENIED`
4. **ID Poisoning**: User A tries to create a booking with a 2KB junk string as `playId`.
   - Result: `PERMISSION_DENIED`
5. **Shadow Field Injection**: User A tries to create a booking with an extra field `isPaid: true`.
   - Result: `PERMISSION_DENIED`
6. **State Shortcutting**: User A tries to update a play status from 'Ended' back to 'Active' (if they had update permissions).
   - Result: `PERMISSION_DENIED`
7. **Resource Exhaustion**: User A tries to send a 1MB string in `seatId`.
   - Result: `PERMISSION_DENIED`
8. **Relational Sync Break**: User A tries to create a booking for a `playId` that doesn't exist in `/plays`.
   - Result: `PERMISSION_DENIED`
9. **Blanket Read Attack**: User A tries to list ALL bookings without a `where` clause on `userId`.
   - Result: `PERMISSION_DENIED` (handled by rules requiring specific resource data checks)
10. **Immutable Field Wipe**: User A tries to change the `playId` of an existing booking.
    - Result: `PERMISSION_DENIED`
11. **PII Leak**: User A tries to read the `users` collection to get email addresses.
    - Result: `PERMISSION_DENIED`
12. **Anonymous Access**: An unauthenticated user tries to create a booking.
    - Result: `PERMISSION_DENIED`

## Success Patterns

1. **Owner Read**: User A can read their own bookings where `userId == request.auth.uid`.
2. **Standard Booking**: User A can create a booking for a valid play with their own `userId`.
3. **Public Read**: Anyone can read the list of active plays.
