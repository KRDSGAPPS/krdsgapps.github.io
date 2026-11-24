# Firestore Security Specification

## 1. Data Invariants
1. Public visitors and Google Play Console crawlers can read `/apps/{appId}` and `/settings/profile` without authentication so Privacy Policy URLs and app listings work publicly.
2. Only the verified administrator (`shakirgoran@gmail.com` with `email_verified == true`, or a user whose UID exists in `/admins/{uid}`) may create, update, or delete `/apps/{appId}` and `/settings/{settingId}`.
3. All document IDs (`appId`, `settingId`, `uid`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
4. Every write enforces strict schema keys (`hasAll` + `hasOnly`), string length bounds, valid enum values (`published`, `in_development`, `upcoming`), `ownerUid == request.auth.uid` integrity, immutable `createdAt`/`ownerUid`, and server-enforced `request.time` timestamps.
5. `/admins/{uid}` is never publicly readable and cannot be self-created by non-admin users.

## 2. Dirty Dozen Attack Vectors (Expected: PERMISSION_DENIED)
1. Unauthenticated create on `/apps/muroo-sort`.
2. Authenticated non-admin (`attacker@example.com`, `email_verified: true`) create on `/apps/muroo-sort`.
3. Spoofed admin email (`shakirgoran@gmail.com`, `email_verified: false`) create on `/apps/muroo-sort`.
4. Shadow field injection (`isAdmin: true`) during `/apps` create.
5. Oversized string (`titleEn` > 120 chars or `privacyPolicyEn` > 12000 chars) on `/apps` write.
6. Invalid slug format (`slug: "Bad Slug!"`) on `/apps` create.
7. Invalid status enum (`status: "deleted"`) on `/apps` write.
8. Client-spoofed `createdAt` or `updatedAt` not matching `request.time`.
9. Overwriting `ownerUid` to another UID during `/apps` update.
10. Unauthenticated or non-admin update to `/settings/profile`.
11. Unauthenticated read or list on `/admins/{uid}`.
12. Non-admin self-registration into `/admins/{attackerUid}`.
