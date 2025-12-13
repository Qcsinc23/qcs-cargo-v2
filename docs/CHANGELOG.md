# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Invoice PDF Generation** - Professional PDF invoices with QCS branding, downloadable from invoice detail page
- **Payment Recovery Flow** - Retry payment button for failed/pending payment bookings
  - Alert banners on booking detail and list pages
  - Direct link to payment page with existing booking data
- **Booking Modification (24-hour window)** - Customers can modify bookings within 24 hours of creation
  - Editable fields: `scheduled_date`, `time_slot`, `special_instructions`
  - Status restrictions: only `pending_payment` and `confirmed` bookings
  - Full E2E test coverage (12 tests)
- **Offline Warehouse Scanning** - Warehouse admins can scan packages offline
  - IndexedDB storage for offline scans
  - Service Worker with background sync
  - `OfflineIndicator` and `SyncStatusBadge` components
  - Audio/haptic feedback for scans
  - 20 E2E tests (97% pass rate)
- **Weight Discrepancy Workflow** - Admin process for handling weight differences
  - `WeightDiscrepancy` component with 10% threshold alerts
  - Admin dashboard at `/admin/weight-discrepancies`
  - Actions: Proceed, Notify Customer, Hold Package
  - API endpoint: `/api/admin/packages/weight-discrepancy`
- **WCAG 2.1 AA Accessibility** - Full compliance with web accessibility standards
  - Comprehensive accessibility audit with `@axe-core/playwright`
  - Color contrast fixes (minimum 4.5:1 for normal text)
  - Keyboard navigation and focus management
  - Screen reader support (ARIA attributes, semantic HTML)
  - 17 E2E accessibility tests (100% passing)
  - Full compliance report: `docs/ACCESSIBILITY-COMPLIANCE.md`
- Phase 1 Core Operations Implementation
- Real-time tracking system with public API and admin management
- Admin operations dashboard with live data integration
- Warehouse management system with QR/barcode scanning
- SMS notification system with Twilio integration
- Breadcrumbs navigation component for better UX
- Fixed logout functionality across all headers
- Fixed booking service selection flow

### Changed
- Upgraded to **Svelte 5** (`^5.46.0`) with full runes support
- Migrated all numeric inputs to use `svelte-number-format` library
- Enhanced booking status tracking (added `pending_payment`, `payment_failed`)
- Improved error handling with consistent toast notifications
- Color palette: Updated amber colors for better accessibility (amber-500 → amber-700 with white text)

### Dependencies
- Added @axe-core/playwright: ^4.11.0 for accessibility testing
- Added pdfmake: ^0.17.2 and @types/pdfmake: ^0.17.4 for PDF generation
- Added svelte-number-format: ^1.1.0 for locale-aware input formatting
- Added twilio: ^5.10.7 for SMS notifications
- Added qrcode: ^1.5.3 for package tracking
- Upgraded svelte to ^5.46.0

### Testing
- **Total E2E Tests:** 57 (95%+ pass rate)
- **Accessibility Tests:** 17 (100% passing)
- Coverage includes:
  - Invoice PDF generation (3 tests)
  - Payment recovery flow (5 tests)
  - Booking modification (12 tests)
  - Offline warehouse scanning (20 tests)
  - WCAG 2.1 AA compliance (17 tests)

---

## [2.0.0] - 2024-12-12

### Added
- Complete rewrite of QCS Cargo application
- New tech stack: SvelteKit + PocketBase + Stripe + Resend
- Authentication system with email, OAuth, and password reset
- Booking system with Stripe payments
- Customer dashboard
- Public pages (landing, services, pricing, destinations, FAQ)
- Basic admin panel structure