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

### Dependencies
- Added pdfmake: ^0.17.2 and @types/pdfmake: ^0.17.4 for PDF generation
- Added svelte-number-format: ^1.1.0 for locale-aware input formatting
- Added twilio: ^5.10.7 for SMS notifications
- Added qrcode: ^1.5.3 for package tracking
- Upgraded svelte to ^5.46.0

## [2.0.0] - 2024-12-12

### Added
- Complete rewrite of QCS Cargo application
- New tech stack: SvelteKit + PocketBase + Stripe + Resend
- Authentication system with email, OAuth, and password reset
- Booking system with Stripe payments
- Customer dashboard
- Public pages (landing, services, pricing, destinations, FAQ)
- Basic admin panel structure