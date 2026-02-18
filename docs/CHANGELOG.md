# Changelog

All notable changes to this project are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Added
- Admin placeholder routes to prevent broken navigation and 404s:
  - `/admin/bookings/[id]`
  - `/admin/bookings/new`
  - `/admin/shipments/[id]`
  - `/admin/shipments/new`
  - `/admin/invoices/[id]`
  - `/admin/users/[id]`
- Expanded and refreshed core documentation:
  - `README.md`
  - `docs/ENVIRONMENT.md`
  - `docs/DEPLOYMENT-RUNBOOK.md`
  - `docs/URLS.md`
  - `docs/PRODUCTION-MONITORING.md`
  - `docs/STRIPE.md`

### Changed
- Fixed dynamic link interpolation across dashboard/admin/public pages (replaced literal `"/path/{id}"` strings with actual runtime interpolation).
- Hardened admin dashboard API PocketBase requests using unique `requestKey` values to prevent auto-cancel collisions.
- Updated email sender env handling so `RESEND_FROM_EMAIL` is optional and no longer emits false missing-var warnings.
- Improved E2E stability for admin booking details navigation assertions.

### Fixed
- Invoice PDF endpoint now uses request-scoped PocketBase client and explicit role checks.
- Booking modification date handling now supports non-ISO/date-only values consistently.
- Time-slot API now parses date params using strict local-date parsing to avoid timezone day-shift bugs.
- PocketBase schema/setup scripts aligned with current auth/users schema behavior.

### Validation (2026-02-18)
- `npm run check` ✅
- `npm run lint -- --quiet` ✅
- `npm run test:unit` ✅
- `npm run test:a11y` ✅
- `npm run test:e2e -- --project=chromium` ✅ (`96 passed`, `1 skipped`)

## [2.0.0] - 2024-12-12

### Added
- Major application rewrite on SvelteKit + PocketBase.
- Core booking, shipment, invoice, recipient, and dashboard flows.
- Admin operations panel foundation.
