# QCS Cargo 2.0 - Product Requirements Document

<!-- 
  ╔══════════════════════════════════════════════════════════════════════════════╗
  ║                                                                              ║
  ║   PASTE THE COMPLETE PRD DOCUMENT HERE                                       ║
  ║                                                                              ║
  ║   This file should contain the full Product Requirements Document            ║
  ║   including all sections:                                                    ║
  ║                                                                              ║
  ║   - Executive Summary                                                        ║
  ║   - Business Domain & Service Offerings                                      ║
  ║   - User Personas & Journey Maps                                             ║
  ║   - Technical Architecture                                                   ║
  ║   - Server & Deployment Configuration                                        ║
  ║   - Information Architecture & Sitemap                                       ║
  ║   - Weekly Development Plans (Weeks 1-9)                                     ║
  ║   - Database Schema Specification                                            ║
  ║   - API Specification                                                        ║
  ║   - Component Library Specification                                          ║
  ║   - Accessibility Requirements                                               ║
  ║   - Risk Register & Mitigation                                               ║
  ║   - Quality Assurance Checklist                                              ║
  ║   - Post-Launch Support Plan                                                 ║
  ║   - Version 2.1 Backlog                                                      ║
  ║   - Appendices                                                               ║
  ║                                                                              ║
  ╚══════════════════════════════════════════════════════════════════════════════╝
-->

QCS Cargo 2.0 — Comprehensive Product Requirements Document
Revised Edition with Gap Analysis Integration

Executive Summary
Project Name: QCS Cargo 2.0 Platform Rebuild Version: 2.0.1 (Revised Edition) Document Date: December 2024 Status: Approved for Development Revision Note: This document incorporates 47 gaps identified during UX/UI gap analysis.
Mission Statement
Replace the existing QCS Cargo React/Supabase platform with a modern, high-performance SvelteKit/PocketBase architecture that reduces booking completion time from 8+ minutes to under 2 minutes while maintaining the company's core value proposition: Trusted air freight to the Caribbean from New Jersey.
Business Context
QCS Cargo is a specialized air cargo logistics company with 15+ years of experience shipping from New Jersey to Caribbean destinations including Guyana, Jamaica, Trinidad, Barbados, and Suriname. The company serves three primary customer segments:
1. Commercial Logistics — Businesses requiring regular cargo shipments
2. Family & Personal Shipping — Individuals sending barrels, care packages, and personal items
3. Specialty & Oversized Cargo — Medical suppliers, fragile items, and high-value shipments
Key Statistics (to preserve in redesign):
* 10+ Years in Operation
* 5,000+ Shipments Completed
* 3-5 Days Average Transit Time
* 99% Customer Satisfaction Rate
* 98% On-Time Delivery Rate
* TSA Licensed Known Shipper
Revision Summary
This revised PRD addresses critical gaps identified during UX/UI analysis:
Category	Gaps Addressed	Impact
Booking Flow	6 gaps	Complete recipient capture, multi-package support
Payments	3 gaps	Payment recovery, invoice PDFs
User Management	4 gaps	GDPR compliance, security features
Warehouse	4 gaps	Photo capture, exception handling
Accessibility	4 gaps	WCAG 2.1 AA compliance
Mobile UX	3 gaps	Bottom navigation, responsive tables
Timeline Impact: Extended from 8 weeks to 9 weeks (+40 hours)

Table of Contents
1. Project Overview & Success Criteria
2. Business Domain & Service Offerings
3. User Personas & Journey Maps
4. Technical Architecture & Infrastructure
5. Server & Deployment Configuration
6. Information Architecture & Sitemap
7. Week 1: Foundation & Infrastructure
8. Week 2: Authentication & User System
9. Week 3: Public Tools & Marketing Pages
10. Week 4: Customer Dashboard
11. Week 5: Booking System & Payments
12. Week 6: Admin Panel Core
13. Week 7: Warehouse & Operations
14. Week 8: Migration & Testing
15. Week 9: Polish, Accessibility & Launch
16. Database Schema Specification
17. API Specification
18. Component Library Specification
19. Accessibility Requirements
20. Risk Register & Mitigation
21. Quality Assurance Checklist
22. Post-Launch Support Plan
23. Version 2.1 Backlog
24. Appendices

1. Project Overview & Success Criteria
1.1 Project Objectives
Replace the existing QCS Cargo React/Supabase platform with a streamlined SvelteKit/PocketBase architecture, eliminating technical debt while improving performance and user experience.
Primary Goals
Goal	Current State	Target State
Booking Completion Time	8+ minutes	< 2 minutes
Lighthouse Performance Score	Unknown	> 95 on all pages
Database Migrations	70+ Supabase migrations	Flat PocketBase schema
Warehouse Scanning	Online only	Offline-capable with background sync
Admin Operational Efficiency	Baseline	50% improvement
WCAG Compliance	Unknown	2.1 AA certified
Mobile Usability	Basic responsive	Mobile-first with native patterns
Secondary Goals
* Maintain SEO rankings for Caribbean shipping keywords
* Preserve all existing customer data and mailbox assignments
* Zero downtime migration
* GDPR/CCPA compliance (including right to deletion)
* Support for multi-package bookings
* Complete recipient information capture
1.2 Success Metrics
Metric	Target	Measurement Method	Frequency
Booking Completion Time	< 2 minutes	Analytics event tracking	Real-time
Booking Completion Rate	> 70%	Funnel analytics	Weekly
Warehouse Scan-to-Store	< 10 seconds	Activity log timestamps	Per scan
Page Load (LCP)	< 1.5 seconds	Lighthouse CI	Per deployment
System Uptime	99.5%	Dokploy monitoring	Continuous
Zero Critical Bugs at Launch	0 P0/P1 bugs	QA sign-off checklist	Pre-launch
Customer Support Ticket Reduction	25% decrease	Help desk analytics	Monthly
Quote-to-Booking Conversion	> 15%	Funnel analytics	Weekly
WCAG 2.1 AA Compliance	100%	axe/WAVE audit	Pre-launch
Mobile Task Completion	> 90%	User testing	Pre-launch
1.3 Project Constraints
Constraint	Details
Timeline	9 weeks (360 development hours)
Budget	Fixed scope, no additional infrastructure costs beyond Hostinger VPS
Team	Single developer + stakeholder reviews
Existing System	Must remain operational until migration complete
Data	All existing user accounts, mailboxes, and shipment history must migrate
Legal	Must comply with GDPR Article 17 (Right to Erasure) and CCPA
1.4 Out of Scope (v2.1 Backlog)
* Mobile native applications (iOS/Android)
* Multi-language support (Spanish, French Creole)
* Automated customs documentation generation
* Integration with third-party tracking aggregators
* SMS/WhatsApp notifications (Phase 1 uses email only)
* Two-factor authentication
* Payment plans/financing
* Account credit/balance system
* Advanced analytics dashboard

2. Business Domain & Service Offerings
2.1 Service Categories
QCS Cargo offers six core service categories:
Standard Air Freight
* Description: Fixed weekly departures with real-time tracking
* Features: Competitive bulk rates, professional handling, insurance options
* Pricing: Starting at $3.50/lb
* Transit Time: 3-5 business days
* Target Customer: Regular shippers, small businesses
Express Delivery
* Description: Urgent shipments with priority processing
* Features: Same-day processing, priority customs clearance, next-flight guarantee
* Pricing: Custom quotes (+25% over standard)
* Transit Time: 1-2 business days
* Target Customer: Time-sensitive commercial shipments, medical supplies
Door-to-Door Service
* Description: Complete logistics from pickup to final delivery
* Features: Free pickup in NJ area, last-mile delivery, end-to-end tracking, signature confirmation
* Pricing: Starting at $25 pickup fee + standard shipping
* Target Customer: Customers without transportation, convenience seekers
Consolidated Cargo
* Description: Cost-effective option for multiple packages
* Features: Volume discounts, secure consolidation, weekly consolidation windows
* Pricing: Save up to 30% vs individual shipments
* Target Customer: Frequent shippers, businesses with regular shipments
Customs Clearance
* Description: Expert brokerage services
* Features: Complete documentation, duty calculation assistance, compliance verification
* Pricing: From $35 per shipment
* Target Customer: Commercial importers, regulated goods shippers
Special Handling
* Description: Care for fragile, oversized, or high-value items
* Features: Custom crating, temperature control, high-value insurance, white-glove service
* Pricing: Custom quotes
* Target Customer: Medical suppliers, fragile goods, high-value shipments
2.2 Destination Matrix
Destination	City	Airport Code	Transit Time	Starting Rate
Guyana	Georgetown	GEO	3-4 days	$3.50/lb
Jamaica	Kingston	KIN	3-4 days	$3.75/lb
Trinidad	Port of Spain	POS	3-5 days	$3.50/lb
Barbados	Bridgetown	BGI	4-5 days	$4.00/lb
Suriname	Paramaribo	PBM	4-5 days	$4.25/lb
2.3 Prohibited Items
The following items cannot be shipped:
Absolutely Prohibited:
* Explosives and ammunition
* Illegal drugs and narcotics
* Hazardous materials (flammables, corrosives, radioactive)
* Live animals
* Perishable foods (without special arrangement)
* Currency and bearer instruments
* Counterfeit goods
Restricted (Requires Declaration):
* Lithium batteries (must be in device, max 2 per package)
* Perfumes and cosmetics (limited quantity)
* Medications (with prescription copy)
* Electronics over $500 (must declare)
* Alcohol (varies by destination)
2.4 Business Rules
Pricing Rules
typescript


Copy
interface PricingRules {
  // Base rates by destination (per lb)
  baseRates: {
    guyana: 3.50,
    jamaica: 3.75,
    trinidad: 3.50,
    barbados: 4.00,
    suriname: 4.25
  };
  
  // Service multipliers
  serviceMultipliers: {
    standard: 1.0,
    express: 1.25
  };
  
  // Dimensional weight factor (industry standard)
  dimWeightDivisor: 166; // cubic inches per lb
  
  // Minimum charges
  minimumCharge: 15.00; // USD
  
  // Volume discounts
  volumeDiscounts: [
    { minWeight: 100, discount: 0.05 },  // 5% off for 100+ lbs
    { minWeight: 500, discount: 0.10 },  // 10% off for 500+ lbs
    { minWeight: 1000, discount: 0.15 }  // 15% off for 1000+ lbs
  ];
  
  // Multi-package discount
  multiPackageDiscount: 0.05; // 5% off for 3+ packages in same booking
  
  // Pickup fees
  pickupFee: {
    withinNJ: 25.00,
    outsideNJ: 'custom_quote'
  };
  
  // Customs clearance
  customsClearanceFee: 35.00;
  
  // Insurance rate (percentage of declared value)
  insuranceRate: 0.02; // 2%
  minimumInsurance: 5.00;
}
Booking Rules
typescript


Copy
interface BookingRules {
  // Advance booking requirements
  minimumAdvanceHours: 24; // Must book at least 24 hours ahead
  maximumAdvanceDays: 30;  // Can book up to 30 days ahead
  
  // Package limits
  maxPackagesPerBooking: 20;
  maxWeightPerPackage: 150; // lbs
  maxTotalWeight: 2000; // lbs per booking
  
  // Time slots (warehouse operating hours)
  timeSlots: [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00'  // Mon-Fri only
  ];
  
  // Saturday reduced hours
  saturdaySlots: [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00'
  ];
  
  // Closed days
  closedDays: ['sunday'];
  
  // Slot capacity
  maxBookingsPerSlot: 10;
  
  // Modification policy
  freeModificationHours: 24; // Free changes up to 24 hours before
  
  // Cancellation policy
  freeCancellationHours: 12; // Free cancellation up to 12 hours before
  cancellationFee: 15.00;
  
  // Weight discrepancy threshold
  weightDiscrepancyThreshold: 0.10; // 10% variance triggers review
}

3. User Personas & Journey Maps
3.1 Primary User Personas
Persona 1: Maria — The Family Shipper
Demographics:
* Age: 45-60
* Location: New Jersey/New York area
* Tech Comfort: Low to Medium
* Shipping Frequency: Monthly (care packages to family)
Goals:
* Send barrels and care packages to family in Guyana/Jamaica
* Track shipments so family knows when to expect delivery
* Understand costs upfront, no surprises
* Trust that items arrive safely
Pain Points:
* Confused by shipping jargon and weight calculations
* Worried about items being damaged or lost
* Frustrated by unclear pricing
* Difficulty tracking once shipped
* Doesn't know what items are prohibited
Behaviors:
* Calls customer support frequently
* Prefers speaking to a real person
* Ships around holidays and special occasions
* Often doesn't know exact weights/dimensions
* Sends to same family members repeatedly
Quote: "I just want to make sure the barrel gets to my mother safely. I don't understand all these shipping terms."
Design Implications:
* Clear, jargon-free language with helper text on all fields
* "I don't know" options for weight/dimensions
* Prominent customer support contact
* Simple tracking with status explanations
* Proactive notifications at every status change
* Saved recipient feature ("My Recipients")
* Prohibited items checker with plain language
* Visual guides and illustrations

Persona 2: Marcus — The Small Business Owner
Demographics:
* Age: 35-50
* Business: Auto parts supplier to Caribbean dealers
* Tech Comfort: Medium to High
* Shipping Frequency: Weekly (5-15 packages)
Goals:
* Minimize shipping costs to maximize margins
* Reliable, predictable delivery times
* Easy invoicing for business accounting
* Volume discounts for regular shipments
* Ship multiple packages in one booking
Pain Points:
* Time wasted on manual booking processes
* Inconsistent pricing makes budgeting difficult
* Need to track multiple shipments simultaneously
* Customs delays affect business relationships
* Creating separate bookings for each package
Behaviors:
* Books multiple shipments at once
* Uses shipping calculator frequently to quote customers
* Exports invoice data for accounting
* Needs commercial invoices and documentation
* Ships to same business recipients regularly
Quote: "Time is money. I need to book 10 shipments in 10 minutes and get back to running my business."
Design Implications:
* Multi-package booking support
* Saved shipment templates
* Bulk booking capabilities
* Clear volume discount visibility
* PDF invoice download
* CSV export for invoices
* Dashboard showing all active shipments
* Quick repeat booking from history
* Commercial document upload support

Persona 3: Dwayne — The Warehouse Operator
Demographics:
* Age: 25-40
* Role: QCS Cargo warehouse staff
* Tech Comfort: Medium
* Device: Mobile phone (Android), USB barcode scanner
Goals:
* Quickly process incoming packages
* Accurately record weights and dimensions
* Minimize errors and rework
* Keep workflow moving during busy periods
* Document package condition on receipt
Pain Points:
* Scanning system goes offline (warehouse has spotty WiFi)
* Manual data entry takes too long
* Hard to find customer information
* Paper processes lead to errors
* No way to document damaged packages
* Weight discrepancies require manual follow-up
Behaviors:
* Works on mobile device while moving around warehouse
* Scans 50-100 packages per day
* Often works with gloves (large touch targets needed)
* Needs to work even when internet is spotty
* Uses USB barcode scanner at station
Quote: "When the system is down, everything backs up. I need something that works even without perfect internet."
Design Implications:
* Offline-first scanning capability
* Large, glove-friendly touch targets (min 48x48px)
* Quick lookup by tracking number or name
* Automatic sync when connection returns
* Haptic/audio feedback for successful scans
* USB barcode scanner support (keyboard input)
* Photo capture for package condition
* Exception/damage reporting workflow
* Weight discrepancy alerts
* Inventory location tracking

Persona 4: Sandra — The Admin/Operations Manager
Demographics:
* Age: 35-55
* Role: QCS Cargo operations manager
* Tech Comfort: High
* Device: Desktop computer, occasional tablet
Goals:
* Overview of all operations at a glance
* Quickly resolve customer issues
* Generate reports for management
* Manage staff and permissions
* Track all customer communications
Pain Points:
* Jumping between multiple systems
* Can't quickly find customer history
* Manual report generation is time-consuming
* No visibility into upcoming capacity
* No record of what was communicated to customer
Behaviors:
* Uses command palette / keyboard shortcuts
* Exports data regularly for analysis
* Handles escalated customer issues
* Coordinates with destination partners
* Needs full audit trail of changes
Quote: "I need to see everything happening across the business and fix problems before customers even notice."
Design Implications:
* Comprehensive dashboard with key metrics
* Global search (Cmd+K) across all data
* One-click customer history view
* Customer communication log
* Automated reporting with scheduling
* Capacity planning visibility
* Complete audit trail for all admin actions
* Bulk notification tools
* Staff activity monitoring

3.2 User Journey Maps
Journey 1: New Customer First Booking (Maria)



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│              NEW CUSTOMER JOURNEY: FIRST BOOKING                            │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│  PHASE   │ DISCOVER │  EXPLORE │  DECIDE  │   BOOK   │      TRACK           │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│          │          │          │          │          │                      │
│ ACTIONS  │• Google  │• View    │• Use     │• Create  │• Check email         │
│          │  search  │  services│  shipping│  account │• View dashboard      │
│          │• See ad  │• Read    │  calc    │• Add     │• Track shipment      │
│          │• Get     │  FAQ     │• Check   │  packages│• Share tracking      │
│          │  referral│• Check   │  prohib- │• Enter   │  with recipient      │
│          │          │  trust   │  ited    │  recip-  │• Contact support     │
│          │          │  signals │  items   │  ient    │  if questions        │
│          │          │          │• Call    │• Schedule│                      │
│          │          │          │  support │• Pay     │                      │
│          │          │          │          │• Get QR  │                      │
│          │          │          │          │  code    │                      │
│          │          │          │          │          │                      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│ TOUCH-   │• Google  │• Home    │• Shipping│• Booking │• Email confirmation  │
│ POINTS   │• Social  │  page    │  calc    │  wizard  │• Dashboard           │
│          │• Word of │• Services│• Prohib- │• Payment │• Tracking page       │
│          │  mouth   │  page    │  ited    │  page    │• Status emails       │
│          │          │• FAQ     │  items   │          │• Estimated delivery  │
│          │          │          │• Contact │          │                      │
│          │          │          │  page    │          │                      │
│          │          │          │          │          │                      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│ EMOTIONS │ Curious  │ Hopeful  │ Anxious  │ Committed│ Relieved → Satisfied │
│          │ Uncertain│ Comparing│ "Is this │ Excited  │ (if smooth)          │
│          │          │          │  right?" │          │ Frustrated (if not)  │
│          │          │          │          │          │                      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│ PAIN     │• Too many│• Unclear │• Don't   │• Too many│• No status updates   │
│ POINTS   │  options │  pricing │  know    │  steps   │• Confusing tracking  │
│          │• Trust   │• Jargon  │  weight  │• Payment │• Can't reach support │
│          │  issues  │• No      │• Fear of │  issues  │• No delivery ETA     │
│          │          │  reviews │  hidden  │• Forget  │                      │
│          │          │          │  fees    │  recipi- │                      │
│          │          │          │• What's  │  ent info│                      │
│          │          │          │  prohib- │          │                      │
│          │          │          │  ited?   │          │                      │
│          │          │          │          │          │                      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│ OPPORTU- │• Strong  │• Clear   │• "I don't│• Save    │• Proactive status    │
│ NITIES   │  SEO     │  value   │  know"   │  progress│  notifications       │
│          │• Trust   │  prop    │  option  │• Multi-  │• Clear timeline      │
│          │  signals │• Social  │• Support │  package │• Calculated ETA      │
│          │  on home │  proof   │  visible │  support │• Easy support access │
│          │          │• Helper  │• Prohib- │• Save    │• Share tracking link │
│          │          │  text    │  ited    │  recipi- │                      │
│          │          │          │  checker │  ent     │                      │
│          │          │          │          │• Express │                      │
│          │          │          │          │  checkout│                      │
│          │          │          │          │          │                      │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────────┘
Journey 2: Returning Business Customer (Marcus)



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│           RETURNING BUSINESS CUSTOMER: MULTI-PACKAGE BOOKING                │
├──────────┬────────────────┬────────────────┬────────────────────────────────┤
│  PHASE   │     LOGIN      │     BOOK       │           DONE                 │
├──────────┼────────────────┼────────────────┼────────────────────────────────┤
│          │                │                │                                │
│ ACTIONS  │• Go to site    │• Use template  │• Pay (saved card)              │
│          │• Login (saved  │  OR start new  │• Get QR codes for all          │
│          │  credentials)  │• Add multiple  │• Download invoice PDF          │
│          │                │  packages      │• Receive confirmation          │
│          │                │• Select saved  │• Export for accounting         │
│          │                │  recipients    │                                │
│          │                │• Review totals │                                │
│          │                │  with volume   │                                │
│          │                │  discount      │                                │
│          │                │                │                                │
├──────────┼────────────────┼────────────────┼────────────────────────────────┤
│ TARGET   │     < 30s      │     < 90s      │            < 30s               │
│ TIME     │                │                │                                │
├──────────┼────────────────┼────────────────┼────────────────────────────────┤
│                                                                             │
│ TOTAL JOURNEY TIME: < 2.5 MINUTES FOR 5 PACKAGES                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

4. Technical Architecture & Infrastructure
4.1 Technology Stack
Layer	Technology	Rationale
Frontend Framework	SvelteKit 2.x	SSR, file routing, smaller bundle size, excellent DX
Styling	Tailwind CSS + shadcn-svelte	Utility-first, accessible components, consistent design
Backend/Database	PocketBase (Go/SQLite)	Single binary, built-in auth, realtime subscriptions, simple deployment
Payments	Stripe	Industry standard, excellent docs, 3D Secure support
Email	Resend	Developer-friendly, React Email templates, good deliverability
QR Codes	qrcode library	Generate booking QR codes for warehouse scanning
PDF Generation	@react-pdf/renderer or pdfmake	AWB labels, manifests, invoices
Barcode Scanning	BarcodeDetector API + ZXing fallback	Native browser API with fallback
Image Handling	Sharp	Image optimization, thumbnails
Hosting	Hostinger VPS	Cost-effective, good performance
Deployment	Dokploy	Self-hosted PaaS, Docker orchestration, zero-downtime deploys
Backups	Litestream → Backblaze B2	Continuous SQLite replication, point-in-time recovery
Monitoring	Sentry + Dokploy built-in	Error tracking, performance monitoring, uptime
Accessibility Testing	axe-core, WAVE	Automated a11y testing in CI
4.2 Architecture Diagram



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                       │
│                                  │                                          │
│                          ┌───────▼───────┐                                  │
│                          │   Cloudflare   │                                 │
│                          │   (DNS + CDN)  │                                 │
│                          └───────┬───────┘                                  │
│                                  │                                          │
├──────────────────────────────────┼──────────────────────────────────────────┤
│  HOSTINGER VPS (82.25.85.157)    │                                          │
│  ┌───────────────────────────────┼───────────────────────────────────────┐  │
│  │                        DOKPLOY                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                       TRAEFIK (REVERSE PROXY)                    │  │  │
│  │  │                    SSL Termination (Let's Encrypt)               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │         │                                        │                    │  │
│  │         ▼                                        ▼                    │  │
│  │  ┌─────────────────┐                    ┌─────────────────┐           │  │
│  │  │  qcs-cargo-app  │                    │  qcs-cargo-pb   │           │  │
│  │  │   (SvelteKit)   │◄──────────────────▶│  (PocketBase)   │           │  │
│  │  │                 │     HTTP/REST      │                 │           │  │
│  │  │   Port 3000     │     Realtime WS    │   Port 8090     │           │  │
│  │  └─────────────────┘                    └────────┬────────┘           │  │
│  │                                                  │                    │  │
│  │                                                  ▼                    │  │
│  │                                         ┌───────────────┐             │  │
│  │                                         │  SQLite DB    │             │  │
│  │                                         │  (pb_data)    │             │  │
│  │                                         └───────┬───────┘             │  │
│  │                                                 │                     │  │
│  └─────────────────────────────────────────────────┼─────────────────────┘  │
│                                                    │                        │
├────────────────────────────────────────────────────┼────────────────────────┤
│  EXTERNAL SERVICES                                 │                        │
│                                                    │                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            ▼                        │
│  │ Stripe  │  │ Resend  │  │ Sentry  │    ┌──────────────┐                 │
│  │Payments │  │  Email  │  │ Errors  │    │ Backblaze B2 │                 │
│  └─────────┘  └─────────┘  └─────────┘    │   (Backups)  │                 │
│                                           │  Litestream  │                 │
│                                           └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
4.3 Data Model Overview



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POCKETBASE COLLECTIONS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐                           │
│  │     users       │────────▶│    mailboxes    │                           │
│  │     (Auth)      │   1:1   │                 │                           │
│  │─────────────────│         │─────────────────│                           │
│  │ id              │         │ id              │                           │
│  │ email           │         │ user            │──┐                        │
│  │ name            │         │ suite_code      │  │                        │
│  │ phone           │         │ status          │  │                        │
│  │ role            │         └─────────────────┘  │                        │
│  │ avatar          │                              │                        │
│  │ verified        │         ┌─────────────────┐  │                        │
│  │ deleted_at      │    ┌───▶│   recipients    │  │                        │
│  └────────┬────────┘    │    │                 │  │                        │
│           │             │    │─────────────────│  │                        │
│           │ 1:many      │    │ id              │  │                        │
│           │             │    │ user            │  │                        │
│           ▼             │    │ name            │  │                        │
│  ┌─────────────────┐    │    │ phone           │  │                        │
│  │    bookings     │────┤    │ address         │  │                        │
│  │                 │    │    │ destination     │  │                        │
│  │─────────────────│    │    │ is_default      │  │                        │
│  │ id              │    │    └─────────────────┘  │                        │
│  │ user            │    │                         │                        │
│  │ recipient       │────┘    ┌─────────────────┐  │                        │
│  │ scheduled_date  │         │   shipments     │◀─┘                        │
│  │ time_slot       │         │                 │                           │
│  │ qr_code         │         │─────────────────│                           │
│  │ status          │◀───────▶│ id              │                           │
│  └─────────────────┘  1:many │ booking         │                           │
│                              │ user            │                           │
│  ┌─────────────────┐         │ tracking_number │                           │
│  │    packages     │         │ status          │                           │
│  │                 │◀───────▶│ recipient       │                           │
│  │─────────────────│  many:1 │ destination     │                           │
│  │ id              │         │ events          │                           │
│  │ shipment        │         │ manifest        │                           │
│  │ weight_lbs      │         │ photos          │                           │
│  │ dimensions      │         │ customs_docs    │                           │
│  │ description     │         │ exceptions      │                           │
│  │ declared_value  │         └─────────────────┘                           │
│  │ photos          │                                                       │
│  └─────────────────┘                                                       │
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐                           │
│  │    invoices     │         │    manifests    │                           │
│  │                 │         │                 │                           │
│  │─────────────────│         │─────────────────│                           │
│  │ id              │         │ id              │                           │
│  │ user            │         │ manifest_number │                           │
│  │ booking         │         │ destination     │                           │
│  │ amount          │         │ flight_number   │                           │
│  │ status          │         │ status          │                           │
│  │ stripe_id       │         │ total_pieces    │                           │
│  │ pdf_url         │         │ total_weight    │                           │
│  └─────────────────┘         └─────────────────┘                           │
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐                           │
│  │ activity_logs   │         │ communications  │                           │
│  │                 │         │                 │                           │
│  │─────────────────│         │─────────────────│                           │
│  │ id              │         │ id              │                           │
│  │ user            │         │ user            │                           │
│  │ action          │         │ type            │                           │
│  │ resource_type   │         │ subject         │                           │
│  │ resource_id     │         │ content         │                           │
│  │ metadata        │         │ sent_by         │                           │
│  │ ip_address      │         │ sent_at         │                           │
│  └─────────────────┘         └─────────────────┘                           │
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐                           │
│  │    sessions     │         │    templates    │                           │
│  │                 │         │   (shipping)    │                           │
│  │─────────────────│         │─────────────────│                           │
│  │ id              │         │ id              │                           │
│  │ user            │         │ user            │                           │
│  │ device_info     │         │ name            │                           │
│  │ ip_address      │         │ destination     │                           │
│  │ last_active     │         │ recipient       │                           │
│  │ created         │         │ service_type    │                           │
│  └─────────────────┘         │ defaults        │                           │
│                              └─────────────────┘                           │
│                                                                             │
│  ┌─────────────────┐                                                       │
│  │    settings     │                                                       │
│  │                 │                                                       │
│  │─────────────────│                                                       │
│  │ key             │                                                       │
│  │ value           │                                                       │
│  │ type            │                                                       │
│  └─────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

5. Server & Deployment Configuration
⚠️ SECURITY NOTICE
The credentials below are for development reference only. In production, store all secrets in Dokploy's environment variables or a secrets manager. Never commit credentials to version control.
5.1 Server Access Details
Property	Value
Provider	Hostinger VPS
Server IP	82.25.85.157
SSH Access	ssh root@82.25.85.157
Root Password	[ROTATE IMMEDIATELY - stored in password manager]
Server Name	srv782537
OS	Ubuntu 22.04 LTS
RAM	4GB
Storage	50GB SSD
5.2 Dokploy Configuration
Property	Value
Dokploy Dashboard	https://82.25.85.157:3000
API Endpoint	https://82.25.85.157:3000/api
API Token	[stored in password manager]
5.3 Environment Variables
bash


Copy
# ===========================================
# POCKETBASE
# ===========================================
PUBLIC_POCKETBASE_URL=https://api.qcscargo.com

# ===========================================
# STRIPE (Payment Processing)
# ===========================================
PUBLIC_STRIPE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ===========================================
# EMAIL (Resend)
# ===========================================
RESEND_API_KEY=re_xxx
FROM_EMAIL=shipping@qcscargo.com
REPLY_TO_EMAIL=support@qcscargo.com

# ===========================================
# MONITORING
# ===========================================
SENTRY_DSN=https://xxx@sentry.io/xxx
PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# ===========================================
# BACKUPS
# ===========================================
B2_ACCOUNT_ID=xxx
B2_APPLICATION_KEY=xxx
B2_BUCKET=qcs-cargo-backups

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=production
PUBLIC_SITE_URL=https://qcscargo.com
PUBLIC_COMPANY_NAME=QCS Cargo
PUBLIC_COMPANY_PHONE=201-249-0929
PUBLIC_COMPANY_EMAIL=sales@quietcraftsolutions.com
PUBLIC_COMPANY_ADDRESS=35 Obrien St, E12 Kearny, NJ 07032

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_MULTI_PACKAGE=true
ENABLE_SAVED_RECIPIENTS=true
ENABLE_TEMPLATES=true
5.4 Domain Configuration
Domain	Purpose	SSL
qcscargo.com	Main SvelteKit application	Let's Encrypt
www.qcscargo.com	Redirect to qcscargo.com	Let's Encrypt
api.qcscargo.com	PocketBase API	Let's Encrypt
status.qcscargo.com	Service status page	Let's Encrypt
6. Information Architecture & Sitemap
6.1 Complete Sitemap



Copy
qcscargo.com/
├── Public Pages (No Auth Required)
│   ├── / (Home)
│   ├── /services
│   ├── /shipping-calculator
│   ├── /track (Public tracking)
│   ├── /track/[tracking_number]
│   ├── /t/[short_code] (Short tracking URL)
│   ├── /contact
│   ├── /about
│   ├── /faq
│   ├── /pricing
│   ├── /prohibited-items ← NEW
│   ├── /status ← NEW (Service status page)
│   ├── /destinations
│   │   ├── /destinations/guyana
│   │   ├── /destinations/jamaica
│   │   ├── /destinations/trinidad
│   │   ├── /destinations/barbados
│   │   └── /destinations/suriname
│   └── /legal
│       ├── /legal/terms
│       ├── /legal/privacy
│       └── /legal/shipping-policy
│
├── Authentication
│   ├── /auth/login
│   ├── /auth/register
│   ├── /auth/forgot-password
│   ├── /auth/reset-password/[token]
│   ├── /auth/verify-email/[token]
│   └── /auth/magic-link/[token]
│
├── Customer Dashboard (Auth Required)
│   ├── /dashboard
│   ├── /dashboard/shipments
│   ├── /dashboard/shipments/[id]
│   ├── /dashboard/bookings
│   ├── /dashboard/bookings/new ← ENHANCED (multi-package)
│   ├── /dashboard/bookings/[id]
│   ├── /dashboard/bookings/[id]/edit ← NEW
│   ├── /dashboard/bookings/[id]/confirmation
│   ├── /dashboard/bookings/[id]/retry-payment ← NEW
│   ├── /dashboard/invoices
│   ├── /dashboard/invoices/[id]
│   ├── /dashboard/mailbox
│   ├── /dashboard/recipients ← NEW
│   ├── /dashboard/recipients/new ← NEW
│   ├── /dashboard/recipients/[id] ← NEW
│   ├── /dashboard/templates ← NEW
│   ├── /dashboard/profile
│   ├── /dashboard/settings
│   ├── /dashboard/settings/security ← NEW
│   ├── /dashboard/settings/notifications ← NEW
│   ├── /dashboard/settings/sessions ← NEW
│   └── /dashboard/settings/delete-account ← NEW
│
├── Admin Panel (Admin Role Required)
│   ├── /admin
│   ├── /admin/shipments
│   ├── /admin/shipments/[id]
│   ├── /admin/bookings
│   ├── /admin/bookings/[id]
│   ├── /admin/users
│   ├── /admin/users/[id]
│   ├── /admin/users/[id]/communications ← NEW
│   ├── /admin/invoices
│   ├── /admin/invoices/[id]
│   ├── /admin/manifests
│   ├── /admin/manifests/new
│   ├── /admin/manifests/[id]
│   ├── /admin/reports
│   ├── /admin/reports/schedule ← NEW
│   ├── /admin/activity ← NEW (Activity log viewer)
│   ├── /admin/communications ← NEW (Bulk messaging)
│   └── /admin/settings
│       ├── /admin/settings/pricing ← NEW
│       └── /admin/settings/general
│
├── Warehouse Operations (Staff Role Required)
│   ├── /warehouse
│   ├── /warehouse/scan
│   ├── /warehouse/receive ← ENHANCED (photos, exceptions)
│   ├── /warehouse/exception/[id] ← NEW
│   ├── /warehouse/inventory
│   └── /warehouse/manifest/[id]
│
└── API Routes
    ├── /api/health
    ├── /api/auth/[...pocketbase]
    ├── /api/quotes/calculate
    ├── /api/quotes/prohibited-check ← NEW
    ├── /api/tracking/[tracking_number]
    ├── /api/bookings
    ├── /api/bookings/[id]
    ├── /api/bookings/[id]/modify ← NEW
    ├── /api/bookings/slots
    ├── /api/recipients ← NEW
    ├── /api/templates ← NEW
    ├── /api/payments/create-intent
    ├── /api/payments/webhook
    ├── /api/invoices/[id]/pdf ← NEW
    ├── /api/qr/[code]
    ├── /api/admin/users/export
    ├── /api/admin/communications ← NEW
    └── /api/warehouse/scan
6.2 Navigation Structure
Primary Navigation (Header)



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] QCS Cargo    Home  Services  Track  Calculator  Contact    [Login] │
└─────────────────────────────────────────────────────────────────────────────┘
Customer Dashboard - Desktop Sidebar



Copy
┌──────────────────┐
│  [Avatar] Maria  │
│  Suite: AB123456 │
├──────────────────┤
│  📊 Dashboard    │
│  📦 Shipments    │
│  📅 Bookings     │
│  💳 Invoices     │
│  📬 My Mailbox   │
│  👥 Recipients   │ ← NEW
│  📋 Templates    │ ← NEW
├──────────────────┤
│  ⚙️ Settings     │
│  🚪 Logout       │
└──────────────────┘
Customer Dashboard - Mobile Bottom Navigation ← NEW



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│   🏠        📦        ➕        💳        👤                                │
│  Home     Track      Ship    Invoices  Profile                              │
└─────────────────────────────────────────────────────────────────────────────┘
Admin Sidebar



Copy
┌──────────────────┐
│  [Logo] Admin    │
├──────────────────┤
│  📊 Dashboard    │
│  📦 Shipments    │
│  📅 Bookings     │
│  👥 Users        │
│  💳 Invoices     │
│  📋 Manifests    │
│  📈 Reports      │
│  📝 Activity     │ ← NEW
│  📧 Comms        │ ← NEW
├──────────────────┤
│  ⚙️ Settings     │
│  🚪 Logout       │
└──────────────────┘

7. Week 1: Foundation & Infrastructure
Focus: Project scaffolding, Dokploy setup, CI/CD, database schema, and backup infrastructure Estimated Hours: 40 hours Deliverables: Fully deployed skeleton application with database
7.1 Task Breakdown
#	Task	Est.	Priority	Dependencies	Acceptance Criteria
1.1	Initialize SvelteKit project with TypeScript	2h	Critical	—	npm run dev works, TypeScript strict mode enabled
1.2	Configure Tailwind CSS + PostCSS	1h	Critical	1.1	Tailwind classes work, purge configured
1.3	Install & configure shadcn-svelte components	2h	High	1.2	Button, Input, Card components imported
1.4	Set up project folder structure	1h	High	1.1	Matches planned architecture
1.5	Configure ESLint + Prettier + Husky	1h	Medium	1.1	Pre-commit hooks run lint
1.6	Set up axe-core for a11y testing	1h	High	1.1	A11y tests in CI
1.7	Create Dokploy project and applications	2h	Critical	—	Dashboard shows both apps
1.8	Configure PocketBase in Dokploy	2h	Critical	1.7	PocketBase admin UI accessible
1.9	Create all PocketBase collections	5h	Critical	1.8	All collections with correct fields
1.10	Configure PocketBase API rules	3h	Critical	1.9	Authorization works correctly
1.11	Set up PocketBase hooks (Go)	4h	High	1.9	Auto-assignment, tracking generation
1.12	SSH into server, install Litestream	2h	Critical	1.8	Litestream service running
1.13	Configure Backblaze B2 bucket	1h	Critical	1.12	Bucket created with proper permissions
1.14	Configure Litestream replication	2h	Critical	1.12, 1.13	Backups visible in B2
1.15	Connect GitHub repo to Dokploy	2h	High	1.7	Repo connected, branch configured
1.16	Configure GitHub Actions with Dokploy API	3h	High	1.15	Push to main triggers deployment
1.17	Set up domain & SSL in Dokploy	2h	High	1.7	All domains with valid SSL
1.18	Create design system (colors, typography)	2h	Medium	1.2	Design tokens defined
1.19	Build core reusable UI components	3h	Medium	1.3, 1.18	All base components ready
7.2 Project Folder Structure



Copy
qcs-cargo-v2/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn-svelte components
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── input/
│   │   │   │   ├── dialog/
│   │   │   │   ├── alert/
│   │   │   │   ├── toast/
│   │   │   │   └── ...
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── Header.svelte
│   │   │   │   ├── Footer.svelte
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   ├── MobileNav.svelte
│   │   │   │   ├── MobileBottomNav.svelte  ← NEW
│   │   │   │   ├── SkipLink.svelte         ← NEW
│   │   │   │   └── OfflineIndicator.svelte ← NEW
│   │   │   ├── forms/              # Form components
│   │   │   │   ├── ShippingCalculator.svelte
│   │   │   │   ├── ContactForm.svelte
│   │   │   │   ├── RecipientForm.svelte    ← NEW
│   │   │   │   ├── ProhibitedChecker.svelte← NEW
│   │   │   │   ├── FormAutoSave.svelte     ← NEW
│   │   │   │   └── BookingWizard/
│   │   │   │       ├── index.svelte
│   │   │   │       ├── StepService.svelte
│   │   │   │       ├── StepPackages.svelte ← ENHANCED
│   │   │   │       ├── StepRecipient.svelte← NEW
│   │   │   │       ├── StepSchedule.svelte
│   │   │   │       └── StepReview.svelte
│   │   │   ├── dashboard/          # Dashboard widgets
│   │   │   │   ├── MailboxCard.svelte
│   │   │   │   ├── ShipmentCard.svelte
│   │   │   │   ├── StatsWidget.svelte
│   │   │   │   ├── IncompleteDraftBanner.svelte ← NEW
│   │   │   │   └── DeliveryETA.svelte           ← NEW
│   │   │   ├── tracking/           # Tracking components
│   │   │   │   ├── Timeline.svelte
│   │   │   │   ├── StatusBadge.svelte
│   │   │   │   └── ShareTracking.svelte    ← NEW
│   │   │   ├── warehouse/          # Warehouse components
│   │   │   │   ├── Scanner.svelte          ← ENHANCED
│   │   │   │   ├── PackagePhotos.svelte    ← NEW
│   │   │   │   ├── ExceptionReport.svelte  ← NEW
│   │   │   │   └── WeightDiscrepancy.svelte← NEW
│   │   │   ├── admin/              # Admin components
│   │   │   │   ├── CommandPalette.svelte
│   │   │   │   ├── StatsCard.svelte
│   │   │   │   ├── CommunicationLog.svelte ← NEW
│   │   │   │   └── AuditTrail.svelte       ← NEW
│   │   │   └── shared/             # Shared components
│   │   │       ├── LoadingSpinner.svelte
│   │   │       ├── LoadingState.svelte     ← NEW (with message)
│   │   │       ├── EmptyState.svelte
│   │   │       ├── ErrorBoundary.svelte
│   │   │       ├── ConfirmDialog.svelte    ← NEW
│   │   │       ├── Pagination.svelte
│   │   │       ├── ResponsiveTable.svelte  ← NEW
│   │   │       └── HelperText.svelte       ← NEW
│   │   ├── server/                 # Server-only code
│   │   │   ├── pocketbase.ts
│   │   │   ├── stripe.ts
│   │   │   ├── email.ts
│   │   │   ├── pdf.ts              ← ENHANCED (invoices)
│   │   │   └── audit.ts            ← NEW
│   │   ├── stores/                 # Svelte stores
│   │   │   ├── auth.ts
│   │   │   ├── booking.ts          ← ENHANCED
│   │   │   ├── toast.ts
│   │   │   ├── offline.ts          ← NEW
│   │   │   └── a11y.ts             ← NEW
│   │   ├── services/               # Client services
│   │   │   ├── offlineScanner.ts
│   │   │   └── formPersistence.ts  ← NEW
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   ├── pricing.ts
│   │   │   ├── tracking.ts
│   │   │   ├── eta.ts              ← NEW
│   │   │   ├── prohibited.ts       ← NEW
│   │   │   └── focus.ts            ← NEW
│   │   ├── types/
│   │   │   ├── pocketbase.d.ts
│   │   │   ├── shipment.ts
│   │   │   ├── booking.ts
│   │   │   ├── recipient.ts        ← NEW
│   │   │   └── package.ts          ← NEW
│   │   └── config/
│   │       ├── destinations.ts
│   │       ├── services.ts
│   │       ├── prohibited.ts       ← NEW
│   │       └── constants.ts
│   ├── routes/
│   │   └── [... see sitemap above]
│   ├── app.html
│   ├── app.css
│   └── hooks.server.ts
├── static/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sounds/                     ← NEW
│   │   ├── scan-success.mp3
│   │   └── scan-error.mp3
│   └── images/
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── a11y/                       ← NEW
├── pocketbase/
│   ├── pb_hooks/
│   │   └── main.pb.go
│   └── pb_migrations/
├── Dockerfile
├── docker-compose.yml
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── package.json
7.3 Week 1 Acceptance Criteria
Criteria	Status
SvelteKit app runs locally with hot reload	☐
Dokploy dashboard accessible	☐
PocketBase running with persistent volume	☐
All collections created with correct fields	☐
API rules prevent unauthorized access	☐
Litestream backing up to B2	☐
GitHub push triggers deployment	☐
SSL certificates active for all domains	☐
Health check endpoint returns 200	☐
axe-core integrated in test suite	☐
Skip link component created	☐
8. Week 2: Authentication & User System
Focus: Complete authentication flows, profile management, security features, and GDPR compliance Estimated Hours: 40 hours Deliverables: Fully functional auth system with all security features
8.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
2.1	Create auth layout (centered card)	1h	High	1.19
2.2	Build login page with email/password	3h	Critical	2.1
2.3	Build registration page	3h	Critical	2.1
2.4	Implement Zod validation schemas	2h	Critical	2.2
2.5	Add Google OAuth integration	3h	High	2.2
2.6	Build Magic Link flow	3h	High	2.2
2.7	Create email verification flow	2h	Critical	2.3
2.8	Build forgot password page	2h	High	2.1
2.9	Build password reset page	2h	High	2.8
2.10	Create auth store (Svelte)	2h	Critical	2.2
2.11	Implement session persistence	2h	Critical	2.10
2.12	Build profile page	3h	High	2.10
2.13	Add avatar upload functionality	2h	Medium	2.12
2.14	Build password change UI	2h	High	2.12
2.15	Create sessions management page	3h	High	2.10
2.16	Build account deletion flow (GDPR)	3h	Critical	2.12
2.17	Create notification preferences UI	2h	High	2.12
2.18	Set up Resend email templates	3h	Critical	—
2.19	Implement rate limiting middleware	2h	Critical	2.2
8.2 Account Deletion Flow (GDPR Compliance) ← NEW
svelte


Copy
<!-- src/routes/dashboard/settings/delete-account/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { AlertTriangle } from 'lucide-svelte';
  import ConfirmDialog from '$lib/components/shared/ConfirmDialog.svelte';
  import { toast } from '$lib/stores/toast';

  let confirmText = '';
  let password = '';
  let showConfirm = false;
  let deleting = false;
  
  const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';
  
  $: canDelete = confirmText === CONFIRM_PHRASE && password.length >= 8;

  async function initiateDelete() {
    if (!canDelete) return;
    showConfirm = true;
  }

  async function confirmDelete() {
    deleting = true;
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
      }

      // Account marked for deletion
      await auth.logout();
      
      toast.success('Account scheduled for deletion. You have 30 days to recover it.');
      goto('/');
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      deleting = false;
      showConfirm = false;
    }
  }
</script>

<svelte:head>
  <title>Delete Account | QCS Cargo</title>
</svelte:head>

<div class="max-w-xl mx-auto">
  <Card class="p-6">
    <div class="flex items-start gap-4 mb-6">
      <div class="p-3 bg-red-100 rounded-full">
        <AlertTriangle class="w-6 h-6 text-red-600" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Delete Your Account</h1>
        <p class="text-gray-500 mt-1">
          This action is permanent and cannot be fully undone.
        </p>
      </div>
    </div>

    <div class="space-y-4 mb-6">
      <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 class="font-medium text-amber-900 mb-2">What happens when you delete:</h3>
        <ul class="text-sm text-amber-800 space-y-1">
          <li>• Your account will be deactivated immediately</li>
          <li>• You have <strong>30 days</strong> to recover your account by logging in</li>
          <li>• After 30 days, all personal data will be permanently deleted</li>
          <li>• Shipment history will be anonymized for business records</li>
          <li>• Your mailbox suite code will be released</li>
        </ul>
      </div>

      <div class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-medium text-gray-900 mb-2">Before you go:</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Download any invoices you need from your <a href="/dashboard/invoices" class="text-blue-600 underline">invoice history</a></li>
          <li>• Ensure all active shipments are delivered</li>
          <li>• Consider contacting us if there's an issue we can help with</li>
        </ul>
      </div>
    </div>

    <form on:submit|preventDefault={initiateDelete} class="space-y-4">
      <div>
        <label for="confirm" class="block text-sm font-medium text-gray-700 mb-1">
          Type <strong>{CONFIRM_PHRASE}</strong> to confirm:
        </label>
        <Input
          id="confirm"
          bind:value={confirmText}
          placeholder={CONFIRM_PHRASE}
          class="font-mono"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Enter your password:
        </label>
        <Input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Your current password"
        />
      </div>

      <div class="flex gap-3 pt-4">
        <Button variant="outline" href="/dashboard/settings" class="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="destructive" 
          disabled={!canDelete || deleting}
          class="flex-1"
        >
          {deleting ? 'Processing...' : 'Delete My Account'}
        </Button>
      </div>
    </form>
  </Card>
</div>

<ConfirmDialog
  bind:open={showConfirm}
  title="Final Confirmation"
  description="Are you absolutely sure? This will immediately deactivate your account."
  confirmText="Yes, Delete Account"
  confirmVariant="destructive"
  on:confirm={confirmDelete}
/>
8.3 Sessions Management ← NEW
svelte


Copy
<!-- src/routes/dashboard/settings/sessions/+page.svelte -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Monitor, Smartphone, Globe, Trash2, Shield } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';
  import { formatRelative } from '$lib/utils/format';

  export let data;
  
  $: sessions = data.sessions;
  $: currentSessionId = data.currentSessionId;

  async function revokeSession(sessionId: string) {
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      sessions = sessions.filter(s => s.id !== sessionId);
      toast.success('Session revoked');
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  }

  async function revokeAllOther() {
    try {
      await fetch('/api/sessions/revoke-others', { method: 'POST' });
      sessions = sessions.filter(s => s.id === currentSessionId);
      toast.success('All other sessions revoked');
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
  }

  function getDeviceIcon(device: string) {
    if (device.includes('Mobile') || device.includes('iPhone') || device.includes('Android')) {
      return Smartphone;
    }
    return Monitor;
  }
</script>

<svelte:head>
  <title>Active Sessions | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Active Sessions</h1>
      <p class="text-gray-500">Manage devices where you're logged in</p>
    </div>
    
    {#if sessions.length > 1}
      <Button variant="outline" on:click={revokeAllOther}>
        <Shield class="w-4 h-4 mr-2" />
        Log Out All Other Devices
      </Button>
    {/if}
  </div>

  <Card>
    <div class="divide-y">
      {#each sessions as session}
        {@const Icon = getDeviceIcon(session.device_info)}
        <div class="p-4 flex items-center gap-4">
          <div class="p-2 bg-gray-100 rounded-lg">
            <Icon class="w-5 h-5 text-gray-600" />
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium text-gray-900 truncate">
                {session.device_info || 'Unknown Device'}
              </p>
              {#if session.id === currentSessionId}
                <span class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  Current
                </span>
              {/if}
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <Globe class="w-3 h-3" />
              <span>{session.ip_address}</span>
              <span>•</span>
              <span>Last active {formatRelative(session.last_active)}</span>
            </div>
          </div>

          {#if session.id !== currentSessionId}
            <Button
              variant="ghost"
              size="sm"
              on:click={() => revokeSession(session.id)}
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          {/if}
        </div>
      {/each}
    </div>
  </Card>

  <Card class="p-4 bg-blue-50 border-blue-200">
    <h3 class="font-medium text-blue-900 mb-1">Security Tips</h3>
    <ul class="text-sm text-blue-800 space-y-1">
      <li>• Log out of devices you don't recognize</li>
      <li>• Use "Log Out All Other Devices" if you suspect unauthorized access</li>
      <li>• Consider changing your password if you see suspicious activity</li>
    </ul>
  </Card>
</div>
8.4 Notification Preferences ← ENHANCED
svelte


Copy
<!-- src/routes/dashboard/settings/notifications/+page.svelte -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { toast } from '$lib/stores/toast';

  export let data;
  
  let prefs = { ...data.preferences };
  let saving = false;

  const statusOptions = [
    { key: 'notify_received', label: 'Package received at warehouse', description: 'When we receive your package' },
    { key: 'notify_processing', label: 'Processing started', description: 'When packaging/consolidation begins' },
    { key: 'notify_transit', label: 'In transit', description: 'When shipment departs for destination' },
    { key: 'notify_customs', label: 'Customs clearance', description: 'Updates during customs process' },
    { key: 'notify_delivery', label: 'Out for delivery', description: 'When package is being delivered' },
    { key: 'notify_delivered', label: 'Delivered', description: 'Confirmation of successful delivery' },
  ];

  async function savePreferences() {
    saving = true;
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      toast.success('Preferences saved');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Notification Preferences | QCS Cargo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
  <div>
    <h1 class="text-2xl font-bold">Notification Preferences</h1>
    <p class="text-gray-500">Choose what updates you want to receive</p>
  </div>

  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4">Notification Channels</h2>
    
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">Email Notifications</p>
          <p class="text-sm text-gray-500">Receive updates via email</p>
        </div>
        <Switch bind:checked={prefs.notification_email} />
      </div>

      <div class="flex items-center justify-between opacity-60">
        <div>
          <p class="font-medium">SMS Notifications</p>
          <p class="text-sm text-gray-500">Coming soon</p>
        </div>
        <Switch disabled />
      </div>

      <div class="flex items-center justify-between opacity-60">
        <div>
          <p class="font-medium">WhatsApp Notifications</p>
          <p class="text-sm text-gray-500">Coming soon</p>
        </div>
        <Switch disabled />
      </div>
    </div>
  </Card>

  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4">Shipment Status Updates</h2>
    <p class="text-sm text-gray-500 mb-4">
      Select which status changes you want to be notified about:
    </p>
    
    <div class="space-y-4">
      {#each statusOptions as option}
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">{option.label}</p>
            <p class="text-sm text-gray-500">{option.description}</p>
          </div>
          <Switch bind:checked={prefs[option.key]} />
        </div>
      {/each}
    </div>
  </Card>

  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4">Marketing & Updates</h2>
    
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">Promotional Offers</p>
          <p class="text-sm text-gray-500">Discounts and special deals</p>
        </div>
        <Switch bind:checked={prefs.marketing_email} />
      </div>

      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">Service Updates</p>
          <p class="text-sm text-gray-500">Important changes to our services</p>
        </div>
        <Switch bind:checked={prefs.service_updates} />
      </div>
    </div>
  </Card>

  <div class="flex justify-end">
    <Button on:click={savePreferences} disabled={saving}>
      {saving ? 'Saving...' : 'Save Preferences'}
    </Button>
  </div>
</div>
8.5 Week 2 Acceptance Criteria
Criteria	Status
User can register with email/password	☐
User receives verification email	☐
User can log in after verification	☐
Google OAuth creates/links account	☐
Password reset flow completes	☐
Session persists across browser refresh	☐
Profile updates save correctly	☐
Avatar upload works with preview	☐
Password change from profile works	☐
Sessions management shows all devices	☐
Session revocation works	☐
Account deletion flow works with 30-day recovery	☐
Notification preferences save correctly	☐
Rate limiting blocks after 5 failed logins	☐
All forms have visible focus indicators	☐
9. Week 3: Public Tools & Marketing Pages
Focus: Shipping calculator, public tracking, prohibited items checker, and SEO Estimated Hours: 40 hours Deliverables: All public-facing pages with SEO optimization
9.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
3.1	Build landing page hero section	3h	Critical	1.19
3.2	Create trust signals section	2h	High	3.1
3.3	Build services overview section	2h	High	3.1
3.4	Create process steps section	2h	High	3.1
3.5	Build destinations section	2h	High	3.1
3.6	Add testimonials section	2h	Medium	3.1
3.7	Build shipping calculator component	4h	Critical	1.19
3.8	Implement rate calculation logic	3h	Critical	3.7
3.9	Add air/sea comparison display	2h	High	3.8
3.10	Build prohibited items checker	3h	High	—
3.11	Create prohibited items page	2h	High	3.10
3.12	Build public tracking page	3h	Critical	1.19
3.13	Create tracking timeline component	2h	High	3.12
3.14	Add estimated delivery date display	2h	High	3.13
3.15	Create shareable tracking link	2h	Medium	3.12
3.16	Build services detail page	2h	High	—
3.17	Build contact page with form	2h	High	—
3.18	Build FAQ page with search	2h	Medium	—
3.19	Implement SEO meta tags	2h	High	All pages
3.20	Generate sitemap.xml	1h	High	3.19
3.21	Add structured data (JSON-LD)	2h	High	3.19
9.2 Prohibited Items Checker ← NEW
typescript


Copy
// src/lib/config/prohibited.ts

export interface ProhibitedItem {
  name: string;
  category: 'prohibited' | 'restricted';
  keywords: string[];
  reason: string;
  note?: string;
}

export const PROHIBITED_ITEMS: ProhibitedItem[] = [
  // Absolutely Prohibited
  {
    name: 'Explosives & Ammunition',
    category: 'prohibited',
    keywords: ['explosive', 'ammunition', 'ammo', 'bullet', 'gunpowder', 'firework', 'firecracker'],
    reason: 'Dangerous goods prohibited by aviation law'
  },
  {
    name: 'Illegal Drugs',
    category: 'prohibited',
    keywords: ['drug', 'narcotic', 'marijuana', 'cocaine', 'heroin', 'cannabis', 'weed'],
    reason: 'Illegal substances'
  },
  {
    name: 'Flammable Liquids',
    category: 'prohibited',
    keywords: ['gasoline', 'petrol', 'lighter fluid', 'acetone', 'paint thinner', 'alcohol 90%'],
    reason: 'Fire hazard during air transport'
  },
  {
    name: 'Live Animals',
    category: 'prohibited',
    keywords: ['live animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'reptile'],
    reason: 'Requires special handling not available'
  },
  {
    name: 'Currency',
    category: 'prohibited',
    keywords: ['cash', 'money', 'currency', 'banknote', 'bearer bond'],
    reason: 'Financial regulations'
  },
  
  // Restricted Items
  {
    name: 'Lithium Batteries',
    category: 'restricted',
    keywords: ['lithium', 'battery', 'powerbank', 'power bank'],
    reason: 'Must be installed in device',
    note: 'Loose lithium batteries are prohibited. Batteries must be installed in the device. Max 2 devices with batteries per package.'
  },
  {
    name: 'Perfumes & Fragrances',
    category: 'restricted',
    keywords: ['perfume', 'cologne', 'fragrance', 'eau de'],
    reason: 'Flammable contents',
    note: 'Limited to 500ml total per package. Must be in original sealed packaging.'
  },
  {
    name: 'Medications',
    category: 'restricted',
    keywords: ['medicine', 'medication', 'prescription', 'pill', 'pharmaceutical', 'drug'],
    reason: 'Customs regulations',
    note: 'Must include copy of prescription. Over-the-counter medications allowed in reasonable quantities.'
  },
  {
    name: 'Alcohol',
    category: 'restricted',
    keywords: ['alcohol', 'wine', 'beer', 'liquor', 'rum', 'vodka', 'whiskey'],
    reason: 'Varies by destination',
    note: 'Check destination country regulations. May require import permit.'
  },
  {
    name: 'Electronics over $500',
    category: 'restricted',
    keywords: ['laptop', 'macbook', 'iphone', 'samsung', 'computer', 'tablet', 'ipad'],
    reason: 'Customs declaration required',
    note: 'Must declare accurate value for customs. Insurance recommended.'
  },
  {
    name: 'Food Items',
    category: 'restricted',
    keywords: ['food', 'perishable', 'meat', 'cheese', 'fruit', 'vegetable'],
    reason: 'Agricultural restrictions',
    note: 'Non-perishable, commercially packaged foods generally allowed. Fresh produce may be restricted.'
  }
];

export function checkProhibitedItem(query: string): {
  found: boolean;
  item?: ProhibitedItem;
  status: 'allowed' | 'restricted' | 'prohibited';
} {
  const normalizedQuery = query.toLowerCase().trim();
  
  for (const item of PROHIBITED_ITEMS) {
    for (const keyword of item.keywords) {
      if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
        return {
          found: true,
          item,
          status: item.category
        };
      }
    }
  }
  
  return {
    found: false,
    status: 'allowed'
  };
}
svelte


Copy
<!-- src/lib/components/forms/ProhibitedChecker.svelte -->
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
  import { Search, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-svelte';
  import { checkProhibitedItem } from '$lib/config/prohibited';

  let query = '';
  let result: ReturnType<typeof checkProhibitedItem> | null = null;

  function handleCheck() {
    if (query.trim().length < 2) {
      result = null;
      return;
    }
    result = checkProhibitedItem(query);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCheck();
    }
  }
</script>

<div class="space-y-4">
  <div class="flex gap-2">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        bind:value={query}
        on:keydown={handleKeydown}
        placeholder="e.g., batteries, perfume, laptop"
        class="pl-10"
      />
    </div>
    <Button on:click={handleCheck}>Check</Button>
  </div>

  {#if result}
    {#if result.status === 'allowed'}
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="w-4 h-4 text-green-600" />
        <AlertTitle class="text-green-800">Can Be Shipped</AlertTitle>
        <AlertDescription class="text-green-700">
          "{query}" can generally be shipped. Standard packaging guidelines apply.
        </AlertDescription>
      </Alert>
    {:else if result.status === 'restricted'}
      <Alert class="bg-amber-50 border-amber-200">
        <AlertTriangle class="w-4 h-4 text-amber-600" />
        <AlertTitle class="text-amber-800">Restrictions Apply</AlertTitle>
        <AlertDescription class="text-amber-700">
          <p class="mb-2"><strong>{result.item?.name}</strong>: {result.item?.reason}</p>
          {#if result.item?.note}
            <p class="text-sm">{result.item.note}</p>
          {/if}
        </AlertDescription>
      </Alert>
    {:else}
      <Alert class="bg-red-50 border-red-200">
        <XCircle class="w-4 h-4 text-red-600" />
        <AlertTitle class="text-red-800">Cannot Be Shipped</AlertTitle>
        <AlertDescription class="text-red-700">
          <p><strong>{result.item?.name}</strong> cannot be shipped via air freight.</p>
          <p class="text-sm mt-1">Reason: {result.item?.reason}</p>
        </AlertDescription>
      </Alert>
    {/if}
  {:else}
    <div class="p-4 bg-gray-50 rounded-lg">
      <div class="flex items-start gap-2 text-gray-600">
        <Info class="w-4 h-4 mt-0.5" />
        <p class="text-sm">
          Enter an item to check if it can be shipped. See our full 
          <a href="/prohibited-items" class="text-blue-600 underline">prohibited items list</a>.
        </p>
      </div>
    </div>
  {/if}
</div>
9.3 Estimated Delivery Date ← NEW
typescript


Copy
// src/lib/utils/eta.ts

import { PRICING_CONFIG } from './pricing';

interface ETAResult {
  earliestDate: Date;
  latestDate: Date;
  businessDays: { min: number; max: number };
  formatted: string;
}

export function calculateETA(
  destination: string,
  serviceType: 'standard' | 'express',
  departureDate?: Date
): ETAResult {
  const transitDays = serviceType === 'express'
    ? { min: 1, max: 2 }
    : getTransitDays(destination);

  // Default departure is next business day if not specified
  const baseDate = departureDate || getNextBusinessDay(new Date());

  const earliestDate = addBusinessDays(baseDate, transitDays.min);
  const latestDate = addBusinessDays(baseDate, transitDays.max);

  return {
    earliestDate,
    latestDate,
    businessDays: transitDays,
    formatted: formatETARange(earliestDate, latestDate)
  };
}

function getTransitDays(destination: string): { min: number; max: number } {
  const transitMap: Record<string, { min: number; max: number }> = {
    guyana: { min: 3, max: 4 },
    jamaica: { min: 3, max: 4 },
    trinidad: { min: 3, max: 5 },
    barbados: { min: 4, max: 5 },
    suriname: { min: 4, max: 5 }
  };
  return transitMap[destination] || { min: 4, max: 6 };
}

function getNextBusinessDay(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      addedDays++;
    }
  }
  
  return result;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatETARange(earliest: Date, latest: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  
  if (earliest.getTime() === latest.getTime()) {
    return earliest.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  }
  
  const sameMonth = earliest.getMonth() === latest.getMonth();
  const sameYear = earliest.getFullYear() === latest.getFullYear();
  
  if (sameMonth && sameYear) {
    return `${earliest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${latest.getDate()}, ${latest.getFullYear()}`;
  }
  
  return `${earliest.toLocaleDateString('en-US', options)} - ${latest.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
}
svelte


Copy
<!-- src/lib/components/tracking/DeliveryETA.svelte -->
<script lang="ts">
  import { Calendar, Clock } from 'lucide-svelte';
  import { calculateETA } from '$lib/utils/eta';

  export let destination: string;
  export let serviceType: 'standard' | 'express' = 'standard';
  export let departureDate: Date | undefined = undefined;
  export let status: string;

  $: eta = calculateETA(destination, serviceType, departureDate);
  $: isDelivered = status === 'delivered';
  $: isPastETA = new Date() > eta.latestDate && !isDelivered;
</script>

<div class="p-4 rounded-lg {isPastETA ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}">
  <div class="flex items-center gap-2 mb-2">
    <Calendar class="w-4 h-4 {isPastETA ? 'text-amber-600' : 'text-blue-600'}" />
    <span class="font-medium {isPastETA ? 'text-amber-900' : 'text-blue-900'}">
      {isDelivered ? 'Delivered' : 'Estimated Delivery'}
    </span>
  </div>
  
  {#if isDelivered}
    <p class="text-green-700 font-medium">Package delivered successfully!</p>
  {:else}
    <p class="text-lg font-semibold {isPastETA ? 'text-amber-800' : 'text-blue-800'}">
      {eta.formatted}
    </p>
    <p class="text-sm {isPastETA ? 'text-amber-600' : 'text-blue-600'} mt-1">
      {eta.businessDays.min}-{eta.businessDays.max} business days
      {#if serviceType === 'express'}
        <span class="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">Express</span>
      {/if}
    </p>
    
    {#if isPastETA}
      <p class="text-sm text-amber-700 mt-2">
        ⚠️ Delivery may be delayed. <a href="/contact" class="underline">Contact support</a> for updates.
      </p>
    {/if}
  {/if}
</div>
9.4 Week 3 Acceptance Criteria
Criteria	Status
Landing page loads in < 1.5s (LCP)	☐
Shipping calculator returns accurate rates	☐
Air/Sea comparison displays correctly	☐
"I don't know" weight option works	☐
Prohibited items checker works accurately	☐
Prohibited items page lists all categories	☐
Public tracking shows correct status timeline	☐
Estimated delivery date displays on tracking	☐
Shareable tracking link works with OG preview	☐
FAQ search filters results	☐
All pages have unique meta titles	☐
Sitemap.xml generates correctly	☐
Structured data validates	☐
Contact form submits and sends email	☐
All pages pass axe accessibility check	☐
10. Week 4: Customer Dashboard
Focus: Dashboard widgets, shipment list, invoice management, recipients, and templates Estimated Hours: 40 hours Deliverables: Complete customer dashboard with all core features
10.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
4.1	Create dashboard layout with sidebar	3h	Critical	2.11
4.2	Build mobile bottom navigation	2h	High	4.1
4.3	Create dashboard home page	2h	High	4.1
4.4	Build mailbox widget with copy-to-clipboard	2h	High	4.3
4.5	Create incomplete draft banner	1h	Medium	4.3
4.6	Create active shipments carousel	3h	High	4.3
4.7	Build quick actions widget	2h	Medium	4.3
4.8	Create shipments list page	3h	Critical	4.1
4.9	Build responsive table/card component	3h	High	4.8
4.10	Add shipment filtering and sorting	2h	High	4.8
4.11	Build shipment detail page	3h	Critical	4.8
4.12	Build invoices list page	2h	High	4.1
4.13	Create invoice PDF download	3h	High	4.12
4.14	Build bookings list page	2h	High	4.1
4.15	Create recipients management page	3h	High	4.1
4.16	Build recipient form component	2h	High	4.15
4.17	Create templates management page	2h	Medium	4.1
4.18	Create loading skeletons for all data	2h	Medium	All
4.19	Build empty states for all lists	2h	Medium	All
10.2 Mobile Bottom Navigation ← NEW
svelte


Copy
<!-- src/lib/components/layout/MobileBottomNav.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { Home, Package, PlusCircle, Receipt, User } from 'lucide-svelte';

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home', exact: true },
    { href: '/dashboard/shipments', icon: Package, label: 'Track' },
    { href: '/dashboard/bookings/new', icon: PlusCircle, label: 'Ship', highlight: true },
    { href: '/dashboard/invoices', icon: Receipt, label: 'Invoices' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  function isActive(href: string, exact: boolean = false) {
    if (exact) {
      return $page.url.pathname === href;
    }
    return $page.url.pathname.startsWith(href);
  }
</script>

<nav 
  class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40"
  role="navigation"
  aria-label="Main navigation"
>
  <div class="flex justify-around items-center h-16 px-2 safe-area-pb">
    {#each navItems as item}
      {@const active = isActive(item.href, item.exact)}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center flex-1 py-2 min-w-0
               {active ? 'text-blue-600' : 'text-gray-500'}
               {item.highlight ? '' : ''}"
        aria-current={active ? 'page' : undefined}
      >
        {#if item.highlight}
          <div class="w-12 h-12 -mt-4 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <item.icon class="w-6 h-6 text-white" />
          </div>
        {:else}
          <item.icon class="w-5 h-5" />
        {/if}
        <span class="text-xs mt-1 truncate {item.highlight ? 'text-blue-600 font-medium' : ''}">
          {item.label}
        </span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
</style>
10.3 Recipients Management ← NEW
svelte


Copy
<!-- src/routes/dashboard/recipients/+page.svelte -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { 
    Plus, 
    Search, 
    MapPin, 
    Phone, 
    Star, 
    MoreVertical,
    Pencil,
    Trash2
  } from 'lucide-svelte';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '$lib/components/ui/dropdown-menu';
  import { DESTINATION_LABELS } from '$lib/utils/pricing';
  import ConfirmDialog from '$lib/components/shared/ConfirmDialog.svelte';
  import EmptyState from '$lib/components/shared/EmptyState.svelte';
  import { toast } from '$lib/stores/toast';

  export let data;
  
  let searchQuery = '';
  let deleteTarget: any = null;
  
  $: recipients = data.recipients;
  $: filteredRecipients = recipients.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function setDefault(recipientId: string) {
    try {
      await fetch(`/api/recipients/${recipientId}/default`, { method: 'POST' });
      recipients = recipients.map(r => ({
        ...r,
        is_default: r.id === recipientId
      }));
      toast.success('Default recipient updated');
    } catch (err) {
      toast.error('Failed to update default');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    
    try {
      await fetch(`/api/recipients/${deleteTarget.id}`, { method: 'DELETE' });
      recipients = recipients.filter(r => r.id !== deleteTarget.id);
      toast.success('Recipient deleted');
    } catch (err) {
      toast.error('Failed to delete recipient');
    } finally {
      deleteTarget = null;
    }
  }
</script>

<svelte:head>
  <title>My Recipients | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row gap-4 justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Recipients</h1>
      <p class="text-gray-500">Save recipient details for faster booking</p>
    </div>
    <Button href="/dashboard/recipients/new">
      <Plus class="w-4 h-4 mr-2" />
      Add Recipient
    </Button>
  </div>

  <!-- Search -->
  {#if recipients.length > 0}
    <div class="relative max-w-md">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        bind:value={searchQuery}
        placeholder="Search recipients..."
        class="pl-10"
      />
    </div>
  {/if}

  <!-- Recipients Grid -->
  {#if filteredRecipients.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredRecipients as recipient}
        <Card class="p-4 relative {recipient.is_default ? 'ring-2 ring-blue-500' : ''}">
          {#if recipient.is_default}
            <div class="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
              <Star class="w-3 h-3" />
              Default
            </div>
          {/if}

          <div class="flex justify-between items-start mb-3">
            <h3 class="font-semibold text-gray-900">{recipient.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild let:builder>
                <Button variant="ghost" size="sm" builders={[builder]}>
                  <MoreVertical class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem href="/dashboard/recipients/{recipient.id}">
                  <Pencil class="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {#if !recipient.is_default}
                  <DropdownMenuItem on:click={() => setDefault(recipient.id)}>
                    <Star class="w-4 h-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                {/if}
                <DropdownMenuItem 
                  class="text-red-600" 
                  on:click={() => deleteTarget = recipient}
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-start gap-2">
              <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{recipient.address_line1}</p>
                {#if recipient.address_line2}
                  <p>{recipient.address_line2}</p>
                {/if}
                <p>{recipient.city}, {DESTINATION_LABELS[recipient.destination]}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4" />
              <span>{recipient.phone}</span>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t">
            <span class="text-xs text-gray-400">
              Used {recipient.usage_count || 0} times
            </span>
          </div>
        </Card>
      {/each}
    </div>
  {:else if recipients.length === 0}
    <EmptyState
      icon={MapPin}
      title="No recipients yet"
      description="Save recipient details to speed up your bookings"
      actionLabel="Add First Recipient"
      actionHref="/dashboard/recipients/new"
    />
  {:else}
    <Card class="p-8 text-center">
      <p class="text-gray-500">No recipients match your search</p>
    </Card>
  {/if}
</div>

<ConfirmDialog
  bind:open={deleteTarget}
  title="Delete Recipient?"
  description="Are you sure you want to delete {deleteTarget?.name}? This cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDelete}
/>
10.4 Invoice PDF Generation ← NEW
typescript


Copy
// src/lib/server/pdf.ts
import PDFDocument from 'pdfkit';
import { PUBLIC_COMPANY_NAME, PUBLIC_COMPANY_ADDRESS, PUBLIC_COMPANY_PHONE } from '$env/static/public';

export async function generateInvoicePDF(invoice: any, user: any, shipment: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text(PUBLIC_COMPANY_NAME, 50, 50);
    doc.fontSize(10).font('Helvetica').text(PUBLIC_COMPANY_ADDRESS, 50, 80);
    doc.text(`Phone: ${PUBLIC_COMPANY_PHONE}`, 50, 95);

    // Invoice title
    doc.fontSize(28).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`#${invoice.invoice_number}`, 400, 85, { align: 'right' });
    doc.text(`Date: ${formatDate(invoice.created)}`, 400, 100, { align: 'right' });
    doc.text(`Due: ${formatDate(invoice.due_date)}`, 400, 115, { align: 'right' });

    // Status badge
    const statusColors = {
      paid: '#10B981',
      pending: '#F59E0B',
      overdue: '#EF4444'
    };
    doc.rect(450, 130, 60, 20).fill(statusColors[invoice.status] || '#6B7280');
    doc.fontSize(10).fill('#FFFFFF').text(invoice.status.toUpperCase(), 455, 135);

    // Bill to
    doc.fill('#000000');
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 160);
    doc.fontSize(10).font('Helvetica');
    doc.text(user.name, 50, 180);
    doc.text(user.email, 50, 195);
    if (user.address_line1) {
      doc.text(user.address_line1, 50, 210);
      doc.text(`${user.city}, ${user.state} ${user.zip}`, 50, 225);
    }

    // Shipment details
    if (shipment) {
      doc.fontSize(12).font('Helvetica-Bold').text('Shipment Details:', 300, 160);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Tracking: ${shipment.tracking_number}`, 300, 180);
      doc.text(`Destination: ${shipment.destination}`, 300, 195);
      doc.text(`Weight: ${shipment.billable_weight_lbs || shipment.weight_lbs} lbs`, 300, 210);
    }

    // Line items table
    const tableTop = 280;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Amount', 450, tableTop, { align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica');
    
    for (const item of invoice.line_items || []) {
      doc.text(item.description, 50, y);
      doc.text(`$${item.amount.toFixed(2)}`, 450, y, { align: 'right' });
      y += 20;
    }

    // Totals
    doc.moveTo(350, y + 10).lineTo(550, y + 10).stroke();
    y += 20;
    
    doc.font('Helvetica-Bold');
    doc.text('Total:', 350, y);
    doc.text(`$${invoice.amount_usd.toFixed(2)}`, 450, y, { align: 'right' });

    if (invoice.status === 'paid') {
      y += 25;
      doc.fontSize(12).fill('#10B981').text('PAID', 450, y, { align: 'right' });
      doc.fontSize(10).fill('#000000').text(`on ${formatDate(invoice.paid_at)}`, 450, y + 15, { align: 'right' });
    }

    // Footer
    doc.fontSize(9).fill('#6B7280');
    doc.text(
      'Thank you for choosing QCS Cargo for your shipping needs.',
      50,
      doc.page.height - 100,
      { align: 'center', width: 500 }
    );
    doc.text(
      'Questions? Contact us at sales@quietcraftsolutions.com',
      50,
      doc.page.height - 85,
      { align: 'center', width: 500 }
    );

    doc.end();
  });
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
10.5 Week 4 Acceptance Criteria
Criteria	Status
Dashboard loads within 2 seconds	☐
Mailbox address displays with copy button	☐
Unauthenticated users redirect to login	☐
Mobile bottom navigation works	☐
Incomplete draft banner shows when applicable	☐
Shipments list shows pagination	☐
Responsive table switches to cards on mobile	☐
Shipment detail shows full tracking timeline	☐
Invoices show correct payment status	☐
Invoice PDF downloads correctly	☐
Recipients can be added/edited/deleted	☐
Default recipient can be set	☐
Loading skeletons appear during data fetch	☐
Empty states show helpful messages	☐
All components are keyboard navigable	☐
11. Week 5: Booking System & Payments
Focus: Enhanced booking wizard with multi-package, recipient selection, and payment recovery Estimated Hours: 45 hours Deliverables: Complete booking flow with all enhancements
11.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
5.1	Create booking wizard container	2h	Critical	4.1
5.2	Build Step 1: Service Selection	3h	Critical	5.1
5.3	Build Step 2: Packages (multi-package)	5h	Critical	5.2
5.4	Add "I don't know" weight option	1h	High	5.3
5.5	Add prohibited items checker to package step	2h	High	5.3, 3.10
5.6	Build Step 3: Recipient Selection	4h	Critical	5.3
5.7	Add inline recipient creation	2h	High	5.6
5.8	Add customs document upload	3h	Critical	5.6
5.9	Build Step 4: Schedule Selection	3h	Critical	5.6
5.10	Create available time slots API	2h	Critical	5.9
5.11	Build Step 5: Review & Payment	4h	Critical	5.9
5.12	Implement Stripe Payment Element	4h	Critical	5.11
5.13	Handle 3D Secure authentication	2h	Critical	5.12
5.14	Create Stripe webhook handler	3h	Critical	5.12
5.15	Build payment failure recovery page	3h	Critical	5.14
5.16	Generate QR codes for each package	2h	High	5.14
5.17	Build booking confirmation page	2h	High	5.16
5.18	Send confirmation email	2h	High	5.17
5.19	Build booking modification flow	4h	High	5.1
5.20	Implement wizard state persistence	2h	High	5.1
11.2 Enhanced Booking Store (Multi-Package) ← ENHANCED
typescript


Copy
// src/lib/stores/booking.ts
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// ===========================================
// TYPES
// ===========================================

interface Package {
  id: string;
  weight: number | null;
  weightUnknown: boolean;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionsUnknown: boolean;
  declaredValue: number | null;
  contentsDescription: string;
  specialInstructions: string;
}

interface Recipient {
  id?: string; // If selecting saved recipient
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  destination: string;
  deliveryInstructions: string;
  saveForFuture: boolean;
}

interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  
  // Step 1: Service
  serviceType: 'standard' | 'express' | 'door_to_door' | 'consolidated' | null;
  
  // Step 2: Packages (multi-package support)
  packages: Package[];
  
  // Step 3: Recipient
  recipient: Recipient | null;
  customsDocuments: File[];
  
  // Step 4: Schedule
  scheduledDate: string | null;
  timeSlot: string | null;
  
  // Step 5: Review/Payment
  quote: {
    packages: Array<{
      id: string;
      weight: number;
      dimWeight: number;
      billableWeight: number;
      cost: number;
    }>;
    subtotal: number;
    multiPackageDiscount: number;
    insuranceCost: number;
    totalCost: number;
    transitDays: string;
  } | null;
  
  // Payment
  paymentIntentId: string | null;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | null;
  paymentError: string | null;
  
  // Template
  templateId: string | null;
  
  // Metadata
  lastUpdated: string;
}

const createEmptyPackage = (): Package => ({
  id: crypto.randomUUID(),
  weight: null,
  weightUnknown: false,
  length: null,
  width: null,
  height: null,
  dimensionsUnknown: false,
  declaredValue: null,
  contentsDescription: '',
  specialInstructions: ''
});

const initialState: BookingState = {
  step: 1,
  serviceType: null,
  packages: [createEmptyPackage()],
  recipient: null,
  customsDocuments: [],
  scheduledDate: null,
  timeSlot: null,
  quote: null,
  paymentIntentId: null,
  paymentStatus: null,
  paymentError: null,
  templateId: null,
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'qcs_booking_draft';

// ===========================================
// STORE
// ===========================================

function createBookingStore() {
  let storedState = initialState;
  
  if (browser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if draft is less than 24 hours old
        const lastUpdated = new Date(parsed.lastUpdated);
        const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 24) {
          storedState = { ...initialState, ...parsed };
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load booking state:', e);
    }
  }

  const { subscribe, set, update } = writable<BookingState>(storedState);

  // Persist to localStorage on changes
  if (browser) {
    subscribe((state) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...state,
          lastUpdated: new Date().toISOString()
        }));
      } catch (e) {
        console.error('Failed to save booking state:', e);
      }
    });
  }

  return {
    subscribe,

    // Navigation
    nextStep() {
      update((state) => ({
        ...state,
        step: Math.min(state.step + 1, 5) as 1 | 2 | 3 | 4 | 5
      }));
    },

    prevStep() {
      update((state) => ({
        ...state,
        step: Math.max(state.step - 1, 1) as 1 | 2 | 3 | 4 | 5
      }));
    },

    goToStep(step: 1 | 2 | 3 | 4 | 5) {
      update((state) => ({ ...state, step }));
    },

    // Step 1: Service
    setService(serviceType: BookingState['serviceType']) {
      update((state) => ({ ...state, serviceType }));
    },

    // Step 2: Packages
    addPackage() {
      update((state) => ({
        ...state,
        packages: [...state.packages, createEmptyPackage()]
      }));
    },

    removePackage(packageId: string) {
      update((state) => ({
        ...state,
        packages: state.packages.filter(p => p.id !== packageId)
      }));
    },

    updatePackage(packageId: string, data: Partial<Package>) {
      update((state) => ({
        ...state,
        packages: state.packages.map(p =>
          p.id === packageId ? { ...p, ...data } : p
        )
      }));
    },

    // Step 3: Recipient
    setRecipient(recipient: Recipient) {
      update((state) => ({ ...state, recipient }));
    },

    selectSavedRecipient(recipientId: string, recipientData: Recipient) {
      update((state) => ({
        ...state,
        recipient: { ...recipientData, id: recipientId }
      }));
    },

    addCustomsDocument(file: File) {
      update((state) => ({
        ...state,
        customsDocuments: [...state.customsDocuments, file]
      }));
    },

    removeCustomsDocument(index: number) {
      update((state) => ({
        ...state,
        customsDocuments: state.customsDocuments.filter((_, i) => i !== index)
      }));
    },

    // Step 4: Schedule
    setSchedule(scheduledDate: string, timeSlot: string) {
      update((state) => ({ ...state, scheduledDate, timeSlot }));
    },

    // Quote
    setQuote(quote: BookingState['quote']) {
      update((state) => ({ ...state, quote }));
    },

    // Payment
    setPaymentIntent(paymentIntentId: string) {
      update((state) => ({
        ...state,
        paymentIntentId,
        paymentStatus: 'pending',
        paymentError: null
      }));
    },

    setPaymentStatus(status: BookingState['paymentStatus'], error?: string) {
      update((state) => ({
        ...state,
        paymentStatus: status,
        paymentError: error || null
      }));
    },

    // Templates
    loadTemplate(template: any) {
      update((state) => ({
        ...state,
        templateId: template.id,
        serviceType: template.service_type,
        recipient: template.recipient ? {
          id: template.recipient.id,
          ...template.recipient
        } : null,
        packages: template.default_packages || [createEmptyPackage()]
      }));
    },

    // Reset
    reset() {
      set(initialState);
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    // Check if draft exists
    hasDraft(): boolean {
      const state = get({ subscribe });
      return state.step > 1 || state.serviceType !== null;
    },

    // Validation
    canProceedToStep(step: number): boolean {
      const state = get({ subscribe });
      
      switch (step) {
        case 2:
          return !!state.serviceType;
        case 3:
          return state.packages.length > 0 && state.packages.every(p =>
            (p.weight !== null && p.weight > 0) || p.weightUnknown
          );
        case 4:
          return state.recipient !== null && 
                 !!state.recipient.name &&
                 !!state.recipient.phone &&
                 !!state.recipient.addressLine1 &&
                 !!state.recipient.city;
        case 5:
          return !!state.scheduledDate && !!state.timeSlot;
        default:
          return true;
      }
    },

    // Calculate totals
    getPackageCount(): number {
      return get({ subscribe }).packages.length;
    }
  };
}

export const booking = createBookingStore();

// Derived stores
export const currentStep = derived(booking, $b => $b.step);
export const packageCount = derived(booking, $b => $b.packages.length);
export const hasMultiplePackages = derived(booking, $b => $b.packages.length > 1);
export const hasDraft = derived(booking, $b => $b.step > 1 || $b.serviceType !== null);
11.3 Package Step Component (Multi-Package) ← ENHANCED
svelte


Copy
<!-- src/lib/components/forms/BookingWizard/StepPackages.svelte -->
<script lang="ts">
  import { booking, packageCount, hasMultiplePackages } from '$lib/stores/booking';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import ProhibitedChecker from '$lib/components/forms/ProhibitedChecker.svelte';
  import HelperText from '$lib/components/shared/HelperText.svelte';
  import { 
    Plus, 
    Trash2, 
    Package, 
    Scale, 
    Ruler, 
    DollarSign,
    AlertTriangle,
    Info
  } from 'lucide-svelte';

  $: packages = $booking.packages;
  $: canAddMore = packages.length < 20;
  
  function addPackage() {
    booking.addPackage();
    // Focus the new package
    setTimeout(() => {
      const newPackage = document.querySelector(`[data-package="${packages.length}"]`);
      newPackage?.querySelector('input')?.focus();
    }, 100);
  }

  function removePackage(id: string) {
    if (packages.length === 1) return;
    booking.removePackage(id);
  }

  function updatePackage(id: string, field: string, value: any) {
    booking.updatePackage(id, { [field]: value });
  }

  function toggleWeightUnknown(pkg: any) {
    booking.updatePackage(pkg.id, { 
      weightUnknown: !pkg.weightUnknown,
      weight: null 
    });
  }

  function toggleDimensionsUnknown(pkg: any) {
    booking.updatePackage(pkg.id, { 
      dimensionsUnknown: !pkg.dimensionsUnknown,
      length: null,
      width: null,
      height: null
    });
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Package Details</h2>
      <p class="text-gray-500">
        {$packageCount === 1 ? 'Enter your package information' : `${$packageCount} packages in this booking`}
      </p>
    </div>
    
    {#if canAddMore}
      <Button variant="outline" on:click={addPackage}>
        <Plus class="w-4 h-4 mr-2" />
        Add Package
      </Button>
    {/if}
  </div>

  {#if $hasMultiplePackages}
    <Alert>
      <Info class="w-4 h-4" />
      <AlertDescription>
        Booking multiple packages together saves time and may qualify for a multi-package discount!
      </AlertDescription>
    </Alert>
  {/if}

  <!-- Package Cards -->
  <div class="space-y-6">
    {#each packages as pkg, index (pkg.id)}
      <Card class="p-6" data-package={index}>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package class="w-4 h-4 text-blue-600" />
            </div>
            <h3 class="font-medium">Package {index + 1}</h3>
          </div>
          
          {#if packages.length > 1}
            <Button 
              variant="ghost" 
              size="sm"
              on:click={() => removePackage(pkg.id)}
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          {/if}
        </div>

        <div class="grid gap-6">
          <!-- Weight -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="flex items-center gap-2">
                <Scale class="w-4 h-4 text-gray-400" />
                Weight (lbs)
              </Label>
              <label class="flex items-center gap-2 text-sm">
                <Checkbox 
                  checked={pkg.weightUnknown} 
                  onCheckedChange={() => toggleWeightUnknown(pkg)}
                />
                I don't know
              </label>
            </div>
            
            {#if !pkg.weightUnknown}
              <Input
                type="number"
                step="0.1"
                min="0"
                max="150"
                value={pkg.weight}
                on:input={(e) => updatePackage(pkg.id, 'weight', parseFloat(e.currentTarget.value) || null)}
                placeholder="Enter weight"
              />
              <HelperText>
                Max 150 lbs per package. We'll weigh it at the warehouse if you're unsure.
              </HelperText>
            {:else}
              <div class="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                <AlertTriangle class="w-4 h-4 inline mr-1" />
                We'll weigh your package at drop-off and update the final price.
              </div>
            {/if}
          </div>

          <!-- Dimensions -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="flex items-center gap-2">
                <Ruler class="w-4 h-4 text-gray-400" />
                Dimensions (inches)
              </Label>
              <label class="flex items-center gap-2 text-sm">
                <Checkbox 
                  checked={pkg.dimensionsUnknown} 
                  onCheckedChange={() => toggleDimensionsUnknown(pkg)}
                />
                I don't know
              </label>
            </div>
            
            {#if !pkg.dimensionsUnknown}
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={pkg.length}
                    on:input={(e) => updatePackage(pkg.id, 'length', parseFloat(e.currentTarget.value) || null)}
                    placeholder="Length"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={pkg.width}
                    on:input={(e) => updatePackage(pkg.id, 'width', parseFloat(e.currentTarget.value) || null)}
                    placeholder="Width"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={pkg.height}
                    on:input={(e) => updatePackage(pkg.id, 'height', parseFloat(e.currentTarget.value) || null)}
                    placeholder="Height"
                  />
                </div>
              </div>
              <HelperText>
                Used to calculate dimensional weight. Larger packages may cost more.
              </HelperText>
            {/if}
          </div>

          <!-- Declared Value -->
          <div class="space-y-2">
            <Label class="flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-gray-400" />
              Declared Value (USD)
            </Label>
            <Input
              type="number"
              step="1"
              min="0"
              value={pkg.declaredValue}
              on:input={(e) => updatePackage(pkg.id, 'declaredValue', parseFloat(e.currentTarget.value) || null)}
              placeholder="Total value of contents"
            />
            <HelperText>
              Required for customs. Insurance is 2% of declared value (min $5).
              <strong>Under-declaring may void insurance.</strong>
            </HelperText>
          </div>

          <!-- Contents Description -->
          <div class="space-y-2">
            <Label>Contents Description</Label>
            <Textarea
              value={pkg.contentsDescription}
              on:input={(e) => updatePackage(pkg.id, 'contentsDescription', e.currentTarget.value)}
              placeholder="What's in this package? (e.g., clothing, electronics, food items)"
              rows={2}
            />
            <HelperText>
              Be specific for customs clearance. List main items.
            </HelperText>
          </div>

          <!-- Special Instructions -->
          <div class="space-y-2">
            <Label>Special Handling Instructions (Optional)</Label>
            <Textarea
              value={pkg.specialInstructions}
              on:input={(e) => updatePackage(pkg.id, 'specialInstructions', e.currentTarget.value)}
              placeholder="Any special handling requirements?"
              rows={2}
            />
          </div>
        </div>
      </Card>
    {/each}
  </div>

  <!-- Prohibited Items Checker -->
  <Card class="p-4">
    <h4 class="font-medium mb-3">Not sure if you can ship something?</h4>
    <ProhibitedChecker />
  </Card>

  <!-- Add Package Button (Mobile) -->
  {#if canAddMore}
    <Button variant="outline" class="w-full lg:hidden" on:click={addPackage}>
      <Plus class="w-4 h-4 mr-2" />
      Add Another Package
    </Button>
  {/if}
</div>
11.4 Payment Recovery Page ← NEW
svelte


Copy
<!-- src/routes/dashboard/bookings/[id]/retry-payment/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { AlertTriangle, CreditCard, Clock, RefreshCw } from 'lucide-svelte';
  import { loadStripe } from '@stripe/stripe-js';
  import { Elements, PaymentElement } from 'svelte-stripe';
  import { PUBLIC_STRIPE_KEY } from '$env/static/public';
  import { toast } from '$lib/stores/toast';

  export let data;
  
  $: booking = data.booking;
  $: paymentError = data.paymentError;
  
  let stripe: any;
  let clientSecret: string | null = null;
  let processing = false;
  let elements: any;

  onMount(async () => {
    stripe = await loadStripe(PUBLIC_STRIPE_KEY);
    
    // Create new payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: booking.quote.totalCost,
        bookingId: booking.id
      })
    });
    
    const { clientSecret: secret } = await response.json();
    clientSecret = secret;
  });

  async function handleSubmit() {
    if (!stripe || !elements) return;
    
    processing = true;
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/bookings/${booking.id}/confirmation`
      }
    });
    
    if (error) {
      toast.error(error.message);
      processing = false;
    }
  }

  function getErrorHelp(error: string): string {
    if (error.includes('insufficient_funds')) {
      return 'Please try a different card or ensure sufficient funds are available.';
    }
    if (error.includes('card_declined')) {
      return 'Your card was declined. Please try a different payment method.';
    }
    if (error.includes('expired_card')) {
      return 'Your card has expired. Please use a valid card.';
    }
    return 'Please try again or use a different payment method.';
  }
</script>

<svelte:head>
  <title>Retry Payment | QCS Cargo</title>
</svelte:head>

<div class="max-w-xl mx-auto py-8 px-4">
  <Card class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <div class="p-3 bg-amber-100 rounded-full">
        <AlertTriangle class="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Payment Required</h1>
        <p class="text-gray-500">Your previous payment could not be processed</p>
      </div>
    </div>

    {#if paymentError}
      <Alert class="mb-6 bg-red-50 border-red-200">
        <AlertDescription class="text-red-800">
          <p class="font-medium">Previous attempt failed</p>
          <p class="text-sm mt-1">{getErrorHelp(paymentError)}</p>
        </AlertDescription>
      </Alert>
    {/if}

    <!-- Booking Summary -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 class="font-medium mb-2">Booking Summary</h3>
      <div class="text-sm text-gray-600 space-y-1">
        <p>Destination: {booking.destination}</p>
        <p>Date: {new Date(booking.scheduled_date).toLocaleDateString()}</p>
        <p>Packages: {booking.package_count}</p>
      </div>
      <div class="mt-3 pt-3 border-t flex justify-between">
        <span class="font-medium">Total:</span>
        <span class="font-bold text-lg">${booking.quote.totalCost.toFixed(2)}</span>
      </div>
    </div>

    <!-- Hold timer -->
    <div class="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-6">
      <Clock class="w-4 h-4" />
      <span>This booking is held for 24 hours. Complete payment to confirm.</span>
    </div>

    <!-- Payment Form -->
    {#if clientSecret}
      <Elements {stripe} {clientSecret} bind:elements>
        <form on:submit|preventDefault={handleSubmit}>
          <PaymentElement />
          
          <div class="mt-6 space-y-3">
            <Button 
              type="submit" 
              class="w-full" 
              disabled={processing}
            >
              {#if processing}
                <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
                Processing...
              {:else}
                <CreditCard class="w-4 h-4 mr-2" />
                Pay ${booking.quote.totalCost.toFixed(2)}
              {/if}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              class="w-full"
              href="/dashboard/bookings/{booking.id}"
            >
              Cancel & View Booking
            </Button>
          </div>
        </form>
      </Elements>
    {:else}
      <div class="flex justify-center py-8">
        <RefreshCw class="w-6 h-6 animate-spin text-gray-400" />
      </div>
    {/if}

    <p class="text-xs text-gray-500 text-center mt-4">
      Having trouble? <a href="/contact" class="text-blue-600 underline">Contact support</a>
    </p>
  </Card>
</div>
11.5 Week 5 Acceptance Criteria
Criteria	Status
Booking wizard saves state on browser refresh	☐
All 5 steps validate before proceeding	☐
Multiple packages can be added (up to 20)	☐
Each package gets individual details	☐
"I don't know" weight option works	☐
Prohibited items checker integrated	☐
Recipient can be selected from saved list	☐
New recipient can be created inline	☐
Customs documents can be uploaded	☐
Available time slots exclude past times	☐
Stripe Payment Element renders correctly	☐
3D Secure flow completes successfully	☐
Payment failure shows recovery page	☐
Retry payment works with new card	☐
QR code generates for each package	☐
Confirmation email sends with all package details	☐
Booking can be modified (date/time) within 24 hours	☐
12. Week 6: Admin Panel Core
Focus: Admin dashboard, user management, communication log, and audit trail Estimated Hours: 45 hours Deliverables: Fully functional admin panel
12.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
6.1	Create admin layout with sidebar	2h	Critical	4.1
6.2	Build admin dashboard with KPIs	4h	Critical	6.1
6.3	Create real-time stats widgets	3h	High	6.2
6.4	Build users list with search/filter	3h	Critical	6.1
6.5	Create user detail page	3h	Critical	6.4
6.6	Build customer communication log	4h	High	6.5
6.7	Add communication send feature	3h	High	6.6
6.8	Add user impersonation feature	2h	High	6.5
6.9	Build shipments management table	4h	Critical	6.1
6.10	Create shipment status update UI	2h	Critical	6.9
6.11	Build batch status update feature	2h	High	6.10
6.12	Create global search (Cmd+K)	4h	High	6.1
6.13	Build activity log viewer	3h	High	6.1
6.14	Implement admin audit middleware	2h	Critical	6.1
6.15	Create admin settings page	2h	Medium	6.1
6.16	Build pricing configuration UI	2h	Medium	6.15
6.17	Add export to CSV functionality	2h	High	6.9
6.18	Implement admin role guards	2h	Critical	6.1
12.2 Customer Communication Log ← NEW
svelte


Copy
<!-- src/routes/admin/users/[id]/communications/+page.svelte -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Input } from '$lib/components/ui/input';
  import { 
    Mail, 
    Phone, 
    MessageSquare, 
    Send,
    Plus,
    Clock,
    User,
    ArrowLeft
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';
  import { formatRelative } from '$lib/utils/format';

  export let data;
  
  $: user = data.user;
  $: communications = data.communications;
  
  let showCompose = false;
  let composeType: 'email' | 'note' = 'email';
  let composeSubject = '';
  let composeContent = '';
  let sending = false;

  async function sendCommunication() {
    if (!composeContent.trim()) return;
    
    sending = true;
    try {
      const response = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: composeType,
          subject: composeSubject,
          content: composeContent
        })
      });

      if (!response.ok) throw new Error('Failed to send');

      const newComm = await response.json();
      communications = [newComm, ...communications];
      
      showCompose = false;
      composeSubject = '';
      composeContent = '';
      
      toast.success(composeType === 'email' ? 'Email sent' : 'Note added');
    } catch (err) {
      toast.error('Failed to send communication');
    } finally {
      sending = false;
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'note': return MessageSquare;
      default: return MessageSquare;
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'phone': return 'bg-green-100 text-green-600';
      case 'note': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
</script>

<svelte:head>
  <title>Communications - {user.name} | Admin | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button variant="ghost" href="/admin/users/{user.id}">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-xl font-bold">Communications</h1>
        <p class="text-gray-500">{user.name} ({user.email})</p>
      </div>
    </div>
    
    <Button on:click={() => showCompose = true}>
      <Plus class="w-4 h-4 mr-2" />
      New Communication
    </Button>
  </div>

  <!-- Compose Form -->
  {#if showCompose}
    <Card class="p-6">
      <h3 class="font-semibold mb-4">New Communication</h3>
      
      <div class="space-y-4">
        <div class="flex gap-2">
          <Button
            variant={composeType === 'email' ? 'default' : 'outline'}
            size="sm"
            on:click={() => composeType = 'email'}
          >
            <Mail class="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button
            variant={composeType === 'note' ? 'default' : 'outline'}
            size="sm"
            on:click={() => composeType = 'note'}
          >
            <MessageSquare class="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        {#if composeType === 'email'}
          <div>
            <label class="block text-sm font-medium mb-1">Subject</label>
            <Input bind:value={composeSubject} placeholder="Email subject" />
          </div>
        {/if}

        <div>
          <label class="block text-sm font-medium mb-1">
            {composeType === 'email' ? 'Message' : 'Note'}
          </label>
          <Textarea 
            bind:value={composeContent} 
            placeholder={composeType === 'email' ? 'Email content...' : 'Internal note...'}
            rows={4}
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" on:click={() => showCompose = false}>
            Cancel
          </Button>
          <Button on:click={sendCommunication} disabled={sending || !composeContent.trim()}>
            {#if sending}
              Sending...
            {:else}
              <Send class="w-4 h-4 mr-2" />
              {composeType === 'email' ? 'Send Email' : 'Add Note'}
            {/if}
          </Button>
        </div>
      </div>
    </Card>
  {/if}

  <!-- Communications Timeline -->
  <Card class="p-6">
    <h3 class="font-semibold mb-4">Communication History</h3>
    
    {#if communications.length > 0}
      <div class="space-y-4">
        {#each communications as comm}
          {@const Icon = getTypeIcon(comm.type)}
          <div class="flex gap-4 pb-4 border-b last:border-0">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full {getTypeColor(comm.type)} flex items-center justify-center">
                <Icon class="w-5 h-5" />
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  {#if comm.subject}
                    <p class="font-medium">{comm.subject}</p>
                  {/if}
                  <p class="text-sm text-gray-600 whitespace-pre-wrap">{comm.content}</p>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap">
                  {formatRelative(comm.sent_at)}
                </span>
              </div>
              
              <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <User class="w-3 h-3" />
                <span>{comm.sent_by_name || 'System'}</span>
                {#if comm.type === 'email'}
                  <span>•</span>
                  <span class={comm.opened_at ? 'text-green-600' : 'text-gray-400'}>
                    {comm.opened_at ? 'Opened' : 'Not opened'}
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-center text-gray-500 py-8">
        No communications yet
      </p>
    {/if}
  </Card>
</div>
12.3 Admin Audit Middleware ← NEW
typescript


Copy
// src/lib/server/audit.ts
import { pb } from './pocketbase';

interface AuditLogEntry {
  user: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_agent: string;
}

export async function logAdminAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, any> = {},
  request: Request
): Promise<void> {
  try {
    await pb.collection('activity_logs').create({
      user: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent') || 'unknown'
    });
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
}

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// Predefined audit actions
export const AUDIT_ACTIONS = {
  // User management
  USER_VIEW: 'user.view',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_IMPERSONATE: 'user.impersonate',
  
  // Shipment management
  SHIPMENT_VIEW: 'shipment.view',
  SHIPMENT_STATUS_UPDATE: 'shipment.status_update',
  SHIPMENT_DELETE: 'shipment.delete',
  
  // Booking management
  BOOKING_CANCEL: 'booking.cancel',
  BOOKING_MODIFY: 'booking.modify',
  
  // Invoice management
  INVOICE_VOID: 'invoice.void',
  INVOICE_REFUND: 'invoice.refund',
  
  // System
  SETTINGS_UPDATE: 'settings.update',
  EXPORT_DATA: 'data.export',
  BULK_UPDATE: 'bulk.update'
};
typescript


Copy
// src/hooks.server.ts (enhanced)
import { sequence } from '@sveltejs/kit/hooks';
import { logAdminAction, AUDIT_ACTIONS } from '$lib/server/audit';

const adminAuditHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Only audit admin routes with mutations
  if (
    event.url.pathname.startsWith('/admin') ||
    event.url.pathname.startsWith('/api/admin')
  ) {
    const method = event.request.method;
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && event.locals.user) {
      const resourceType = extractResourceType(event.url.pathname);
      const resourceId = extractResourceId(event.url.pathname);
      
      await logAdminAction(
        event.locals.user.id,
        `${method} ${event.url.pathname}`,
        resourceType,
        resourceId,
        {
          status: response.status,
          query: Object.fromEntries(event.url.searchParams)
        },
        event.request
      );
    }
  }
  
  return response;
};

function extractResourceType(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  // /admin/users/123 -> users
  // /api/admin/shipments/456/status -> shipments
  const adminIndex = parts.indexOf('admin');
  if (adminIndex >= 0 && parts[adminIndex + 1]) {
    return parts[adminIndex + 1];
  }
  return 'unknown';
}

function extractResourceId(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  // Look for ID-like segments (alphanumeric, 15+ chars)
  const idPattern = /^[a-zA-Z0-9]{15,}$/;
  const id = parts.find(p => idPattern.test(p));
  return id || '';
}

export const handle = sequence(authHook, adminAuditHook);
12.4 Activity Log Viewer ← NEW
svelte


Copy
<!-- src/routes/admin/activity/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { 
    Search, 
    Filter,
    User,
    Package,
    Calendar,
    CreditCard,
    Settings,
    ExternalLink,
    Clock
  } from 'lucide-svelte';
  import Pagination from '$lib/components/shared/Pagination.svelte';
  import { formatRelative } from '$lib/utils/format';

  export let data;
  
  let searchQuery = $page.url.searchParams.get('q') || '';
  let actionFilter = $page.url.searchParams.get('action') || 'all';
  let userFilter = $page.url.searchParams.get('user') || '';
  
  $: activities = data.activities;
  $: pagination = data.pagination;

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (actionFilter !== 'all') params.set('action', actionFilter);
    if (userFilter) params.set('user', userFilter);
    params.set('page', '1');
    goto(`?${params.toString()}`);
  }

  function getActionIcon(action: string) {
    if (action.includes('user')) return User;
    if (action.includes('shipment')) return Package;
    if (action.includes('booking')) return Calendar;
    if (action.includes('invoice')) return CreditCard;
    if (action.includes('settings')) return Settings;
    return Clock;
  }

  function getActionColor(action: string) {
    if (action.includes('delete') || action.includes('void')) return 'text-red-600 bg-red-50';
    if (action.includes('create') || action.includes('POST')) return 'text-green-600 bg-green-50';
    if (action.includes('update') || action.includes('PUT') || action.includes('PATCH')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  }

  function formatAction(action: string): string {
    // Convert technical action to readable format
    return action
      .replace(/\./g, ' ')
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }
</script>

<svelte:head>
  <title>Activity Log | Admin | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold">Activity Log</h1>
    <p class="text-gray-500">Audit trail of all system activities</p>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <form on:submit|preventDefault={handleSearch} class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            bind:value={searchQuery}
            placeholder="Search by user, action, or resource..."
            class="pl-10"
          />
        </div>
      </form>

      <select
        bind:value={actionFilter}
        on:change={handleSearch}
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="all">All Actions</option>
        <option value="user">User Actions</option>
        <option value="shipment">Shipment Actions</option>
        <option value="booking">Booking Actions</option>
        <option value="invoice">Invoice Actions</option>
        <option value="settings">Settings Changes</option>
      </select>
    </div>
  </Card>

  <!-- Activity List -->
  <Card>
    <div class="divide-y">
      {#each activities as activity}
        {@const Icon = getActionIcon(activity.action)}
        <div class="p-4 hover:bg-gray-50">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full {getActionColor(activity.action)} flex items-center justify-center flex-shrink-0">
              <Icon class="w-5 h-5" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-medium text-gray-900">
                    {formatAction(activity.action)}
                  </p>
                  <p class="text-sm text-gray-500">
                    by {activity.user_name || 'System'}
                    {#if activity.resource_type && activity.resource_id}
                      on <a 
                        href="/admin/{activity.resource_type}/{activity.resource_id}"
                        class="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {activity.resource_type} 
                        <ExternalLink class="w-3 h-3" />
                      </a>
                    {/if}
                  </p>
                </div>
                
                <span class="text-xs text-gray-400 whitespace-nowrap">
                  {formatRelative(activity.created)}
                </span>
              </div>
              
              {#if activity.metadata && Object.keys(activity.metadata).length > 0}
                <div class="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 overflow-x-auto">
                  {JSON.stringify(activity.metadata, null, 2)}
                </div>
              {/if}
              
              <div class="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span>IP: {activity.ip_address}</span>
                <span class="truncate max-w-xs">{activity.user_agent}</span>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div class="p-8 text-center text-gray-500">
          No activities found
        </div>
      {/each}
    </div>

    {#if pagination.totalPages > 1}
      <div class="px-4 py-4 border-t">
        <Pagination {...pagination} />
      </div>
    {/if}
  </Card>
</div>
12.5 Week 6 Acceptance Criteria
Criteria	Status
Admin dashboard loads KPIs within 2 seconds	☐
Non-admins cannot access /admin routes	☐
Cmd+K opens command palette	☐
Global search returns results from all collections	☐
User list pagination works correctly	☐
User impersonation works without affecting data	☐
Customer communication log shows all interactions	☐
Email can be sent to customer from admin	☐
Internal notes can be added	☐
Shipment status bulk update works	☐
Activity log shows all admin actions	☐
Admin actions are automatically logged	☐
CSV export downloads correctly	☐
Settings changes persist	☐
13. Week 7: Warehouse & Operations
Focus: Enhanced scanning with photos, exception handling, and weight discrepancy management Estimated Hours: 45 hours Deliverables: Complete warehouse operations system
13.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
7.1	Create warehouse layout	2h	Critical	4.1
7.2	Build QR/barcode scanner component	4h	Critical	7.1
7.3	Add USB barcode scanner support	2h	High	7.2
7.4	Add manual entry fallback	1h	High	7.2
7.5	Create package receive workflow	3h	Critical	7.2
7.6	Build weight/dimensions entry UI	2h	High	7.5
7.7	Add package photo capture	3h	High	7.5
7.8	Build exception/damage reporting	4h	High	7.5
7.9	Create weight discrepancy workflow	3h	High	7.5
7.10	Implement offline queue (IndexedDB)	4h	Critical	7.5
7.11	Build background sync service	3h	Critical	7.10
7.12	Create manifest builder page	3h	High	7.1
7.13	Build manifest PDF generator	3h	High	7.12
7.14	Create AWB label generator	3h	High	7.1
7.15	Add print functionality	2h	High	7.13, 7.14
7.16	Build inventory view with location	2h	Medium	7.1
7.17	Add haptic/audio feedback	1h	Medium	7.2
13.2 USB Barcode Scanner Support ← NEW
svelte


Copy
<!-- src/lib/components/warehouse/Scanner.svelte (enhanced) -->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { Camera, Keyboard, Volume2, VolumeX, Loader2, Usb } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';

  export let onScan: (code: string) => void;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let mode: 'camera' | 'manual' | 'usb' = 'camera';
  let manualInput = '';
  let scanning = false;
  let soundEnabled = true;
  let videoRef: HTMLVideoElement;
  let canvasRef: HTMLCanvasElement;
  let stream: MediaStream | null = null;
  let animationId: number;
  
  // USB scanner support
  let usbBuffer = '';
  let usbTimeout: ReturnType<typeof setTimeout>;
  let lastUsbScan = 0;

  // Audio feedback
  let successSound: HTMLAudioElement;
  let errorSound: HTMLAudioElement;

  onMount(() => {
    if (!browser) return;
    
    // Initialize audio
    successSound = new Audio('/sounds/scan-success.mp3');
    errorSound = new Audio('/sounds/scan-error.mp3');

    // Listen for USB scanner input (keyboard events)
    window.addEventListener('keypress', handleUsbInput);

    if (mode === 'camera') {
      startCamera();
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keypress', handleUsbInput);
    }
    stopCamera();
  });

  // USB barcode scanners send rapid keystrokes followed by Enter
  function handleUsbInput(e: KeyboardEvent) {
    // Don't capture if typing in an input field (except in USB mode)
    if (mode !== 'usb' && document.activeElement?.tagName === 'INPUT') {
      return;
    }

    const now = Date.now();
    
    // If more than 100ms since last keystroke, start new buffer
    if (now - lastUsbScan > 100) {
      usbBuffer = '';
    }
    lastUsbScan = now;

    if (e.key === 'Enter') {
      // Complete scan if buffer has content
      if (usbBuffer.length >= 5) {
        e.preventDefault();
        handleScanResult(usbBuffer.trim());
        usbBuffer = '';
      }
    } else if (e.key.length === 1) {
      // Accumulate characters
      usbBuffer += e.key;
      
      // Clear buffer after timeout
      clearTimeout(usbTimeout);
      usbTimeout = setTimeout(() => {
        usbBuffer = '';
      }, 200);
    }
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef) {
        videoRef.srcObject = stream;
        await videoRef.play();
        startCameraScanning();
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera. Try USB scanner or manual entry.');
      mode = 'usb';
    }
  }

  function stopCamera() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  function startCameraScanning() {
    if (!videoRef || !canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const scan = async () => {
      if (!scanning && videoRef.readyState === videoRef.HAVE_ENOUGH_DATA) {
        canvasRef.width = videoRef.videoWidth;
        canvasRef.height = videoRef.videoHeight;
        ctx.drawImage(videoRef, 0, 0);

        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({
              formats: ['qr_code', 'code_128', 'code_39']
            });
            
            const barcodes = await detector.detect(canvasRef);
            
            if (barcodes.length > 0) {
              handleScanResult(barcodes[0].rawValue);
              return;
            }
          } catch (err) {
            console.error('BarcodeDetector error:', err);
          }
        }
      }

      animationId = requestAnimationFrame(scan);
    };

    scan();
  }

  function handleScanResult(code: string) {
    if (scanning || disabled) return;
    
    scanning = true;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    // Audio feedback
    if (soundEnabled) {
      successSound.play().catch(() => {});
    }

    onScan(code);
    dispatch('scan', { code });

    // Debounce
    setTimeout(() => {
      scanning = false;
    }, 1500);
  }

  function handleManualSubmit() {
    if (!manualInput.trim()) return;
    
    handleScanResult(manualInput.trim().toUpperCase());
    manualInput = '';
  }

  function setMode(newMode: typeof mode) {
    if (mode === 'camera') {
      stopCamera();
    }
    
    mode = newMode;
    
    if (newMode === 'camera') {
      startCamera();
    }
  }
</script>

<div class="bg-gray-900 rounded-xl overflow-hidden">
  <!-- Mode selector -->
  <div class="flex border-b border-gray-700">
    <button
      on:click={() => setMode('camera')}
      class="flex-1 py-2 px-4 text-sm flex items-center justify-center gap-2
             {mode === 'camera' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}"
    >
      <Camera class="w-4 h-4" />
      Camera
    </button>
    <button
      on:click={() => setMode('usb')}
      class="flex-1 py-2 px-4 text-sm flex items-center justify-center gap-2
             {mode === 'usb' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}"
    >
      <Usb class="w-4 h-4" />
      USB Scanner
    </button>
    <button
      on:click={() => setMode('manual')}
      class="flex-1 py-2 px-4 text-sm flex items-center justify-center gap-2
             {mode === 'manual' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}"
    >
      <Keyboard class="w-4 h-4" />
      Manual
    </button>
  </div>

  <!-- Scanner viewport -->
  <div class="relative aspect-square max-h-[400px]">
    {#if mode === 'camera'}
      <video
        bind:this={videoRef}
        class="w-full h-full object-cover"
        playsinline
        muted
      />
      <canvas bind:this={canvasRef} class="hidden" />
      
      <!-- Scan overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-64 h-64 border-2 border-white/50 rounded-lg relative">
          <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
          <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
          <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
          
          {#if scanning}
            <div class="absolute inset-0 flex items-center justify-center bg-blue-500/20">
              <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          {/if}
        </div>
      </div>
      
      <div class="absolute bottom-4 left-0 right-0 text-center">
        <p class="text-white/80 text-sm">Position QR code within the frame</p>
      </div>
      
    {:else if mode === 'usb'}
      <div class="flex flex-col items-center justify-center h-full bg-gray-800 p-8">
        <Usb class="w-16 h-16 text-gray-400 mb-4" />
        <p class="text-white text-lg font-medium mb-2">USB Scanner Ready</p>
        <p class="text-gray-400 text-sm text-center">
          Scan any barcode with your USB scanner.<br/>
          The code will be captured automatically.
        </p>
        
        {#if scanning}
          <div class="mt-4 flex items-center gap-2 text-green-400">
            <Loader2 class="w-4 h-4 animate-spin" />
            Processing...
          </div>
        {/if}
      </div>
      
    {:else}
      <div class="flex items-center justify-center h-full bg-gray-800 p-8">
        <form on:submit|preventDefault={handleManualSubmit} class="w-full max-w-sm">
          <label class="block text-white/80 text-sm mb-2">
            Enter tracking number or QR code
          </label>
          <div class="flex gap-2">
            <Input
              bind:value={manualInput}
              placeholder="QCS2412150001ABCD"
              class="flex-1 text-lg font-mono uppercase"
              autofocus
            />
            <Button type="submit" disabled={!manualInput.trim()}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    {/if}
  </div>

  <!-- Sound toggle -->
  <div class="flex items-center justify-end p-2 bg-gray-800">
    <Button
      variant="ghost"
      size="sm"
      on:click={() => soundEnabled = !soundEnabled}
      class="text-white hover:bg-gray-700"
    >
      {#if soundEnabled}
        <Volume2 class="w-4 h-4" />
      {:else}
        <VolumeX class="w-4 h-4" />
      {/if}
    </Button>
  </div>
</div>
13.3 Package Photo Capture ← NEW
svelte


Copy
<!-- src/lib/components/warehouse/PackagePhotos.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Camera, X, Image, AlertTriangle } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';

  export let photos: Array<{ file: File; preview: string }> = [];
  export let maxPhotos = 5;
  export let required = false;
  export let hint = 'Capture photos of package condition';

  const dispatch = createEventDispatcher();

  let fileInput: HTMLInputElement;
  let cameraInput: HTMLInputElement;

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    for (const file of Array.from(input.files)) {
      if (photos.length >= maxPhotos) break;
      
      // Compress and create preview
      const preview = await createPreview(file);
      photos = [...photos, { file, preview }];
    }
    
    dispatch('change', photos);
    input.value = '';
  }

  async function createPreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    photos = photos.filter((_, i) => i !== index);
    dispatch('change', photos);
  }

  function openCamera() {
    cameraInput?.click();
  }

  function openGallery() {
    fileInput?.click();
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700">
      Package Photos
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
    <span class="text-xs text-gray-500">{photos.length}/{maxPhotos}</span>
  </div>

  {#if hint}
    <p class="text-sm text-gray-500">{hint}</p>
  {/if}

  <!-- Photo Grid -->
  <div class="grid grid-cols-3 gap-2">
    {#each photos as photo, i}
      <div class="relative aspect-square">
        <img 
          src={photo.preview} 
          alt="Package photo {i + 1}" 
          class="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          on:click={() => removePhoto(i)}
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                 flex items-center justify-center shadow-lg hover:bg-red-600"
          aria-label="Remove photo"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    {/each}

    {#if photos.length < maxPhotos}
      <div class="aspect-square border-2 border-dashed border-gray-300 rounded-lg 
                  flex flex-col items-center justify-center gap-2">
        <div class="flex gap-2">
          <button
            type="button"
            on:click={openCamera}
            class="p-3 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100"
            aria-label="Take photo"
          >
            <Camera class="w-5 h-5" />
          </button>
          <button
            type="button"
            on:click={openGallery}
            class="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Choose from gallery"
          >
            <Image class="w-5 h-5" />
          </button>
        </div>
        <span class="text-xs text-gray-500">Add Photo</span>
      </div>
    {/if}
  </div>

  <!-- Alert for damaged packages -->
  {#if required && photos.length === 0}
    <div class="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
      <AlertTriangle class="w-4 h-4 flex-shrink-0" />
      <span>Please capture at least one photo of the package condition.</span>
    </div>
  {/if}

  <!-- Hidden inputs -->
  <input
    bind:this={cameraInput}
    type="file"
    accept="image/*"
    capture="environment"
    on:change={handleFileSelect}
    class="hidden"
  />
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    on:change={handleFileSelect}
    class="hidden"
  />
</div>
13.4 Exception/Damage Reporting ← NEW
svelte


Copy
<!-- src/lib/components/warehouse/ExceptionReport.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Label } from '$lib/components/ui/label';
  import { 
    AlertTriangle, 
    Package, 
    Scale, 
    Ban, 
    HelpCircle,
    Camera
  } from 'lucide-svelte';
  import PackagePhotos from './PackagePhotos.svelte';

  export let trackingNumber: string;
  export let onSubmit: (exception: any) => void;
  export let onCancel: () => void;

  const dispatch = createEventDispatcher();

  let exceptionType: string = '';
  let severity: 'minor' | 'major' | 'reject' = 'minor';
  let description = '';
  let photos: Array<{ file: File; preview: string }> = [];
  let submitting = false;

  const exceptionTypes = [
    { value: 'damage', label: 'Package Damaged', icon: Package, description: 'Visible damage to packaging or contents' },
    { value: 'wrong_weight', label: 'Weight Discrepancy', icon: Scale, description: 'Weight differs significantly from booking' },
    { value: 'prohibited_item', label: 'Prohibited Item', icon: Ban, description: 'Package contains prohibited contents' },
    { value: 'incomplete_info', label: 'Missing Information', icon: HelpCircle, description: 'Missing labels or recipient details' },
    { value: 'other', label: 'Other Issue', icon: AlertTriangle, description: 'Other exception requiring attention' }
  ];

  $: requiresPhotos = exceptionType === 'damage' || exceptionType === 'prohibited_item';
  $: canSubmit = exceptionType && description && (!requiresPhotos || photos.length > 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    
    submitting = true;
    
    try {
      await onSubmit({
        trackingNumber,
        type: exceptionType,
        severity,
        description,
        photos: photos.map(p => p.file)
      });
    } finally {
      submitting = false;
    }
  }
</script>

<Card class="p-6">
  <div class="flex items-center gap-3 mb-6">
    <div class="p-2 bg-red-100 rounded-full">
      <AlertTriangle class="w-5 h-5 text-red-600" />
    </div>
    <div>
      <h3 class="font-semibold text-gray-900">Report Exception</h3>
      <p class="text-sm text-gray-500">Package: {trackingNumber}</p>
    </div>
  </div>

  <div class="space-y-6">
    <!-- Exception Type -->
    <div>
      <Label class="mb-3 block">Exception Type</Label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {#each exceptionTypes as type}
          <button
            type="button"
            on:click={() => exceptionType = type.value}
            class="flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-colors
                   {exceptionType === type.value 
                     ? 'border-red-500 bg-red-50' 
                     : 'border-gray-200 hover:border-gray-300'}"
          >
            <type.icon class="w-5 h-5 {exceptionType === type.value ? 'text-red-600' : 'text-gray-400'}" />
            <div>
              <p class="font-medium text-sm">{type.label}</p>
              <p class="text-xs text-gray-500">{type.description}</p>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Severity -->
    {#if exceptionType}
      <div>
        <Label class="mb-3 block">Severity</Label>
        <div class="flex gap-2">
          <button
            type="button"
            on:click={() => severity = 'minor'}
            class="flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium
                   {severity === 'minor' 
                     ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                     : 'border-gray-200 text-gray-600'}"
          >
            Minor
          </button>
          <button
            type="button"
            on:click={() => severity = 'major'}
            class="flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium
                   {severity === 'major' 
                     ? 'border-orange-500 bg-orange-50 text-orange-700' 
                     : 'border-gray-200 text-gray-600'}"
          >
            Major
          </button>
          <button
            type="button"
            on:click={() => severity = 'reject'}
            class="flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium
                   {severity === 'reject' 
                     ? 'border-red-500 bg-red-50 text-red-700' 
                     : 'border-gray-200 text-gray-600'}"
          >
            Reject
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          {#if severity === 'minor'}
            Package can continue processing with noted issue
          {:else if severity === 'major'}
            Package requires review before processing
          {:else}
            Package cannot be accepted
          {/if}
        </p>
      </div>

      <!-- Photos -->
      <div>
        <PackagePhotos 
          bind:photos 
          required={requiresPhotos}
          hint={requiresPhotos ? 'Photo documentation required for this exception type' : 'Optional: Add photos for documentation'}
        />
      </div>

      <!-- Description -->
      <div>
        <Label for="description">Description</Label>
        <Textarea
          id="description"
          bind:value={description}
          placeholder="Describe the issue in detail..."
          rows={3}
        />
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex gap-3 pt-4 border-t">
      <Button variant="outline" class="flex-1" on:click={onCancel}>
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        class="flex-1"
        disabled={!canSubmit || submitting}
        on:click={handleSubmit}
      >
        {submitting ? 'Submitting...' : 'Report Exception'}
      </Button>
    </div>
  </div>
</Card>
13.5 Weight Discrepancy Handling ← NEW
svelte


Copy
<!-- src/lib/components/warehouse/WeightDiscrepancy.svelte -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Scale, AlertTriangle, DollarSign, Mail } from 'lucide-svelte';
  import { formatCurrency } from '$lib/utils/format';

  export let shipment: any;
  export let actualWeight: number;
  export let onProceed: () => void;
  export let onHold: () => void;

  $: estimatedWeight = shipment.weight_lbs || 0;
  $: weightDifference = actualWeight - estimatedWeight;
  $: percentageDifference = estimatedWeight > 0 
    ? ((weightDifference / estimatedWeight) * 100).toFixed(1)
    : 0;
  $: isOverweight = weightDifference > 0;
  $: additionalCost = isOverweight 
    ? weightDifference * (shipment.rate_per_lb || 3.50)
    : 0;

  // Threshold for auto-approval (within 10%)
  $: isWithinThreshold = Math.abs(parseFloat(percentageDifference.toString())) <= 10;
</script>

<Card class="p-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="p-2 bg-amber-100 rounded-full">
      <Scale class="w-5 h-5 text-amber-600" />
    </div>
    <div>
      <h3 class="font-semibold text-gray-900">Weight Discrepancy Detected</h3>
      <p class="text-sm text-gray-500">Package: {shipment.tracking_number}</p>
    </div>
  </div>

  <!-- Comparison -->
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="p-4 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-500 mb-1">Estimated Weight</p>
      <p class="text-2xl font-bold text-gray-900">
        {estimatedWeight > 0 ? `${estimatedWeight} lbs` : 'Not provided'}
      </p>
    </div>
    <div class="p-4 bg-blue-50 rounded-lg">
      <p class="text-sm text-blue-600 mb-1">Actual Weight</p>
      <p class="text-2xl font-bold text-blue-900">{actualWeight} lbs</p>
    </div>
  </div>

  <!-- Difference -->
  <div class="p-4 rounded-lg mb-6 {isOverweight ? 'bg-amber-50' : 'bg-green-50'}">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm {isOverweight ? 'text-amber-600' : 'text-green-600'}">
          Difference
        </p>
        <p class="text-lg font-bold {isOverweight ? 'text-amber-900' : 'text-green-900'}">
          {isOverweight ? '+' : ''}{weightDifference.toFixed(1)} lbs ({isOverweight ? '+' : ''}{percentageDifference}%)
        </p>
      </div>
      
      {#if isOverweight && additionalCost > 0}
        <div class="text-right">
          <p class="text-sm text-amber-600">Additional Cost</p>
          <p class="text-lg font-bold text-amber-900">
            {formatCurrency(additionalCost)}
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Customer Info -->
  <div class="mb-6">
    <p class="text-sm text-gray-500 mb-1">Customer</p>
    <p class="font-medium">{shipment.customer_name}</p>
    <p class="text-sm text-gray-500">{shipment.customer_email}</p>
  </div>

  <!-- Actions based on threshold -->
  {#if isWithinThreshold}
    <Alert class="mb-4">
      <AlertDescription>
        Weight is within 10% threshold. You can proceed with the updated weight.
      </AlertDescription>
    </Alert>
    
    <div class="flex gap-3">
      <Button class="flex-1" on:click={onProceed}>
        Proceed with {actualWeight} lbs
      </Button>
    </div>
  {:else}
    <Alert class="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle class="w-4 h-4 text-amber-600" />
      <AlertDescription class="text-amber-800">
        Weight exceeds 10% threshold. Customer notification required.
      </AlertDescription>
    </Alert>

    <div class="space-y-3">
      <Button class="w-full" variant="outline" on:click={onHold}>
        <Mail class="w-4 h-4 mr-2" />
        Notify Customer & Hold Package
      </Button>
      
      <p class="text-xs text-gray-500 text-center">
        An email will be sent to the customer with the updated weight and cost.
        Package will be held until payment is received.
      </p>
    </div>
  {/if}
</Card>
13.6 Week 7 Acceptance Criteria
Criteria	Status
Camera QR scanner works on mobile	☐
USB barcode scanner captures input	☐
Manual entry fallback works	☐
Scans save to IndexedDB when offline	☐
Background sync processes queue	☐
Haptic feedback on successful scan	☐
Audio feedback plays	☐
Package photos can be captured	☐
Photos upload with shipment	☐
Exception report workflow works	☐
Exception triggers customer notification	☐
Weight discrepancy detected and handled	☐
Customer notified of weight variance	☐
Manifest builder groups correct shipments	☐
Manifest PDF generates correctly	☐
Offline indicator shows correct status	☐
14. Week 8: Migration & Testing
Focus: Data migration, comprehensive testing, and performance optimization Estimated Hours: 40 hours Deliverables: Production-ready application with migrated data
14.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
8.1	Create Supabase → PocketBase migration scripts	4h	Critical	All
8.2	Test migration in staging environment	3h	Critical	8.1
8.3	Migrate user accounts	2h	Critical	8.2
8.4	Migrate mailbox assignments	1h	Critical	8.3
8.5	Migrate shipment history	2h	Critical	8.3
8.6	Migrate invoices and payment records	2h	Critical	8.5
8.7	Run E2E test suite (Playwright)	4h	Critical	All
8.8	Run accessibility tests (axe)	3h	Critical	All
8.9	Performance testing and optimization	4h	High	All
8.10	Security audit (OWASP checklist)	3h	Critical	All
8.11	Load testing (k6)	2h	High	All
8.12	Create rollback plan	2h	Critical	8.2
8.13	Document all APIs	3h	High	All
8.14	Create user documentation	3h	Medium	All
8.15	Train support team	2h	Medium	8.14
14.2 Week 8 Acceptance Criteria
Criteria	Status
All users migrated with correct data	☐
Historical shipments accessible	☐
User can log in with existing password	☐
Zero data loss verified	☐
All E2E tests pass	☐
All accessibility tests pass	☐
Load test passes (50 concurrent users)	☐
Lighthouse Performance > 95	☐
Security audit passed	☐
Rollback plan documented and tested	☐
15. Week 9: Polish, Accessibility & Launch
Focus: Final polish, accessibility fixes, global improvements, and production deployment Estimated Hours: 40 hours Deliverables: Live production application
15.1 Task Breakdown
#	Task	Est.	Priority	Dependencies
9.1	Implement skip links	1h	High	—
9.2	Add focus management after actions	3h	High	—
9.3	Implement reduced motion support	2h	Medium	—
9.4	Add global offline indicator	2h	High	—
9.5	Implement form auto-save	3h	High	—
9.6	Add session expiry warning	2h	Medium	—
9.7	Add loading state messages	2h	Medium	—
9.8	Standardize confirmation dialogs	2h	High	—
9.9	Add form microcopy/helper text	3h	High	—
9.10	Create service status page	3h	Medium	—
9.11	Final cross-browser testing	3h	Critical	All
9.12	Final mobile device testing	3h	Critical	All
9.13	DNS cutover preparation	2h	Critical	8.12
9.14	Execute production migration	3h	Critical	9.13
9.15	Post-launch monitoring	4h	Critical	9.14
9.16	Hotfix buffer	4h	Critical	9.15
15.2 Accessibility Components ← NEW
svelte


Copy
<!-- src/lib/components/layout/SkipLink.svelte -->
<script lang="ts">
  export let targetId = 'main-content';
  export let label = 'Skip to main content';
</script>

<a
  href="#{targetId}"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
         bg-blue-600 text-white px-4 py-2 rounded-lg z-50 font-medium
         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
>
  {label}
</a>
svelte


Copy
<!-- src/lib/components/layout/OfflineIndicator.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { WifiOff, Wifi } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  const isOnline = writable(true);
  let showReconnected = false;

  onMount(() => {
    isOnline.set(navigator.onLine);

    const handleOnline = () => {
      isOnline.set(true);
      showReconnected = true;
      setTimeout(() => showReconnected = false, 3000);
    };

    const handleOffline = () => {
      isOnline.set(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

{#if !$isOnline}
  <div 
    transition:fade
    class="fixed bottom-0 left-0 right-0 bg-amber-500 text-white py-2 px-4 z-50
           flex items-center justify-center gap-2 text-sm font-medium"
    role="alert"
    aria-live="assertive"
  >
    <WifiOff class="w-4 h-4" />
    <span>You're offline. Some features may not work.</span>
  </div>
{/if}

{#if showReconnected}
  <div 
    transition:fade
    class="fixed bottom-0 left-0 right-0 bg-green-500 text-white py-2 px-4 z-50
           flex items-center justify-center gap-2 text-sm font-medium"
    role="status"
    aria-live="polite"
  >
    <Wifi class="w-4 h-4" />
    <span>Back online!</span>
  </div>
{/if}
typescript


Copy
// src/lib/utils/focus.ts

/**
 * Manages focus after actions for accessibility
 */

export function focusElement(selector: string, delay = 0): void {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      // Ensure screen readers announce the content
      element.setAttribute('tabindex', '-1');
    }
  }, delay);
}

export function focusFirstError(): void {
  const firstError = document.querySelector('[aria-invalid="true"]') as HTMLElement;
  if (firstError) {
    firstError.focus();
  }
}

export function returnFocus(previousElement: HTMLElement | null): void {
  if (previousElement && document.body.contains(previousElement)) {
    previousElement.focus();
  }
}

export function announceLive(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcer = document.getElementById('live-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'live-announcer';
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(announcer);
  return announcer;
}
15.3 Service Status Page ← NEW
svelte


Copy
<!-- src/routes/status/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-svelte';

  export let data;
  
  $: services = data.services;
  $: incidents = data.incidents;
  $: lastUpdated = data.lastUpdated;

  const statusConfig = {
    operational: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Degraded Performance' },
    outage: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Outage' },
    maintenance: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Maintenance' }
  };

  function getOverallStatus() {
    if (services.some(s => s.status === 'outage')) return 'outage';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    if (services.some(s => s.status === 'maintenance')) return 'maintenance';
    return 'operational';
  }

  $: overallStatus = getOverallStatus();
  $: overallConfig = statusConfig[overallStatus];
</script>

<svelte:head>
  <title>System Status | QCS Cargo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-3xl mx-auto px-4 py-12">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
      <p class="text-gray-500">
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </p>
    </div>

    <!-- Overall Status -->
    <Card class="p-6 mb-8 {overallConfig.bg}">
      <div class="flex items-center gap-4">
        <overallConfig.icon class="w-10 h-10 {overallConfig.color}" />
        <div>
          <p class="text-lg font-semibold text-gray-900">
            {overallStatus === 'operational' 
              ? 'All Systems Operational'
              : overallConfig.label}
          </p>
          <p class="text-sm text-gray-600">
            {overallStatus === 'operational'
              ? 'All services are running normally'
              : 'Some services may be affected'}
          </p>
        </div>
      </div>
    </Card>

    <!-- Services -->
    <Card class="mb-8">
      <div class="p-4 border-b">
        <h2 class="font-semibold">Services</h2>
      </div>
      <div class="divide-y">
        {#each services as service}
          {@const config = statusConfig[service.status]}
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">{service.name}</p>
              <p class="text-sm text-gray-500">{service.description}</p>
            </div>
            <div class="flex items-center gap-2 {config.color}">
              <config.icon class="w-5 h-5" />
              <span class="text-sm font-medium">{config.label}</span>
            </div>
          </div>
        {/each}
      </div>
    </Card>

    <!-- Incidents -->
    {#if incidents.length > 0}
      <Card>
        <div class="p-4 border-b">
          <h2 class="font-semibold">Recent Incidents</h2>
        </div>
        <div class="divide-y">
          {#each incidents as incident}
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-medium text-gray-900">{incident.title}</h3>
                <span class="text-xs text-gray-400">
                  {new Date(incident.created).toLocaleDateString()}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{incident.description}</p>
              
              {#if incident.updates?.length > 0}
                <div class="space-y-2 pl-4 border-l-2 border-gray-200">
                  {#each incident.updates as update}
                    <div class="text-sm">
                      <span class="text-gray-400">
                        {new Date(update.time).toLocaleTimeString()}
                      </span>
                      <span class="text-gray-600 ml-2">{update.message}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </Card>
    {:else}
      <Card class="p-8 text-center">
        <p class="text-gray-500">No recent incidents</p>
      </Card>
    {/if}

    <!-- Subscribe -->
    <div class="mt-8 text-center">
      <p class="text-sm text-gray-500">
        Get notified of status updates via email.
        <a href="/contact" class="text-blue-600 hover:underline">Subscribe</a>
      </p>
    </div>
  </div>
</div>
15.4 Launch Checklist
markdown


Copy
# QCS Cargo 2.0 Launch Checklist

## Pre-Launch (T-24 hours)

### Environment
- [ ] All environment variables set in Dokploy
- [ ] SSL certificates valid and auto-renewing
- [ ] Database backups running (verify in Backblaze B2)
- [ ] Litestream replication lag < 1 minute
- [ ] DNS TTL reduced to 300 seconds

### Code
- [ ] All E2E tests passing
- [ ] All accessibility tests passing
- [ ] No critical Sentry errors in staging
- [ ] Lighthouse scores > 95 on all pages
- [ ] Bundle size within budget

### Data
- [ ] Test migration completed successfully
- [ ] User count matches between systems
- [ ] Mailbox assignments verified
- [ ] Historical shipments accessible

### Security
- [ ] OWASP checklist completed
- [ ] Rate limiting tested
- [ ] CSP headers configured

### Communication
- [ ] Customer notification drafted
- [ ] Support team trained
- [ ] Rollback plan documented

---

## Launch Day (T-0)

### Migration Window: 2:00 AM - 6:00 AM EST

- [ ] Enable maintenance mode on old site
- [ ] Take final Supabase backup
- [ ] Run production migration script
- [ ] Verify migration counts
- [ ] Update DNS
- [ ] Verify SSL
- [ ] Disable maintenance mode
- [ ] Smoke test all critical flows
- [ ] Monitor error rates
- [ ] Send launch notification

---

## Post-Launch (T+24 hours)

- [ ] Zero critical errors
- [ ] Response times within thresholds
- [ ] Backups verified for new data
- [ ] Customer support tickets reviewed
- [ ] Schedule retrospective
15.5 Week 9 Acceptance Criteria
Criteria	Status
Skip links work on all pages	☐
Focus management after modal close works	☐
Reduced motion respected	☐
Global offline indicator shows	☐
Form auto-save works	☐
Session expiry warning shows	☐
Loading states have messages	☐
Confirmation dialogs standardized	☐
All forms have helper text	☐
Status page shows service health	☐
All browsers tested	☐
All mobile devices tested	☐
Production migration successful	☐
Zero critical errors post-launch	☐
16. Database Schema Specification
16.1 Complete Collection Definitions
javascript


Copy
// PocketBase Collections (pb_schema.json)
{
  "collections": [
    // ==========================================
    // USERS (Auth Collection)
    // ==========================================
    {
      "name": "users",
      "type": "auth",
      "schema": [
        { "name": "name", "type": "text", "required": true },
        { "name": "phone", "type": "text" },
        { "name": "role", "type": "select", "required": true,
          "options": { "values": ["customer", "staff", "admin"] }
        },
        { "name": "avatar", "type": "file",
          "options": { "maxSelect": 1, "maxSize": 5242880 }
        },
        { "name": "address_line1", "type": "text" },
        { "name": "address_line2", "type": "text" },
        { "name": "city", "type": "text" },
        { "name": "state", "type": "text" },
        { "name": "zip", "type": "text" },
        { "name": "country", "type": "text" },
        { "name": "notification_email", "type": "bool" },
        { "name": "notification_sms", "type": "bool" },
        { "name": "notify_received", "type": "bool" },
        { "name": "notify_transit", "type": "bool" },
        { "name": "notify_delivered", "type": "bool" },
        { "name": "stripe_customer_id", "type": "text" },
        { "name": "deleted_at", "type": "date" }
      ]
    },

    // ==========================================
    // MAILBOXES
    // ==========================================
    {
      "name": "mailboxes",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "suite_code", "type": "text", "required": true },
        { "name": "status", "type": "select", "required": true,
          "options": { "values": ["active", "suspended", "closed"] }
        },
        { "name": "notes", "type": "text" }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX idx_suite_code ON mailboxes (suite_code)",
        "CREATE UNIQUE INDEX idx_mailbox_user ON mailboxes (user)"
      ]
    },

    // ==========================================
    // RECIPIENTS (NEW)
    // ==========================================
    {
      "name": "recipients",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "name", "type": "text", "required": true },
        { "name": "phone", "type": "text", "required": true },
        { "name": "address_line1", "type": "text", "required": true },
        { "name": "address_line2", "type": "text" },
        { "name": "city", "type": "text", "required": true },
        { "name": "destination", "type": "select", "required": true,
          "options": { "values": ["guyana", "jamaica", "trinidad", "barbados", "suriname"] }
        },
        { "name": "delivery_instructions", "type": "text" },
        { "name": "is_default", "type": "bool" },
        { "name": "usage_count", "type": "number" }
      ],
      "indexes": [
        "CREATE INDEX idx_recipient_user ON recipients (user)"
      ]
    },

    // ==========================================
    // BOOKINGS
    // ==========================================
    {
      "name": "bookings",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "recipient", "type": "relation",
          "options": { "collectionId": "recipients", "maxSelect": 1 }
        },
        { "name": "destination", "type": "select", "required": true,
          "options": { "values": ["guyana", "jamaica", "trinidad", "barbados", "suriname"] }
        },
        { "name": "service_type", "type": "select", "required": true,
          "options": { "values": ["standard", "express", "door_to_door", "consolidated"] }
        },
        { "name": "scheduled_date", "type": "date", "required": true },
        { "name": "time_slot", "type": "text", "required": true },
        { "name": "status", "type": "select", "required": true,
          "options": { "values": ["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "no_show"] }
        },
        { "name": "package_count", "type": "number" },
        { "name": "quote_data", "type": "json" },
        { "name": "customs_documents", "type": "file",
          "options": { "maxSelect": 5, "maxSize": 10485760 }
        },
        { "name": "notes", "type": "text" },
        { "name": "cancelled_at", "type": "date" },
        { "name": "cancellation_reason", "type": "text" },
        { "name": "payment_intent_id", "type": "text" },
        { "name": "payment_status", "type": "select",
          "options": { "values": ["pending", "processing", "succeeded", "failed", "refunded"] }
        },
        { "name": "payment_error", "type": "text" }
      ]
    },

    // ==========================================
    // PACKAGES (NEW - replaces single shipment per booking)
    // ==========================================
    {
      "name": "packages",
      "type": "base",
      "schema": [
        { "name": "booking", "type": "relation", "required": true,
          "options": { "collectionId": "bookings", "maxSelect": 1 }
        },
        { "name": "tracking_number", "type": "text", "required": true },
        { "name": "qr_code", "type": "text", "required": true },
        { "name": "status", "type": "select", "required": true,
          "options": { "values": ["pending", "received", "processing", "in_transit", "customs", "out_for_delivery", "delivered", "exception", "cancelled"] }
        },
        { "name": "weight_lbs", "type": "number" },
        { "name": "weight_estimated", "type": "bool" },
        { "name": "weight_actual", "type": "number" },
        { "name": "length_in", "type": "number" },
        { "name": "width_in", "type": "number" },
        { "name": "height_in", "type": "number" },
        { "name": "dim_weight_lbs", "type": "number" },
        { "name": "billable_weight_lbs", "type": "number" },
        { "name": "declared_value_usd", "type": "number" },
        { "name": "contents_description", "type": "text" },
        { "name": "special_instructions", "type": "text" },
        { "name": "events", "type": "json" },
        { "name": "photos", "type": "file",
          "options": { "maxSelect": 5, "maxSize": 10485760 }
        },
        { "name": "manifest", "type": "relation",
          "options": { "collectionId": "manifests", "maxSelect": 1 }
        },
        { "name": "location", "type": "text" },
        { "name": "exception_type", "type": "select",
          "options": { "values": ["damage", "wrong_weight", "prohibited_item", "incomplete_info", "other"] }
        },
        { "name": "exception_severity", "type": "select",
          "options": { "values": ["minor", "major", "reject"] }
        },
        { "name": "exception_description", "type": "text" },
        { "name": "exception_photos", "type": "file",
          "options": { "maxSelect": 5, "maxSize": 10485760 }
        },
        { "name": "exception_resolved_at", "type": "date" }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX idx_tracking_number ON packages (tracking_number)",
        "CREATE UNIQUE INDEX idx_qr_code ON packages (qr_code)",
        "CREATE INDEX idx_package_booking ON packages (booking)",
        "CREATE INDEX idx_package_status ON packages (status)"
      ]
    },

    // ==========================================
    // INVOICES
    // ==========================================
    {
      "name": "invoices",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "booking", "type": "relation",
          "options": { "collectionId": "bookings", "maxSelect": 1 }
        },
        { "name": "invoice_number", "type": "text", "required": true },
        { "name": "amount_usd", "type": "number", "required": true },
        { "name": "status", "type": "select", "required": true,
          "options": { "values": ["draft", "pending", "paid", "overdue", "cancelled", "refunded"] }
        },
        { "name": "stripe_payment_intent_id", "type": "text" },
        { "name": "stripe_invoice_id", "type": "text" },
        { "name": "due_date", "type": "date" },
        { "name": "paid_at", "type": "date" },
        { "name": "pdf_url", "type": "text" },
        { "name": "line_items", "type": "json" },
        { "name": "notes", "type": "text" }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX idx_invoice_number ON invoices (invoice_number)"
      ]
    },

    // ==========================================
    // MANIFESTS
    // ==========================================
    {
      "name": "manifests",
      "type": "base",
      "schema": [
        { "name": "manifest_number", "type": "text", "required": true },
        { "name": "destination", "type": "select", "required": true,
          "options": { "values": ["guyana", "jamaica", "trinidad", "barbados", "suriname"] }
        },
        { "name": "flight_number", "type": "text" },
        { "name": "departure_date", "type": "date" },
        { "name": "status", "type": "select", "required": true,
          "options": { "values": ["open", "closed", "in_transit", "arrived", "cleared"] }
        },
        { "name": "total_pieces", "type": "number" },
        { "name": "total_weight_lbs", "type": "number" },
        { "name": "awb_number", "type": "text" },
        { "name": "pdf_url", "type": "text" },
        { "name": "created_by", "type": "relation",
          "options": { "collectionId": "users", "maxSelect": 1 }
        }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX idx_manifest_number ON manifests (manifest_number)"
      ]
    },

    // ==========================================
    // TEMPLATES (NEW)
    // ==========================================
    {
      "name": "templates",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "name", "type": "text", "required": true },
        { "name": "destination", "type": "select", "required": true,
          "options": { "values": ["guyana", "jamaica", "trinidad", "barbados", "suriname"] }
        },
        { "name": "recipient", "type": "relation",
          "options": { "collectionId": "recipients", "maxSelect": 1 }
        },
        { "name": "service_type", "type": "select",
          "options": { "values": ["standard", "express", "door_to_door", "consolidated"] }
        },
        { "name": "default_contents", "type": "text" },
        { "name": "usage_count", "type": "number" },
        { "name": "last_used", "type": "date" }
      ]
    },

    // ==========================================
    // COMMUNICATIONS (NEW)
    // ==========================================
    {
      "name": "communications",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "type", "type": "select", "required": true,
          "options": { "values": ["email", "sms", "phone", "note"] }
        },
        { "name": "direction", "type": "select",
          "options": { "values": ["outbound", "inbound"] }
        },
        { "name": "subject", "type": "text" },
        { "name": "content", "type": "text", "required": true },
        { "name": "sent_by", "type": "relation",
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "sent_at", "type": "date" },
        { "name": "opened_at", "type": "date" },
        { "name": "metadata", "type": "json" }
      ],
      "indexes": [
        "CREATE INDEX idx_comm_user ON communications (user)"
      ]
    },

    // ==========================================
    // SESSIONS (NEW)
    // ==========================================
    {
      "name": "sessions",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "required": true,
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "token_hash", "type": "text", "required": true },
        { "name": "device_info", "type": "text" },
        { "name": "ip_address", "type": "text" },
        { "name": "last_active", "type": "date" },
        { "name": "expires_at", "type": "date" }
      ],
      "indexes": [
        "CREATE INDEX idx_session_user ON sessions (user)",
        "CREATE INDEX idx_session_token ON sessions (token_hash)"
      ]
    },

    // ==========================================
    // ACTIVITY_LOGS
    // ==========================================
    {
      "name": "activity_logs",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation",
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "action", "type": "text", "required": true },
        { "name": "resource_type", "type": "text" },
        { "name": "resource_id", "type": "text" },
        { "name": "metadata", "type": "json" },
        { "name": "ip_address", "type": "text" },
        { "name": "user_agent", "type": "text" }
      ],
      "indexes": [
        "CREATE INDEX idx_activity_user ON activity_logs (user)",
        "CREATE INDEX idx_activity_action ON activity_logs (action)",
        "CREATE INDEX idx_activity_created ON activity_logs (created)"
      ]
    },

    // ==========================================
    // SETTINGS
    // ==========================================
    {
      "name": "settings",
      "type": "base",
      "schema": [
        { "name": "key", "type": "text", "required": true },
        { "name": "value", "type": "json", "required": true },
        { "name": "type", "type": "select",
          "options": { "values": ["string", "number", "boolean", "json"] }
        },
        { "name": "description", "type": "text" }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX idx_setting_key ON settings (key)"
      ]
    },

    // ==========================================
    // QUOTES (for anonymous calculator results)
    // ==========================================
    {
      "name": "quotes",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation",
          "options": { "collectionId": "users", "maxSelect": 1 }
        },
        { "name": "session_id", "type": "text" },
        { "name": "destination", "type": "select", "required": true,
          "options": { "values": ["guyana", "jamaica", "trinidad", "barbados", "suriname"] }
        },
        { "name": "service_type", "type": "select",
          "options": { "values": ["standard", "express"] }
        },
        { "name": "packages", "type": "json" },
        { "name": "total_cost_usd", "type": "number" },
        { "name": "expires_at", "type": "date" },
        { "name": "converted_to_booking", "type": "relation",
          "options": { "collectionId": "bookings", "maxSelect": 1 }
        }
      ]
    }
  ]
}

117. API Specification
17.1 OpenAPI 3.0 Specification
yaml


Copy
openapi: 3.0.3
info:
  title: QCS Cargo API
  description: |
    RESTful API for QCS Cargo shipping platform.
    
    ## Authentication
    Most endpoints require authentication via Bearer token obtained from PocketBase auth.
    Include the token in the Authorization header: `Authorization: Bearer <token>`
    
    ## Rate Limiting
    - Public endpoints: 60 requests/minute
    - Authenticated endpoints: 120 requests/minute
    - Admin endpoints: 300 requests/minute
    
    ## Error Handling
    All errors follow RFC 7807 Problem Details format.
  version: 2.0.0
  contact:
    name: QCS Cargo Support
    email: support@qcscargo.com
  license:
    name: Proprietary

servers:
  - url: https://qcscargo.com/api
    description: Production
  - url: https://staging.qcscargo.com/api
    description: Staging
  - url: http://localhost:5173/api
    description: Local Development

tags:
  - name: Health
    description: System health and status endpoints
  - name: Auth
    description: Authentication and session management
  - name: Quotes
    description: Shipping rate calculations
  - name: Tracking
    description: Public shipment tracking
  - name: Recipients
    description: Saved recipient management
  - name: Bookings
    description: Booking creation and management
  - name: Packages
    description: Package management within bookings
  - name: Invoices
    description: Invoice management and PDFs
  - name: Payments
    description: Stripe payment processing
  - name: Warehouse
    description: Warehouse operations
  - name: Admin
    description: Administrative operations

paths:
  # ==========================================
  # HEALTH & STATUS
  # ==========================================
  /health:
    get:
      tags: [Health]
      summary: System health check
      description: Returns current system health status. Used by load balancers and monitoring.
      operationId: getHealth
      responses:
        '200':
          description: System is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'
        '503':
          description: System is unhealthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

  /status:
    get:
      tags: [Health]
      summary: Service status
      description: Returns detailed status of all services for status page
      operationId: getStatus
      responses:
        '200':
          description: Service status information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StatusResponse'

  # ==========================================
  # AUTHENTICATION
  # ==========================================
  /auth/login:
    post:
      tags: [Auth]
      summary: Login with email/password
      operationId: login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'

  /auth/register:
    post:
      tags: [Auth]
      summary: Register new account
      operationId: register
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: Registration successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: Email already registered

  /auth/logout:
    post:
      tags: [Auth]
      summary: Logout current session
      operationId: logout
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Logged out successfully

  /auth/refresh:
    post:
      tags: [Auth]
      summary: Refresh authentication token
      operationId: refreshToken
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Token refreshed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /auth/forgot-password:
    post:
      tags: [Auth]
      summary: Request password reset email
      operationId: forgotPassword
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
                  format: email
      responses:
        '200':
          description: Reset email sent (always returns 200 to prevent email enumeration)

  /auth/reset-password:
    post:
      tags: [Auth]
      summary: Reset password with token
      operationId: resetPassword
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ResetPasswordRequest'
      responses:
        '200':
          description: Password reset successful
        '400':
          description: Invalid or expired token

  /auth/verify-email/{token}:
    get:
      tags: [Auth]
      summary: Verify email address
      operationId: verifyEmail
      parameters:
        - name: token
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Email verified
        '400':
          description: Invalid or expired token

  /auth/sessions:
    get:
      tags: [Auth]
      summary: List active sessions
      operationId: listSessions
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of active sessions
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Session'

  /auth/sessions/{sessionId}:
    delete:
      tags: [Auth]
      summary: Revoke a session
      operationId: revokeSession
      security:
        - bearerAuth: []
      parameters:
        - name: sessionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Session revoked
        '404':
          description: Session not found

  /auth/sessions/revoke-others:
    post:
      tags: [Auth]
      summary: Revoke all other sessions
      operationId: revokeOtherSessions
      security:
        - bearerAuth: []
      responses:
        '200':
          description: All other sessions revoked

  # ==========================================
  # ACCOUNT MANAGEMENT
  # ==========================================
  /account/profile:
    get:
      tags: [Auth]
      summary: Get current user profile
      operationId: getProfile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
    put:
      tags: [Auth]
      summary: Update profile
      operationId: updateProfile
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateProfileRequest'
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /account/avatar:
    post:
      tags: [Auth]
      summary: Upload avatar
      operationId: uploadAvatar
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                avatar:
                  type: string
                  format: binary
      responses:
        '200':
          description: Avatar uploaded
          content:
            application/json:
              schema:
                type: object
                properties:
                  avatarUrl:
                    type: string

  /account/change-password:
    post:
      tags: [Auth]
      summary: Change password
      operationId: changePassword
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChangePasswordRequest'
      responses:
        '200':
          description: Password changed
        '400':
          description: Invalid current password

  /account/delete:
    post:
      tags: [Auth]
      summary: Request account deletion
      description: Marks account for deletion with 30-day recovery period
      operationId: deleteAccount
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [password]
              properties:
                password:
                  type: string
      responses:
        '200':
          description: Account scheduled for deletion
        '400':
          description: Invalid password

  /account/preferences:
    get:
      tags: [Auth]
      summary: Get notification preferences
      operationId: getPreferences
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Notification preferences
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotificationPreferences'
    put:
      tags: [Auth]
      summary: Update notification preferences
      operationId: updatePreferences
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotificationPreferences'
      responses:
        '200':
          description: Preferences updated

  # ==========================================
  # QUOTES & CALCULATOR
  # ==========================================
  /quotes/calculate:
    post:
      tags: [Quotes]
      summary: Calculate shipping quote
      description: Calculate shipping rates for given parameters. No authentication required.
      operationId: calculateQuote
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QuoteRequest'
      responses:
        '200':
          description: Quote calculated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuoteResponse'
        '400':
          $ref: '#/components/responses/BadRequest'

  /quotes/prohibited-check:
    post:
      tags: [Quotes]
      summary: Check if item is prohibited
      operationId: checkProhibited
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [query]
              properties:
                query:
                  type: string
                  description: Item name or description to check
      responses:
        '200':
          description: Check result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProhibitedCheckResponse'

  /quotes/{quoteId}:
    get:
      tags: [Quotes]
      summary: Get saved quote
      operationId: getQuote
      parameters:
        - name: quoteId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Quote details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SavedQuote'
        '404':
          description: Quote not found or expired

  # ==========================================
  # PUBLIC TRACKING
  # ==========================================
  /tracking/{trackingNumber}:
    get:
      tags: [Tracking]
      summary: Track a package
      description: Public endpoint to track a package by tracking number or QR code
      operationId: trackPackage
      parameters:
        - name: trackingNumber
          in: path
          required: true
          schema:
            type: string
            pattern: '^QCS[A-Z0-9]{10,17}$'
      responses:
        '200':
          description: Tracking information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TrackingResponse'
        '404':
          description: Package not found

  /tracking/bulk:
    post:
      tags: [Tracking]
      summary: Track multiple packages
      operationId: trackBulk
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [trackingNumbers]
              properties:
                trackingNumbers:
                  type: array
                  items:
                    type: string
                  maxItems: 20
      responses:
        '200':
          description: Tracking information for all packages
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TrackingResponse'

  # ==========================================
  # RECIPIENTS
  # ==========================================
  /recipients:
    get:
      tags: [Recipients]
      summary: List saved recipients
      operationId: listRecipients
      security:
        - bearerAuth: []
      parameters:
        - name: destination
          in: query
          schema:
            type: string
            enum: [guyana, jamaica, trinidad, barbados, suriname]
      responses:
        '200':
          description: List of recipients
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Recipient'
    post:
      tags: [Recipients]
      summary: Create recipient
      operationId: createRecipient
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRecipientRequest'
      responses:
        '201':
          description: Recipient created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Recipient'

  /recipients/{recipientId}:
    get:
      tags: [Recipients]
      summary: Get recipient details
      operationId: getRecipient
      security:
        - bearerAuth: []
      parameters:
        - name: recipientId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Recipient details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Recipient'
        '404':
          description: Recipient not found
    put:
      tags: [Recipients]
      summary: Update recipient
      operationId: updateRecipient
      security:
        - bearerAuth: []
      parameters:
        - name: recipientId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRecipientRequest'
      responses:
        '200':
          description: Recipient updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Recipient'
    delete:
      tags: [Recipients]
      summary: Delete recipient
      operationId: deleteRecipient
      security:
        - bearerAuth: []
      parameters:
        - name: recipientId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Recipient deleted

  /recipients/{recipientId}/default:
    post:
      tags: [Recipients]
      summary: Set as default recipient
      operationId: setDefaultRecipient
      security:
        - bearerAuth: []
      parameters:
        - name: recipientId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Default recipient set

  # ==========================================
  # BOOKINGS
  # ==========================================
  /bookings:
    get:
      tags: [Bookings]
      summary: List user's bookings
      operationId: listBookings
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending_payment, confirmed, checked_in, completed, cancelled, no_show]
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: perPage
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of bookings
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedBookings'
    post:
      tags: [Bookings]
      summary: Create booking
      operationId: createBooking
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBookingRequest'
      responses:
        '201':
          description: Booking created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Booking'
        '400':
          $ref: '#/components/responses/BadRequest'

  /bookings/slots:
    get:
      tags: [Bookings]
      summary: Get available time slots
      operationId: getAvailableSlots
      parameters:
        - name: date
          in: query
          required: true
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Available time slots
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TimeSlot'

  /bookings/{bookingId}:
    get:
      tags: [Bookings]
      summary: Get booking details
      operationId: getBooking
      security:
        - bearerAuth: []
      parameters:
        - name: bookingId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Booking details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookingDetail'
        '404':
          description: Booking not found

  /bookings/{bookingId}/modify:
    put:
      tags: [Bookings]
      summary: Modify booking date/time
      operationId: modifyBooking
      security:
        - bearerAuth: []
      parameters:
        - name: bookingId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [scheduledDate, timeSlot]
              properties:
                scheduledDate:
                  type: string
                  format: date
                timeSlot:
                  type: string
      responses:
        '200':
          description: Booking modified
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Booking'
        '400':
          description: Cannot modify (too close to appointment or already completed)

  /bookings/{bookingId}/cancel:
    post:
      tags: [Bookings]
      summary: Cancel booking
      operationId: cancelBooking
      security:
        - bearerAuth: []
      parameters:
        - name: bookingId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
      responses:
        '200':
          description: Booking cancelled
          content:
            application/json:
              schema:
                type: object
                properties:
                  refundAmount:
                    type: number
                  cancellationFee:
                    type: number

  # ==========================================
  # PACKAGES
  # ==========================================
  /bookings/{bookingId}/packages:
    get:
      tags: [Packages]
      summary: List packages in booking
      operationId: listPackages
      security:
        - bearerAuth: []
      parameters:
        - name: bookingId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of packages
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Package'

  /packages/{packageId}:
    get:
      tags: [Packages]
      summary: Get package details
      operationId: getPackage
      security:
        - bearerAuth: []
      parameters:
        - name: packageId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Package details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PackageDetail'

  # ==========================================
  # INVOICES
  # ==========================================
  /invoices:
    get:
      tags: [Invoices]
      summary: List user's invoices
      operationId: listInvoices
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, pending, paid, overdue, cancelled, refunded]
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: perPage
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: List of invoices
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedInvoices'

  /invoices/{invoiceId}:
    get:
      tags: [Invoices]
      summary: Get invoice details
      operationId: getInvoice
      security:
        - bearerAuth: []
      parameters:
        - name: invoiceId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Invoice details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Invoice'

  /invoices/{invoiceId}/pdf:
    get:
      tags: [Invoices]
      summary: Download invoice PDF
      operationId: downloadInvoicePdf
      security:
        - bearerAuth: []
      parameters:
        - name: invoiceId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: PDF file
          content:
            application/pdf:
              schema:
                type: string
                format: binary

  # ==========================================
  # PAYMENTS
  # ==========================================
  /payments/create-intent:
    post:
      tags: [Payments]
      summary: Create Stripe payment intent
      operationId: createPaymentIntent
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePaymentIntentRequest'
      responses:
        '200':
          description: Payment intent created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaymentIntentResponse'

  /payments/webhook:
    post:
      tags: [Payments]
      summary: Stripe webhook handler
      description: Receives Stripe webhook events. Validates webhook signature.
      operationId: stripeWebhook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: Webhook processed

  # ==========================================
  # TEMPLATES
  # ==========================================
  /templates:
    get:
      tags: [Bookings]
      summary: List shipping templates
      operationId: listTemplates
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of templates
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ShippingTemplate'
    post:
      tags: [Bookings]
      summary: Create template
      operationId: createTemplate
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTemplateRequest'
      responses:
        '201':
          description: Template created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShippingTemplate'

  /templates/{templateId}:
    delete:
      tags: [Bookings]
      summary: Delete template
      operationId: deleteTemplate
      security:
        - bearerAuth: []
      parameters:
        - name: templateId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Template deleted

  # ==========================================
  # WAREHOUSE OPERATIONS
  # ==========================================
  /warehouse/scan:
    post:
      tags: [Warehouse]
      summary: Process package scan
      operationId: processScan
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ScanRequest'
      responses:
        '200':
          description: Scan processed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ScanResponse'
        '404':
          description: Package not found

  /warehouse/package/{code}:
    get:
      tags: [Warehouse]
      summary: Lookup package by code
      operationId: lookupPackage
      security:
        - bearerAuth: []
      parameters:
        - name: code
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Package information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WarehousePackageInfo'
        '404':
          description: Package not found

  /warehouse/exception:
    post:
      tags: [Warehouse]
      summary: Report package exception
      operationId: reportException
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/ExceptionReportRequest'
      responses:
        '200':
          description: Exception reported

  /warehouse/weight-discrepancy:
    post:
      tags: [Warehouse]
      summary: Handle weight discrepancy
      operationId: handleWeightDiscrepancy
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WeightDiscrepancyRequest'
      responses:
        '200':
          description: Discrepancy handled
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WeightDiscrepancyResponse'

  /warehouse/inventory:
    get:
      tags: [Warehouse]
      summary: List warehouse inventory
      operationId: getInventory
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
        - name: destination
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Inventory list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedInventory'

  # ==========================================
  # ADMIN ENDPOINTS
  # ==========================================
  /admin/dashboard:
    get:
      tags: [Admin]
      summary: Get admin dashboard data
      operationId: getAdminDashboard
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Dashboard data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdminDashboard'

  /admin/users:
    get:
      tags: [Admin]
      summary: List all users
      operationId: adminListUsers
      security:
        - bearerAuth: []
      parameters:
        - name: q
          in: query
          description: Search query
          schema:
            type: string
        - name: role
          in: query
          schema:
            type: string
            enum: [customer, staff, admin]
        - name: page
          in: query
          schema:
            type: integer
        - name: perPage
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedUsers'

  /admin/users/{userId}:
    get:
      tags: [Admin]
      summary: Get user details
      operationId: adminGetUser
      security:
        - bearerAuth: []
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User details with related data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdminUserDetail'
    put:
      tags: [Admin]
      summary: Update user
      operationId: adminUpdateUser
      security:
        - bearerAuth: []
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AdminUpdateUserRequest'
      responses:
        '200':
          description: User updated

  /admin/users/export:
    get:
      tags: [Admin]
      summary: Export users to CSV
      operationId: exportUsers
      security:
        - bearerAuth: []
      parameters:
        - name: role
          in: query
          schema:
            type: string
      responses:
        '200':
          description: CSV file
          content:
            text/csv:
              schema:
                type: string

  /admin/shipments:
    get:
      tags: [Admin]
      summary: List all shipments
      operationId: adminListShipments
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
        - name: destination
          in: query
          schema:
            type: string
        - name: q
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: List of shipments
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedShipments'

  /admin/shipments/{packageId}/status:
    put:
      tags: [Admin]
      summary: Update package status
      operationId: adminUpdateStatus
      security:
        - bearerAuth: []
      parameters:
        - name: packageId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [pending, received, processing, in_transit, customs, out_for_delivery, delivered, exception, cancelled]
                note:
                  type: string
      responses:
        '200':
          description: Status updated

  /admin/shipments/bulk-status:
    put:
      tags: [Admin]
      summary: Bulk update package status
      operationId: adminBulkUpdateStatus
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [packageIds, status]
              properties:
                packageIds:
                  type: array
                  items:
                    type: string
                status:
                  type: string
                note:
                  type: string
      responses:
        '200':
          description: Statuses updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  updated:
                    type: integer
                  failed:
                    type: integer

  /admin/manifests:
    get:
      tags: [Admin]
      summary: List manifests
      operationId: listManifests
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
        - name: destination
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of manifests
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Manifest'
    post:
      tags: [Admin]
      summary: Create manifest
      operationId: createManifest
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateManifestRequest'
      responses:
        '201':
          description: Manifest created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Manifest'

  /admin/manifests/{manifestId}/close:
    post:
      tags: [Admin]
      summary: Close manifest
      operationId: closeManifest
      security:
        - bearerAuth: []
      parameters:
        - name: manifestId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                flightNumber:
                  type: string
                departureDate:
                  type: string
                  format: date-time
                awbNumber:
                  type: string
      responses:
        '200':
          description: Manifest closed

  /admin/manifests/{manifestId}/pdf:
    get:
      tags: [Admin]
      summary: Download manifest PDF
      operationId: downloadManifestPdf
      security:
        - bearerAuth: []
      parameters:
        - name: manifestId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: PDF file
          content:
            application/pdf:
              schema:
                type: string
                format: binary

  /admin/activity:
    get:
      tags: [Admin]
      summary: View activity log
      operationId: getActivityLog
      security:
        - bearerAuth: []
      parameters:
        - name: action
          in: query
          schema:
            type: string
        - name: userId
          in: query
          schema:
            type: string
        - name: resourceType
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Activity log entries
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedActivityLog'

  /admin/communications:
    post:
      tags: [Admin]
      summary: Send communication to user
      operationId: sendCommunication
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SendCommunicationRequest'
      responses:
        '200':
          description: Communication sent

  /admin/communications/bulk:
    post:
      tags: [Admin]
      summary: Send bulk communication
      operationId: sendBulkCommunication
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BulkCommunicationRequest'
      responses:
        '200':
          description: Bulk communication queued
          content:
            application/json:
              schema:
                type: object
                properties:
                  queued:
                    type: integer
                  jobId:
                    type: string

  /admin/settings:
    get:
      tags: [Admin]
      summary: Get system settings
      operationId: getSettings
      security:
        - bearerAuth: []
      responses:
        '200':
          description: System settings
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true
    put:
      tags: [Admin]
      summary: Update system settings
      operationId: updateSettings
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        '200':
          description: Settings updated

  # ==========================================
  # QR CODE GENERATION
  # ==========================================
  /qr/{code}:
    get:
      tags: [Health]
      summary: Generate QR code image
      operationId: generateQrCode
      parameters:
        - name: code
          in: path
          required: true
          schema:
            type: string
        - name: size
          in: query
          schema:
            type: integer
            default: 200
      responses:
        '200':
          description: QR code image
          content:
            image/png:
              schema:
                type: string
                format: binary

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: PocketBase JWT token

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    RateLimited:
      description: Too many requests
      headers:
        Retry-After:
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  schemas:
    # ==========================================
    # COMMON SCHEMAS
    # ==========================================
    Error:
      type: object
      required:
        - type
        - title
        - status
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string

    Pagination:
      type: object
      properties:
        page:
          type: integer
        perPage:
          type: integer
        totalItems:
          type: integer
        totalPages:
          type: integer

    # ==========================================
    # HEALTH & STATUS
    # ==========================================
    HealthResponse:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, unhealthy]
        timestamp:
          type: string
          format: date-time
        version:
          type: string
        checks:
          type: object
          properties:
            database:
              type: string
            storage:
              type: string

    StatusResponse:
      type: object
      properties:
        services:
          type: array
          items:
            type: object
            properties:
              name:
                type: string
              status:
                type: string
                enum: [operational, degraded, outage, maintenance]
              description:
                type: string
        incidents:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              title:
                type: string
              status:
                type: string
              createdAt:
                type: string
                format: date-time
        lastUpdated:
          type: string
          format: date-time

    # ==========================================
    # AUTH SCHEMAS
    # ==========================================
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        remember:
          type: boolean
          default: false

    RegisterRequest:
      type: object
      required:
        - email
        - password
        - passwordConfirm
        - name
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        passwordConfirm:
          type: string
        name:
          type: string
          minLength: 2
        phone:
          type: string

    ResetPasswordRequest:
      type: object
      required:
        - token
        - password
        - passwordConfirm
      properties:
        token:
          type: string
        password:
          type: string
          minLength: 8
        passwordConfirm:
          type: string

    ChangePasswordRequest:
      type: object
      required:
        - currentPassword
        - newPassword
        - newPasswordConfirm
      properties:
        currentPassword:
          type: string
        newPassword:
          type: string
          minLength: 8
        newPasswordConfirm:
          type: string

    AuthResponse:
      type: object
      properties:
        token:
          type: string
        user:
          $ref: '#/components/schemas/User'

    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        phone:
          type: string
        role:
          type: string
          enum: [customer, staff, admin]
        avatar:
          type: string
        verified:
          type: boolean
        mailbox:
          $ref: '#/components/schemas/Mailbox'
        createdAt:
          type: string
          format: date-time

    Mailbox:
      type: object
      properties:
        id:
          type: string
        suiteCode:
          type: string
        status:
          type: string
          enum: [active, suspended, closed]

    Session:
      type: object
      properties:
        id:
          type: string
        deviceInfo:
          type: string
        ipAddress:
          type: string
        lastActive:
          type: string
          format: date-time
        current:
          type: boolean

    UpdateProfileRequest:
      type: object
      properties:
        name:
          type: string
        phone:
          type: string
        addressLine1:
          type: string
        addressLine2:
          type: string
        city:
          type: string
        state:
          type: string
        zip:
          type: string
        country:
          type: string

    NotificationPreferences:
      type: object
      properties:
        notificationEmail:
          type: boolean
        notificationSms:
          type: boolean
        notifyReceived:
          type: boolean
        notifyProcessing:
          type: boolean
        notifyTransit:
          type: boolean
        notifyCustoms:
          type: boolean
        notifyDelivery:
          type: boolean
        notifyDelivered:
          type: boolean
        marketingEmail:
          type: boolean
        serviceUpdates:
          type: boolean

    # ==========================================
    # QUOTE SCHEMAS
    # ==========================================
    QuoteRequest:
      type: object
      required:
        - destination
      properties:
        packages:
          type: array
          items:
            type: object
            properties:
              weight:
                type: number
              weightUnknown:
                type: boolean
              length:
                type: number
              width:
                type: number
              height:
                type: number
              declaredValue:
                type: number
        destination:
          type: string
          enum: [guyana, jamaica, trinidad, barbados, suriname]
        serviceType:
          type: string
          enum: [standard, express]
          default: standard

    QuoteResponse:
      type: object
      properties:
        packages:
          type: array
          items:
            type: object
            properties:
              actualWeight:
                type: number
              dimWeight:
                type: number
              billableWeight:
                type: number
              cost:
                type: number
        subtotal:
          type: number
        multiPackageDiscount:
          type: number
        insuranceCost:
          type: number
        totalCost:
          type: number
        transitDays:
          type: string
        estimatedDelivery:
          type: object
          properties:
            earliest:
              type: string
              format: date
            latest:
              type: string
              format: date
        seaComparison:
          type: object
          properties:
            totalCost:
              type: number
            transitDays:
              type: string
            savings:
              type: number
        quoteId:
          type: string
          description: ID to retrieve quote later
        expiresAt:
          type: string
          format: date-time

    SavedQuote:
      allOf:
        - $ref: '#/components/schemas/QuoteResponse'
        - type: object
          properties:
            createdAt:
              type: string
              format: date-time

    ProhibitedCheckResponse:
      type: object
      properties:
        query:
          type: string
        status:
          type: string
          enum: [allowed, restricted, prohibited]
        item:
          type: object
          properties:
            name:
              type: string
            category:
              type: string
            reason:
              type: string
            note:
              type: string

    # ==========================================
    # TRACKING SCHEMAS
    # ==========================================
    TrackingResponse:
      type: object
      properties:
        trackingNumber:
          type: string
        status:
          type: string
        statusLabel:
          type: string
        destination:
          type: string
        destinationLabel:
          type: string
        serviceType:
          type: string
        estimatedDelivery:
          type: object
          properties:
            earliest:
              type: string
              format: date
            latest:
              type: string
              format: date
            formatted:
              type: string
        events:
          type: array
          items:
            $ref: '#/components/schemas/TrackingEvent'

    TrackingEvent:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        status:
          type: string
        location:
          type: string
        message:
          type: string

    # ==========================================
    # RECIPIENT SCHEMAS
    # ==========================================
    Recipient:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        phone:
          type: string
        addressLine1:
          type: string
        addressLine2:
          type: string
        city:
          type: string
        destination:
          type: string
        destinationLabel:
          type: string
        deliveryInstructions:
          type: string
        isDefault:
          type: boolean
        usageCount:
          type: integer
        createdAt:
          type: string
          format: date-time

    CreateRecipientRequest:
      type: object
      required:
        - name
        - phone
        - addressLine1
        - city
        - destination
      properties:
        name:
          type: string
        phone:
          type: string
        addressLine1:
          type: string
        addressLine2:
          type: string
        city:
          type: string
        destination:
          type: string
          enum: [guyana, jamaica, trinidad, barbados, suriname]
        deliveryInstructions:
          type: string
        isDefault:
          type: boolean

    # ==========================================
    # BOOKING SCHEMAS
    # ==========================================
    TimeSlot:
      type: object
      properties:
        slot:
          type: string
        available:
          type: boolean
        remainingCapacity:
          type: integer

    CreateBookingRequest:
      type: object
      required:
        - destination
        - serviceType
        - packages
        - recipientId
        - scheduledDate
        - timeSlot
      properties:
        destination:
          type: string
          enum: [guyana, jamaica, trinidad, barbados, suriname]
        serviceType:
          type: string
          enum: [standard, express, door_to_door, consolidated]
        packages:
          type: array
          items:
            type: object
            properties:
              weight:
                type: number
              weightUnknown:
                type: boolean
              length:
                type: number
              width:
                type: number
              height:
                type: number
              declaredValue:
                type: number
              contentsDescription:
                type: string
              specialInstructions:
                type: string
        recipientId:
          type: string
        newRecipient:
          $ref: '#/components/schemas/CreateRecipientRequest'
        scheduledDate:
          type: string
          format: date
        timeSlot:
          type: string
        saveAsTemplate:
          type: boolean
        templateName:
          type: string

    Booking:
      type: object
      properties:
        id:
          type: string
        destination:
          type: string
        serviceType:
          type: string
        scheduledDate:
          type: string
          format: date
        timeSlot:
          type: string
        status:
          type: string
        packageCount:
          type: integer
        totalCost:
          type: number
        paymentStatus:
          type: string
        createdAt:
          type: string
          format: date-time

    BookingDetail:
      allOf:
        - $ref: '#/components/schemas/Booking'
        - type: object
          properties:
            recipient:
              $ref: '#/components/schemas/Recipient'
            packages:
              type: array
              items:
                $ref: '#/components/schemas/Package'
            invoice:
              $ref: '#/components/schemas/Invoice'
            quoteData:
              $ref: '#/components/schemas/QuoteResponse'

    PaginatedBookings:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Booking'
        pagination:
          $ref: '#/components/schemas/Pagination'

    # ==========================================
    # PACKAGE SCHEMAS
    # ==========================================
    Package:
      type: object
      properties:
        id:
          type: string
        trackingNumber:
          type: string
        qrCode:
          type: string
        status:
          type: string
        weightLbs:
          type: number
        weightActual:
          type: number
        billableWeightLbs:
          type: number
        declaredValueUsd:
          type: number
        contentsDescription:
          type: string

    PackageDetail:
      allOf:
        - $ref: '#/components/schemas/Package'
        - type: object
          properties:
            booking:
              $ref: '#/components/schemas/Booking'
            lengthIn:
              type: number
            widthIn:
              type: number
            heightIn:
              type: number
            dimWeightLbs:
              type: number
            specialInstructions:
              type: string
            events:
              type: array
              items:
                $ref: '#/components/schemas/TrackingEvent'
            photos:
              type: array
              items:
                type: string
            location:
              type: string
            exception:
              type: object
              properties:
                type:
                  type: string
                severity:
                  type: string
                description:
                  type: string

    # ==========================================
    # INVOICE SCHEMAS
    # ==========================================
    Invoice:
      type: object
      properties:
        id:
          type: string
        invoiceNumber:
          type: string
        amountUsd:
          type: number
        status:
          type: string
          enum: [draft, pending, paid, overdue, cancelled, refunded]
        dueDate:
          type: string
          format: date
        paidAt:
          type: string
          format: date-time
        lineItems:
          type: array
          items:
            type: object
            properties:
              description:
                type: string
              amount:
                type: number
        createdAt:
          type: string
          format: date-time

    PaginatedInvoices:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Invoice'
        pagination:
          $ref: '#/components/schemas/Pagination'

    # ==========================================
    # PAYMENT SCHEMAS
    # ==========================================
    CreatePaymentIntentRequest:
      type: object
      required:
        - amount
        - bookingId
      properties:
        amount:
          type: number
          minimum: 1
        bookingId:
          type: string

    PaymentIntentResponse:
      type: object
      properties:
        clientSecret:
          type: string
        paymentIntentId:
          type: string

    # ==========================================
    # TEMPLATE SCHEMAS
    # ==========================================
    ShippingTemplate:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        destination:
          type: string
        recipient:
          $ref: '#/components/schemas/Recipient'
        serviceType:
          type: string
        defaultContents:
          type: string
        usageCount:
          type: integer
        lastUsed:
          type: string
          format: date-time

    CreateTemplateRequest:
      type: object
      required:
        - name
        - destination
      properties:
        name:
          type: string
        destination:
          type: string
        recipientId:
          type: string
        serviceType:
          type: string
        defaultContents:
          type: string

    # ==========================================
    # WAREHOUSE SCHEMAS
    # ==========================================
    ScanRequest:
      type: object
      required:
        - code
        - action
      properties:
        code:
          type: string
        action:
          type: string
          enum: [receive, process, dispatch]
        weight:
          type: number
        length:
          type: number
        width:
          type: number
        height:
          type: number
        location:
          type: string
        notes:
          type: string

    ScanResponse:
      type: object
      properties:
        success:
          type: boolean
        package:
          $ref: '#/components/schemas/WarehousePackageInfo'
        message:
          type: string
        warnings:
          type: array
          items:
            type: string

    WarehousePackageInfo:
      type: object
      properties:
        trackingNumber:
          type: string
        customerName:
          type: string
        customerEmail:
          type: string
        destination:
          type: string
        expectedWeight:
          type: number
        bookingDate:
          type: string
          format: date
        status:
          type: string
        specialInstructions:
          type: string

    ExceptionReportRequest:
      type: object
      required:
        - trackingNumber
        - type
        - severity
        - description
      properties:
        trackingNumber:
          type: string
        type:
          type: string
          enum: [damage, wrong_weight, prohibited_item, incomplete_info, other]
        severity:
          type: string
          enum: [minor, major, reject]
        description:
          type: string
        photos:
          type: array
          items:
            type: string
            format: binary

    WeightDiscrepancyRequest:
      type: object
      required:
        - trackingNumber
        - actualWeight
        - action
      properties:
        trackingNumber:
          type: string
        actualWeight:
          type: number
        action:
          type: string
          enum: [proceed, hold_and_notify]

    WeightDiscrepancyResponse:
      type: object
      properties:
        success:
          type: boolean
        additionalCost:
          type: number
        customerNotified:
          type: boolean
        newStatus:
          type: string

    PaginatedInventory:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Package'
        pagination:
          $ref: '#/components/schemas/Pagination'
        summary:
          type: object
          properties:
            totalPieces:
              type: integer
            totalWeight:
              type: number
            byDestination:
              type: object
              additionalProperties:
                type: integer

    # ==========================================
    # MANIFEST SCHEMAS
    # ==========================================
    Manifest:
      type: object
      properties:
        id:
          type: string
        manifestNumber:
          type: string
        destination:
          type: string
        flightNumber:
          type: string
        departureDate:
          type: string
          format: date-time
        status:
          type: string
        totalPieces:
          type: integer
        totalWeightLbs:
          type: number
        awbNumber:
          type: string
        createdAt:
          type: string
          format: date-time

    CreateManifestRequest:
      type: object
      required:
        - destination
        - packageIds
      properties:
        destination:
          type: string
          enum: [guyana, jamaica, trinidad, barbados, suriname]
        packageIds:
          type: array
          items:
            type: string
        flightNumber:
          type: string
        departureDate:
          type: string
          format: date

    # ==========================================
    # ADMIN SCHEMAS
    # ==========================================
    AdminDashboard:
      type: object
      properties:
        stats:
          type: object
          properties:
            todaysBookings:
              type: integer
            bookingsChange:
              type: number
            activeShipments:
              type: integer
            shipmentsChange:
              type: number
            weeklyRevenue:
              type: number
            revenueChange:
              type: number
            totalCustomers:
              type: integer
            customersChange:
              type: number
            pendingIssues:
              type: integer
        recentActivity:
          type: array
          items:
            $ref: '#/components/schemas/ActivityLogEntry'
        upcomingBookings:
          type: array
          items:
            $ref: '#/components/schemas/Booking'
        revenueData:
          type: array
          items:
            type: object
            properties:
              date:
                type: string
              amount:
                type: number
        destinationData:
          type: array
          items:
            type: object
            properties:
              destination:
                type: string
              count:
                type: integer

    AdminUserDetail:
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            shipmentCount:
              type: integer
            totalSpent:
              type: number
            recentBookings:
              type: array
              items:
                $ref: '#/components/schemas/Booking'
            communications:
              type: array
              items:
                $ref: '#/components/schemas/Communication'

    AdminUpdateUserRequest:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
        phone:
          type: string
        role:
          type: string
          enum: [customer, staff, admin]
        mailboxStatus:
          type: string
          enum: [active, suspended, closed]

    PaginatedUsers:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          $ref: '#/components/schemas/Pagination'

    PaginatedShipments:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/PackageDetail'
        pagination:
          $ref: '#/components/schemas/Pagination'

    ActivityLogEntry:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        userName:
          type: string
        action:
          type: string
        resourceType:
          type: string
        resourceId:
          type: string
        metadata:
          type: object
        ipAddress:
          type: string
        userAgent:
          type: string
        createdAt:
          type: string
          format: date-time

    PaginatedActivityLog:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/ActivityLogEntry'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Communication:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [email, sms, phone, note]
        direction:
          type: string
          enum: [outbound, inbound]
        subject:
          type: string
        content:
          type: string
        sentBy:
          type: string
        sentByName:
          type: string
        sentAt:
          type: string
          format: date-time
        openedAt:
          type: string
          format: date-time

    SendCommunicationRequest:
      type: object
      required:
        - userId
        - type
        - content
      properties:
        userId:
          type: string
        type:
          type: string
          enum: [email, note]
        subject:
          type: string
        content:
          type: string

    BulkCommunicationRequest:
      type: object
      required:
        - type
        - subject
        - content
      properties:
        type:
          type: string
          enum: [email]
        subject:
          type: string
        content:
          type: string
        filters:
          type: object
          properties:
            destination:
              type: string
            hasActiveShipment:
              type: boolean
            role:
              type: string

18. Component Library Specification
18.1 Design System Tokens
css


Copy
/* src/app.css - Design System Tokens */

:root {
  /* ==========================================
   * COLOR PALETTE
   * ========================================== */
  
  /* Primary - Blue (Trust, Reliability) */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* Secondary - Slate (Neutral, Professional) */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-200: #e2e8f0;
  --color-secondary-300: #cbd5e1;
  --color-secondary-400: #94a3b8;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-700: #334155;
  --color-secondary-800: #1e293b;
  --color-secondary-900: #0f172a;
  --color-secondary-950: #020617;

  /* Success - Green */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  /* Warning - Amber */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  /* Error - Red */
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Info - Blue (lighter) */
  --color-info-50: #ecfeff;
  --color-info-100: #cffafe;
  --color-info-500: #06b6d4;
  --color-info-600: #0891b2;
  
  /* ==========================================
   * TYPOGRAPHY
   * ========================================== */
  
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  
  /* Font Sizes (using fluid typography) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);      /* 12-13px */
  --text-sm: clamp(0.8125rem, 0.775rem + 0.1875vw, 0.875rem); /* 13-14px */
  --text-base: clamp(0.875rem, 0.85rem + 0.125vw, 1rem);      /* 14-16px */
  --text-lg: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);         /* 16-18px */
  --text-xl: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);     /* 18-20px */
  --text-2xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);        /* 20-24px */
  --text-3xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem);      /* 24-30px */
  --text-4xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem);    /* 30-36px */
  --text-5xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);          /* 36-48px */
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;

  /* ==========================================
   * SPACING
   * ========================================== */
  
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* ==========================================
   * BORDERS & RADIUS
   * ========================================== */
  
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-3xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
  
  --border-width-1: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;

  /* ==========================================
   * SHADOWS
   * ========================================== */
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* ==========================================
   * TRANSITIONS
   * ========================================== */
  
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* ==========================================
   * Z-INDEX SCALE
   * ========================================== */
  
  --z-0: 0;
  --z-10: 10;
  --z-20: 20;
  --z-30: 30;
  --z-40: 40;
  --z-50: 50;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;

  /* ==========================================
   * BREAKPOINTS (for reference)
   * ========================================== */
  
  /* 
   * --screen-sm: 640px;
   * --screen-md: 768px;
   * --screen-lg: 1024px;
   * --screen-xl: 1280px;
   * --screen-2xl: 1536px;
   */

  /* ==========================================
   * FOCUS RING
   * ========================================== */
  
  --ring-color: var(--color-primary-500);
  --ring-offset: 2px;
  --ring-width: 2px;
}

/* Dark mode overrides (optional) */
@media (prefers-color-scheme: dark) {
  :root {
    /* Invert primary shades */
    --color-primary-600: #60a5fa;
    --color-primary-700: #93c5fd;
    
    /* Adjust background */
    --color-secondary-50: #0f172a;
    --color-secondary-100: #1e293b;
    --color-secondary-900: #f8fafc;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
18.2 Component Variants
typescript


Copy
// src/lib/components/ui/button/variants.ts

import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center rounded-lg font-medium 
   transition-colors duration-200 
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          bg-primary-600 text-white 
          hover:bg-primary-700 
          focus-visible:ring-primary-500
        `,
        secondary: `
          bg-secondary-100 text-secondary-900 
          hover:bg-secondary-200 
          focus-visible:ring-secondary-500
        `,
        outline: `
          border-2 border-secondary-300 bg-transparent text-secondary-700
          hover:bg-secondary-50 hover:border-secondary-400
          focus-visible:ring-secondary-500
        `,
        ghost: `
          bg-transparent text-secondary-700
          hover:bg-secondary-100
          focus-visible:ring-secondary-500
        `,
        destructive: `
          bg-error-600 text-white 
          hover:bg-error-700 
          focus-visible:ring-error-500
        `,
        success: `
          bg-success-600 text-white 
          hover:bg-success-700 
          focus-visible:ring-success-500
        `,
        link: `
          text-primary-600 underline-offset-4
          hover:underline
          focus-visible:ring-primary-500
        `,
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2',
        xl: 'h-14 px-8 text-lg gap-3',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
typescript


Copy
// src/lib/components/ui/input/variants.ts

import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  // Base styles
  `w-full rounded-lg border bg-white px-3 py-2 text-sm
   transition-colors duration-200
   placeholder:text-secondary-400
   focus:outline-none focus:ring-2 focus:ring-offset-0
   disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          border-secondary-300 
          hover:border-secondary-400
          focus:border-primary-500 focus:ring-primary-200
        `,
        error: `
          border-error-500 
          hover:border-error-600
          focus:border-error-500 focus:ring-error-200
          text-error-900 placeholder:text-error-400
        `,
        success: `
          border-success-500 
          hover:border-success-600
          focus:border-success-500 focus:ring-success-200
        `,
      },
      inputSize: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;
typescript


Copy
// src/lib/components/ui/badge/variants.ts

import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-secondary-100 text-secondary-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
        info: 'bg-info-100 text-info-800',
        outline: 'border border-secondary-300 text-secondary-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Status-specific badges for shipments
export const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        pending: 'bg-secondary-100 text-secondary-800',
        received: 'bg-blue-100 text-blue-800',
        processing: 'bg-purple-100 text-purple-800',
        in_transit: 'bg-cyan-100 text-cyan-800',
        customs: 'bg-orange-100 text-orange-800',
        out_for_delivery: 'bg-amber-100 text-amber-800',
        delivered: 'bg-success-100 text-success-800',
        exception: 'bg-error-100 text-error-800',
        cancelled: 'bg-secondary-100 text-secondary-500',
      },
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type StatusBadgeVariants = VariantProps<typeof statusBadgeVariants>;
18.3 Component Documentation
typescript


Copy
// Component Documentation Template
// Each component should follow this structure

/**
 * @component Button
 * @description Primary interactive element for user actions
 * 
 * @accessibility
 * - Uses native <button> element
 * - Includes focus ring for keyboard navigation
 * - Disabled state removes from tab order
 * - Loading state announces to screen readers
 * 
 * @usage
 * ```svelte
 * <Button variant="default" size="md" on:click={handleClick}>
 *   Click Me
 * </Button>
 * 
 * <Button variant="outline" disabled>
 *   Disabled
 * </Button>
 * 
 * <Button loading>
 *   Processing...
 * </Button>
 * ```
 * 
 * @props
 * - variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'link'
 * - size: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'
 * - disabled: boolean
 * - loading: boolean
 * - fullWidth: boolean
 * - type: 'button' | 'submit' | 'reset'
 * - href: string (renders as <a> if provided)
 * 
 * @events
 * - on:click
 * 
 * @slots
 * - default: Button content
 */
18.4 Icon System
typescript


Copy
// src/lib/config/icons.ts
// Centralized icon imports from lucide-svelte

export {
  // Navigation
  Home,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Pencil,
  Trash2,
  Copy,
  Download,
  Upload,
  Send,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  MoreHorizontal,
  
  // Status & Feedback
  Check,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  Loader2,
  
  // Objects
  Package,
  Box,
  Truck,
  Plane,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Users,
  CreditCard,
  Receipt,
  FileText,
  Image,
  Camera,
  QrCode,
  Barcode,
  
  // Features
  Settings,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Bell,
  Star,
  Heart,
  
  // Data
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  
  // Communication
  MessageSquare,
  MessageCircle,
  
  // Devices
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  
  // Misc
  Sun,
  Moon,
  Globe,
  Scale,
  Ruler,
  DollarSign,
} from 'lucide-svelte';

// Icon size guidelines
export const ICON_SIZES = {
  xs: 'w-3 h-3',   // 12px - inline with small text
  sm: 'w-4 h-4',   // 16px - buttons, badges
  md: 'w-5 h-5',   // 20px - default
  lg: 'w-6 h-6',   // 24px - prominent icons
  xl: 'w-8 h-8',   // 32px - empty states
  '2xl': 'w-10 h-10', // 40px - hero sections
};

19. Accessibility Requirements
19.1 WCAG 2.1 AA Compliance Checklist
Perceivable
Criterion	Requirement	Implementation	Testing
1.1.1 Non-text Content	All images have alt text	<img alt="..."> on all images	axe-core, manual
1.2.1 Audio-only/Video-only	Provide transcripts	N/A (no audio/video content)	—
1.3.1 Info and Relationships	Use semantic HTML	Proper heading hierarchy, lists, tables	axe-core, WAVE
1.3.2 Meaningful Sequence	Reading order matches visual order	DOM order matches layout	Tab navigation test
1.3.3 Sensory Characteristics	Don't rely on shape/color alone	Icons + text, color + pattern	Manual review
1.4.1 Use of Color	Color not sole indicator	Status badges use icon + text	Manual review
1.4.2 Audio Control	User can pause/stop audio	N/A	—
1.4.3 Contrast (Minimum)	4.5

for text, 3

for large text	Design tokens validated	Contrast checker
1.4.4 Resize Text	200% zoom without loss	Fluid typography, responsive	Browser zoom test
1.4.5 Images of Text	Use real text	SVG logos only	Manual review
1.4.10 Reflow	Content reflows at 320px	Mobile-first design	320px viewport test
1.4.11 Non-text Contrast	3

for UI components	Focus rings, borders validated	Contrast checker
1.4.12 Text Spacing	Override text spacing works	No fixed heights on text containers	Text spacing bookmarklet
1.4.13 Content on Hover	Hover content dismissible/hoverable	Tooltips follow pattern	Manual test
Operable
Criterion	Requirement	Implementation	Testing
2.1.1 Keyboard	All functionality via keyboard	Tab navigation, Enter/Space activation	Keyboard-only testing
2.1.2 No Keyboard Trap	Focus can always escape	Modal focus trap with Escape	Tab through all modals
2.1.4 Character Key Shortcuts	Single-key shortcuts configurable	Command palette only (Cmd+K)	—
2.2.1 Timing Adjustable	Session timeout warning	Session expiry modal with extend option	Manual test
2.2.2 Pause, Stop, Hide	User can pause animations	prefers-reduced-motion respected	Reduced motion test
2.3.1 Three Flashes	No content flashes >3x/sec	No flashing content	Visual review
2.4.1 Bypass Blocks	Skip to main content link	<SkipLink> component	Tab from page load
2.4.2 Page Titled	Descriptive page titles	<svelte:head><title> on all pages	Review each page
2.4.3 Focus Order	Logical focus order	DOM order matches visual	Tab through pages
2.4.4 Link Purpose	Link text is descriptive	"View shipment details" not "Click here"	Content audit
2.4.5 Multiple Ways	Multiple ways to find pages	Nav + search + sitemap	Feature check
2.4.6 Headings and Labels	Descriptive headings/labels	Clear, unique headings	Heading outline tool
2.4.7 Focus Visible	Focus indicator visible	2px blue ring, 2px offset	Keyboard navigation
2.5.1 Pointer Gestures	Single-pointer alternative	No multi-touch required	Touch device test
2.5.2 Pointer Cancellation	Can cancel before release	Standard click behavior	Manual test
2.5.3 Label in Name	Accessible name includes visible text	Label matches aria-label	axe-core
2.5.4 Motion Actuation	Motion not required	No shake/tilt features	—
Understandable
Criterion	Requirement	Implementation	Testing
3.1.1 Language of Page	Page language declared	<html lang="en">	HTML validation
3.1.2 Language of Parts	Mark up language changes	N/A (English only v2.0)	—
3.2.1 On Focus	No context change on focus	Standard focus behavior	Keyboard test
3.2.2 On Input	No unexpected context changes	Forms submit on explicit action	Form testing
3.2.3 Consistent Navigation	Navigation consistent	Same sidebar/header on all pages	Visual review
3.2.4 Consistent Identification	Same function = same name	Audit button/link labels	Content audit
3.3.1 Error Identification	Errors clearly identified	Form validation messages	Form error testing
3.3.2 Labels or Instructions	Form fields have labels	All inputs have visible labels	axe-core
3.3.3 Error Suggestion	Error messages suggest fix	"Password must contain..."	Form testing
3.3.4 Error Prevention	Confirm destructive actions	<ConfirmDialog> component	Manual test
Robust
Criterion	Requirement	Implementation	Testing
4.1.1 Parsing	Valid HTML	No duplicate IDs, proper nesting	HTML validator
4.1.2 Name, Role, Value	ARIA properly used	Correct roles and states	axe-core
4.1.3 Status Messages	Status announced	aria-live regions for toasts	Screen reader
19.2 Testing Procedures
typescript


Copy
// playwright.config.ts - Accessibility testing setup

import { defineConfig } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [
    {
      name: 'a11y',
      testMatch: '**/*.a11y.ts',
    },
  ],
});
typescript


Copy
// tests/a11y/pages.a11y.ts

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Calculator', path: '/shipping-calculator' },
  { name: 'Track', path: '/track' },
  { name: 'Contact', path: '/contact' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
];

for (const page of pages) {
  test(`${page.name} page has no accessibility violations`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await injectAxe(browserPage);
    
    const violations = await getViolations(browserPage, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
    
    // Log violations for debugging
    if (violations.length > 0) {
      console.log(`\n${page.name} Accessibility Violations:`);
      violations.forEach((v) => {
        console.log(`- ${v.id}: ${v.description}`);
        console.log(`  Impact: ${v.impact}`);
        console.log(`  Elements: ${v.nodes.length}`);
      });
    }
    
    expect(violations.length).toBe(0);
  });
}

// Test specific components
test.describe('Component Accessibility', () => {
  test('Button has correct role and is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    const button = page.getByRole('button', { name: /get.*quote/i });
    
    // Check role
    await expect(button).toHaveRole('button');
    
    // Check keyboard access
    await button.focus();
    await expect(button).toBeFocused();
    
    // Check visible focus
    const focusRing = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.boxShadow;
    });
    expect(focusRing).not.toBe('none');
  });

  test('Modal traps focus correctly', async ({ page }) => {
    await page.goto('/dashboard/bookings/new');
    
    // Open a modal (e.g., confirm dialog)
    await page.getByRole('button', { name: /cancel/i }).click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Focus should be inside modal
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    const isInsideModal = await dialog.evaluate((modal, focused) => {
      return modal.contains(document.activeElement);
    });
    expect(isInsideModal).toBe(true);
    
    // Tab should cycle within modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const stillInsideModal = await dialog.evaluate((modal) => {
      return modal.contains(document.activeElement);
    });
    expect(stillInsideModal).toBe(true);
    
    // Escape should close
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('Form errors are announced to screen readers', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Submit empty form
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Check error is associated with input
    const emailInput = page.getByLabel(/email/i);
    const errorId = await emailInput.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    
    const errorElement = page.locator(`#${errorId}`);
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(/required|email/i);
  });
});

// Screen reader testing guide
test.describe('Screen Reader Manual Testing Checklist', () => {
  test.skip('Manual: Verify with NVDA on Windows', async () => {
    /*
     * Manual Testing Steps for NVDA:
     * 
     * 1. Navigate to each page using Tab and Shift+Tab
     * 2. Verify all content is announced
     * 3. Verify form labels are announced when entering fields
     * 4. Verify error messages are announced
     * 5. Verify modal content is announced when opened
     * 6. Verify live regions announce status changes
     * 7. Verify landmarks are properly announced (main, nav, etc.)
     * 8. Verify heading structure using H key navigation
     */
  });

  test.skip('Manual: Verify with VoiceOver on macOS', async () => {
    /*
     * Manual Testing Steps for VoiceOver:
     * 
     * 1. Enable VoiceOver: Cmd + F5
     * 2. Navigate using VO + arrow keys
     * 3. Use rotor (VO + U) to navigate by headings, links, forms
     * 4. Verify all interactive elements are accessible
     * 5. Verify focus management in modals
     * 6. Verify live region announcements
     */
  });
});
19.3 Keyboard Navigation Map



Copy
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KEYBOARD NAVIGATION MAP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GLOBAL SHORTCUTS                                                           │
│  ─────────────────                                                          │
│  Cmd/Ctrl + K      Open command palette (admin only)                        │
│  Escape            Close modal/dropdown/palette                             │
│  Tab               Move focus forward                                       │
│  Shift + Tab       Move focus backward                                      │
│                                                                             │
│  FORM NAVIGATION                                                            │
│  ────────────────                                                           │
│  Tab               Next field                                               │
│  Shift + Tab       Previous field                                           │
│  Enter             Submit form (when on button)                             │
│  Space             Toggle checkbox/radio                                    │
│  Arrow keys        Navigate select options                                  │
│                                                                             │
│  DROPDOWN MENUS                                                             │
│  ──────────────                                                             │
│  Enter/Space       Open dropdown (when button focused)                      │
│  Arrow Down/Up     Navigate options                                         │
│  Enter             Select option                                            │
│  Escape            Close dropdown                                           │
│  Home              First option                                             │
│  End               Last option                                              │
│                                                                             │
│  MODALS                                                                     │
│  ──────                                                                     │
│  Tab               Cycle through focusable elements                         │
│  Escape            Close modal (if not prevented)                           │
│  Focus trapped     Cannot Tab out of modal                                  │
│  Initial focus     First focusable element or close button                  │
│  Return focus      Focus returns to trigger after close                     │
│                                                                             │
│  DATA TABLES                                                                │
│  ───────────                                                                │
│  Tab               Move to next row action                                  │
│  Enter             Activate row link/action                                 │
│  Arrow keys        Navigate cells (if grid role)                            │
│                                                                             │
│  TOAST NOTIFICATIONS                                                        │
│  ───────────────────                                                        │
│  Not focusable     Announced via aria-live                                  │
│  Auto dismiss      After configured timeout                                 │
│  Close button      Optional keyboard-accessible close                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

20. Risk Register & Mitigation
20.1 Technical Risks
ID	Risk	Likelihood	Impact	Score	Mitigation	Owner	Status
T1	Data loss during migration	Medium	Critical	8	Multiple backup verification, staging test, rollback plan, zero-downtime migration strategy	Dev Lead	Open
T2	PocketBase performance at scale	Low	High	6	Load testing to 100 concurrent users, query optimization, connection pooling, upgrade path documented	Dev Lead	Open
T3	Stripe payment failures	Low	High	6	Webhook retry queue, payment recovery page, fallback to manual invoicing, comprehensive error handling	Dev Lead	Open
T4	Offline sync data conflicts	Medium	Medium	6	Last-write-wins with audit log, conflict detection, manual resolution UI for edge cases	Dev Lead	Open
T5	QR/barcode scanner compatibility	Medium	Medium	6	Multi-mode scanner (camera, USB, manual), browser capability detection, graceful fallback	Dev Lead	Open
T6	SSL certificate expiry	Low	Critical	5	Let's Encrypt auto-renewal, monitoring alerts at 14/7/1 days before expiry	DevOps	Open
T7	Database corruption	Very Low	Critical	4	Litestream continuous backup, daily integrity checks, point-in-time recovery tested	DevOps	Open
T8	Memory leaks in SvelteKit	Low	Medium	4	Memory profiling in CI, store cleanup patterns, load testing sustained sessions	Dev Lead	Open
T9	Bundle size exceeds budget	Medium	Low	4	Lighthouse CI checks, code splitting, lazy loading, tree shaking verification	Dev Lead	Open
T10	Third-party service outage	Low	Medium	4	Graceful degradation for Stripe/Resend, queue emails for retry, status page integration	Dev Lead	Open
20.2 Business Risks
ID	Risk	Likelihood	Impact	Score	Mitigation	Owner	Status
B1	User adoption resistance	Medium	High	8	Training documentation, video tutorials, support availability, gradual rollout to key customers first	Product	Open
B2	Scope creep	High	Medium	8	Strict change control process, v2.1 backlog for deferrals, weekly scope review	Product	Open
B3	Key person unavailable	Medium	High	8	Documentation, code review culture, knowledge sharing sessions, cross-training plan	Manager	Open
B4	Customer support overwhelm at launch	Medium	Medium	6	Pre-launch FAQ update, support team training, self-service options, phased rollout	Product	Open
B5	SEO ranking loss during migration	Medium	Medium	6	301 redirects for all URLs, preserve meta tags, Google Search Console monitoring, canonical URLs	Dev Lead	Open
B6	Competitor feature parity	Low	Medium	4	Feature prioritization based on customer feedback, v2.1 roadmap	Product	Open
20.3 Security Risks
ID	Risk	Likelihood	Impact	Score	Mitigation	Owner	Status
S1	DDoS attack	Low	High	6	Cloudflare protection, rate limiting, geographic restrictions if needed	DevOps	Open
S2	Account takeover	Medium	High	8	Rate limiting on auth, session management, suspicious login alerts (v2.1: 2FA)	Dev Lead	Open
S3	SQL injection	Low	Critical	5	Parameterized queries via PocketBase, input validation, security audit	Dev Lead	Open
S4	XSS vulnerabilities	Medium	High	8	Svelte auto-escaping, CSP headers, security audit, no {@html} without sanitization	Dev Lead	Open
S5	CSRF attacks	Low	Medium	4	SameSite cookies, CSRF tokens on mutations, origin validation	Dev Lead	Open
S6	Data breach	Low	Critical	5	Encryption at rest (SQLite), TLS in transit, minimal data collection, access logging	Dev Lead	Open
S7	Insider threat	Low	High	5	Role-based access, audit logging, least privilege principle, regular access review	Manager	Open
20.4 Compliance Risks
ID	Risk	Likelihood	Impact	Score	Mitigation	Owner	Status
C1	GDPR non-compliance	Medium	High	8	Account deletion feature, data export, privacy policy, cookie consent, data minimization	Legal	Open
C2	CCPA non-compliance	Medium	Medium	6	"Do Not Sell" option, privacy policy update, data disclosure process	Legal	Open
C3	PCI DSS requirements	Low	High	5	Stripe handles card data, no card numbers stored, annual compliance review	Finance	Open
C4	TSA shipping regulations	Low	High	5	Prohibited items list, customer acknowledgment, staff training	Operations	Open
20.5 Gap Analysis Specific Risks
ID	Risk	Source Gap	Likelihood	Impact	Mitigation
G1	Multi-package booking complexity	GAP-002	Medium	Medium	Extensive testing, edge case handling, clear UI limits (max 20 packages)
G2	Payment recovery abandonment	GAP-011	Medium	Medium	24-hour hold period, reminder emails, clear instructions
G3	Account deletion data integrity	GAP-015	Low	High	Soft delete with 30-day recovery, anonymization of historical data, cascade rules
G4	Photo upload storage costs	GAP-019	Medium	Low	Image compression, retention policy, storage monitoring
G5	Weight discrepancy customer disputes	GAP-022	Medium	Medium	Clear policy communication, photo evidence, threshold flexibility
G6	Audit log storage growth	GAP-026	Medium	Low	2-year retention policy, log rotation, archival strategy
20.6 Risk Response Matrix
Response Type	When to Use	Example Risks
Avoid	Risk can be eliminated by changing approach	T1 (use proven migration scripts)
Mitigate	Risk can be reduced with controls	S2, S4 (security measures)
Transfer	Risk can be shifted to third party	S3 (use PocketBase ORM)
Accept	Risk is low impact or unavoidable	B6 (competitor features)
21. Quality Assurance Checklist
21.1 Functional Testing Matrix
Authentication Module
Test Case	Priority	Automated	Manual	Status
Register with valid data	P0	✓ E2E		☐
Register with existing email	P0	✓ E2E		☐
Register with weak password	P1	✓ Unit		☐
Login with valid credentials	P0	✓ E2E		☐
Login with invalid password	P0	✓ E2E		☐
Login rate limiting (5 attempts)	P0	✓ E2E		☐
Password reset email sends	P0		✓	☐
Password reset link works	P0	✓ E2E		☐
Password reset link expires	P1	✓ E2E		☐
Email verification flow	P1		✓	☐
Google OAuth login	P1		✓	☐
Session persists after refresh	P0	✓ E2E		☐
Logout clears session	P0	✓ E2E		☐
Password change from profile	P1	✓ E2E		☐
Session list displays all devices	P1	✓ E2E		☐
Session revocation works	P1	✓ E2E		☐
Account deletion with 30-day hold	P0	✓ E2E	✓	☐
Account recovery during hold period	P1	✓ E2E		☐
Booking Module
Test Case	Priority	Automated	Manual	Status
Complete booking flow (single package)	P0	✓ E2E		☐
Complete booking flow (multiple packages)	P0	✓ E2E		☐
Add up to 20 packages	P1	✓ E2E		☐
Remove package from booking	P1	✓ E2E		☐
"I don't know" weight option	P1	✓ E2E		☐
Select saved recipient	P1	✓ E2E		☐
Create new recipient inline	P1	✓ E2E		☐
Upload customs documents	P1	✓ E2E	✓	☐
Time slot availability	P0	✓ API		☐
Past time slots not shown	P1	✓ Unit		☐
Full slot not bookable	P1	✓ API		☐
Booking state persists in localStorage	P1	✓ E2E		☐
Draft banner shows on dashboard	P2	✓ E2E		☐
Payment success creates booking	P0	✓ E2E		☐
Payment failure shows recovery page	P0	✓ E2E		☐
Retry payment with new card	P0		✓	☐
3D Secure flow completes	P0		✓	☐
QR code generates for each package	P1	✓ E2E		☐
Confirmation email sends	P1		✓	☐
Booking modification (date/time)	P1	✓ E2E		☐
Booking cancellation	P1	✓ E2E		☐
Cancellation within 12h charges fee	P2	✓ Unit		☐
Tracking Module
Test Case	Priority	Automated	Manual	Status
Track valid package	P0	✓ E2E		☐
Track invalid number shows error	P1	✓ E2E		☐
Timeline displays all events	P1	✓ E2E		☐
Estimated delivery date displays	P1	✓ E2E		☐
Shareable link generates	P2	✓ E2E		☐
Open Graph preview for shared link	P2		✓	☐
Status notifications send	P1		✓	☐
Warehouse Module
Test Case	Priority	Automated	Manual	Status
Camera scanner detects QR	P0		✓	☐
USB barcode scanner input	P0		✓	☐
Manual entry fallback	P0	✓ E2E		☐
Package receive updates status	P0	✓ E2E		☐
Weight/dimensions recorded	P1	✓ E2E		☐
Photo capture on receive	P1		✓	☐
Exception report workflow	P1	✓ E2E		☐
Exception triggers customer notification	P1		✓	☐
Weight discrepancy detected	P1	✓ Unit		☐
Weight discrepancy notification	P1		✓	☐
Offline scan queues to IndexedDB	P0	✓ E2E		☐
Sync on reconnect	P0	✓ E2E		☐
Haptic feedback on scan	P2		✓	☐
Audio feedback on scan	P2		✓	☐
Manifest creation	P1	✓ E2E		☐
Manifest PDF generates	P1		✓	☐
Admin Module
Test Case	Priority	Automated	Manual	Status
Dashboard KPIs accurate	P1	✓ API	✓	☐
User search works	P1	✓ E2E		☐
User filter by role	P2	✓ E2E		☐
User detail shows all data	P1	✓ E2E		☐
Communication log displays history	P1	✓ E2E		☐
Send email to customer	P1		✓	☐
Add internal note	P2	✓ E2E		☐
User impersonation	P2		✓	☐
Shipment status update	P0	✓ E2E		☐
Bulk status update	P1	✓ E2E		☐
Activity log shows all actions	P1	✓ E2E		☐
Admin actions automatically logged	P0	✓ E2E		☐
Global search (Cmd+K)	P1	✓ E2E		☐
CSV export	P2		✓	☐
Non-admin cannot access	P0	✓ E2E		☐
21.2 Non-Functional Testing Matrix
Performance
Test	Target	Tool	Status
Home page LCP	< 1.5s	Lighthouse	☐
Calculator page LCP	< 1.5s	Lighthouse	☐
Dashboard LCP	< 2.0s	Lighthouse	☐
First Input Delay	< 100ms	Lighthouse	☐
Cumulative Layout Shift	< 0.1	Lighthouse	☐
Time to Interactive	< 3.5s	Lighthouse	☐
Initial JS bundle	< 200KB	Bundle analyzer	☐
API response p50	< 200ms	k6	☐
API response p95	< 500ms	k6	☐
50 concurrent users	No errors	k6	☐
100 concurrent users	< 10% error	k6	☐
Database query time	< 100ms	Logging	☐
Memory usage stable	< 200MB	Process monitor	☐
Security
Test	Method	Status
SQL injection (auth)	OWASP ZAP	☐
SQL injection (search)	OWASP ZAP	☐
XSS (stored)	Manual + ZAP	☐
XSS (reflected)	Manual + ZAP	☐
CSRF protection	Manual	☐
Auth bypass attempts	Manual	☐
IDOR vulnerability	Manual	☐
Rate limiting functional	Manual	☐
Sensitive data in logs	Code review	☐
Secrets not in client	Bundle analysis	☐
HTTPS enforced	Manual	☐
Security headers present	Mozilla Observatory	☐
Cookie flags correct	Browser dev tools	☐
Accessibility
Test	Method	Status
axe-core all pages	Automated	☐
WAVE validation	Manual	☐
Keyboard navigation	Manual	☐
Screen reader (NVDA)	Manual	☐
Screen reader (VoiceOver)	Manual	☐
Color contrast	Automated	☐
Focus visibility	Manual	☐
Skip links	Manual	☐
Focus management	Manual	☐
Reduced motion	Manual	☐
Zoom 200%	Manual	☐
320px viewport	Manual	☐
Browser Compatibility
Browser	Version	Desktop	Mobile	Status
Chrome	Latest	✓	✓	☐
Chrome	Latest - 1	✓	✓	☐
Firefox	Latest	✓	✓	☐
Safari	Latest	✓	✓	☐
Safari	iOS 15+	—	✓	☐
Edge	Latest	✓	—	☐
Samsung Internet	Latest	—	✓	☐
Device Testing
Device	OS	Status
iPhone 12/13/14	iOS 16+	☐
iPhone SE	iOS 16+	☐
iPad	iPadOS 16+	☐
Samsung Galaxy S21+	Android 12+	☐
Google Pixel 6	Android 12+	☐
Budget Android (Moto G)	Android 11+	☐
21.3 Test Sign-Off Requirements
Phase	Criteria	Sign-Off
Unit Tests	80% coverage, all pass	Dev Lead
Integration Tests	All critical paths pass	Dev Lead
E2E Tests	All P0/P1 tests pass	QA
Accessibility	WCAG 2.1 AA compliant	QA
Performance	All metrics within target	Dev Lead
Security	No high/critical findings	Security
UAT	Stakeholder approval	Product
22. Post-Launch Support Plan
22.1 Support Tiers & SLAs
Severity	Description	Response Time	Resolution Time	Escalation
P0 - Critical	System down, data loss, security breach	15 minutes	4 hours	Immediate to Dev Lead
P1 - High	Major feature broken, significant user impact	1 hour	8 hours	After 2 hours to Dev Lead
P2 - Medium	Feature partially broken, workaround available	4 hours	24 hours	After 8 hours
P3 - Low	Minor issue, cosmetic, enhancement request	24 hours	1 week	As needed
22.2 Monitoring & Alerting
yaml


Copy
# Monitoring Configuration

metrics:
  # Application Health
  - name: health_check
    endpoint: /api/health
    interval: 30s
    alert_threshold: 3_consecutive_failures
    alert_channel: pagerduty

  # Performance
  - name: response_time_p95
    threshold: 1000ms
    window: 5m
    alert_channel: slack_alerts

  - name: error_rate
    threshold: 1%
    window: 5m
    alert_channel: slack_alerts

  # Infrastructure
  - name: cpu_usage
    threshold: 80%
    duration: 5m
    alert_channel: slack_alerts

  - name: memory_usage
    threshold: 85%
    duration: 5m
    alert_channel: slack_alerts

  - name: disk_usage
    threshold: 80%
    alert_channel: email

  # Database
  - name: db_connection_pool
    threshold: 80%
    alert_channel: slack_alerts

  - name: backup_status
    check: daily
    alert_on_failure: email_and_slack

  # SSL
  - name: ssl_expiry
    check: daily
    alert_thresholds:
      - 14_days: email
      - 7_days: slack_alerts
      - 1_day: pagerduty

alerts:
  channels:
    pagerduty:
      service_key: ${PAGERDUTY_KEY}
      
    slack_alerts:
      webhook: ${SLACK_WEBHOOK_ALERTS}
      channel: "#qcs-alerts"
      
    email:
      recipients:
        - dev@qcscargo.com
        - ops@qcscargo.com
22.3 On-Call Schedule
Week	Primary	Secondary	Hours
Week 1 (Launch)	Dev Lead	Contractor	24/7
Week 2	Dev Lead	Contractor	24/7
Week 3+	Dev Lead	—	Business hours + on-call
22.4 Incident Response Procedure
markdown


Copy
# Incident Response Runbook

## 1. Detection
- Alert received via PagerDuty/Slack
- Customer report via support channel
- Monitoring dashboard anomaly

## 2. Triage (< 5 minutes)
- [ ] Acknowledge alert
- [ ] Verify incident (not false positive)
- [ ] Assess severity (P0-P3)
- [ ] Create incident channel: #incident-YYYY-MM-DD-brief-desc

## 3. Communication (< 10 minutes)
- [ ] Update status page (if P0/P1)
- [ ] Notify stakeholders in incident channel
- [ ] Post customer communication (if customer-facing)

## 4. Investigation
- [ ] Check error logs (Sentry)
- [ ] Check application logs (Dokploy)
- [ ] Check infrastructure metrics
- [ ] Review recent deployments
- [ ] Check external service status (Stripe, Resend)

## 5. Mitigation
- [ ] Apply temporary fix if possible
- [ ] Rollback if deployment-related
- [ ] Scale resources if capacity-related
- [ ] Contact vendor if third-party issue

## 6. Resolution
- [ ] Verify fix in production
- [ ] Update status page
- [ ] Customer all-clear communication

## 7. Post-Incident (within 48 hours)
- [ ] Write incident report
- [ ] Root cause analysis
- [ ] Action items for prevention
- [ ] Update runbooks if needed
22.5 Maintenance Windows
Type	Schedule	Duration	Notification
Routine Maintenance	Sunday 2-4 AM EST	2 hours	24 hours advance
Security Updates	ASAP (within 24h of CVE)	Variable	Immediate if urgent
Feature Deployments	Tue/Thu 10 AM EST	30 minutes	2 hours advance
Database Maintenance	Monthly, 1st Sunday	1 hour	1 week advance
22.6 Backup & Recovery
Data	Backup Type	Frequency	Retention	Recovery Time
Database (SQLite)	Litestream	Continuous (10s)	30 days	< 5 minutes
File uploads	B2 sync	Daily	90 days	< 30 minutes
Configuration	Git	On change	Forever	< 5 minutes
Logs	Compressed archive	Daily	90 days	< 1 hour
Recovery Procedures:
bash


Copy
# Database Recovery from Litestream
litestream restore -o /tmp/restored.db s3://qcs-cargo-backups/pocketbase/
sqlite3 /tmp/restored.db "PRAGMA integrity_check;"
# If OK, replace production database during maintenance window

# Point-in-Time Recovery
litestream restore -timestamp 2024-01-15T10:30:00Z -o /tmp/restored.db s3://...

23. Version 2.1 Backlog
23.1 Prioritized Feature Backlog
Priority	Feature	Description	Effort	Value
P1	SMS Notifications	Twilio integration for shipment status SMS	16h	High
P1	WhatsApp Notifications	WhatsApp Business API integration	20h	High
P1	Two-Factor Authentication	TOTP-based 2FA with recovery codes	12h	High
P2	Payment Plans	Stripe financing for orders > $200	20h	Medium
P2	Account Credits	Store credit system for refunds/promotions	16h	Medium
P2	Bulk Email Tool	Admin tool for sending broadcast emails	12h	Medium
P2	Report Scheduling	Automated daily/weekly/monthly reports	12h	Medium
P2	Express Checkout	One-click booking for returning users	8h	Medium
P2	Multi-Language	Spanish and French Creole support	40h	Medium
P3	Native Mobile App	React Native app for iOS/Android	160h	High
P3	Map Tracking	Real-time map visualization of shipment	24h	Low
P3	Customer Reviews	Review/rating system for social proof	12h	Low
P3	Referral Program	Customer referral tracking and rewards	16h	Low
P3	API for Partners	Public API for business integrations	40h	Medium
P3	Advanced Analytics	Business intelligence dashboard	40h	Medium
P3	Automated Customs Forms	Generate customs documentation	32h	Medium
23.2 Technical Debt Items
Item	Description	Effort	Priority
Test coverage	Increase unit test coverage to 80%	16h	P1
Documentation	API documentation with examples	8h	P1
Performance audit	Deep-dive optimization pass	12h	P2
Dependency updates	Major version upgrades	8h	P2
Code refactoring	Extract shared patterns to utilities	12h	P2
Monitoring enhancement	Custom metrics and dashboards	8h	P3
23.3 v2.1 Release Plan
Target: Q2 2025 (3 months after v2.0 launch)
Phase 1 (Month 1):
* SMS Notifications
* Two-Factor Authentication
* Test coverage improvements
Phase 2 (Month 2):
* WhatsApp Notifications
* Report Scheduling
* Express Checkout
Phase 3 (Month 3):
* Payment Plans
* Bulk Email Tool
* Performance optimization

24. Appendices
24.1 Glossary
Term	Definition
AWB	Air Waybill - the contract of carriage between shipper and airline
Billable Weight	The greater of actual weight or dimensional weight, used for pricing
Consolidation	Combining multiple packages into a single shipment for efficiency
Customs Clearance	The process of getting goods through destination country customs
DIM Weight	Dimensional weight - calculated from package dimensions (L×W×H)/166
Drop-off	When a customer brings packages to the warehouse
ETA	Estimated Time of Arrival
Known Shipper	TSA designation allowing company to ship via air without additional screening
LCP	Largest Contentful Paint - web performance metric
Manifest	Document listing all packages in a shipment for airline/customs
Suite Code	Unique identifier for customer's virtual mailbox (e.g., AB123456)
Tracking Number	Unique identifier for each package (e.g., QCS2412150001ABCD)
TSA	Transportation Security Administration
WCAG	Web Content Accessibility Guidelines
24.2 Destination Details
Destination	Carrier Partners	Customs Process	Notes
Guyana	Caribbean Airlines, LIAT	Manual clearance, ~1 day	High volume destination
Jamaica	Caribbean Airlines	Electronic clearance, same day	Fast customs
Trinidad	Caribbean Airlines	Manual clearance, ~1 day	Standard process
Barbados	LIAT, interCaribbean	Electronic clearance	Efficient customs
Suriname	Fly Allways	Manual clearance, ~2 days	Longer processing
24.3 Contact Directory
Role	Name	Email	Phone
Project Owner	[TBD]	owner@qcscargo.com	—
Technical Lead	[TBD]	tech@qcscargo.com	—
Operations Manager	[TBD]	ops@qcscargo.com	—
Customer Support	Support Team	support@qcscargo.com	201-249-0929
Emergency/On-Call	Dev Lead	emergency@qcscargo.com	[On-call phone]
24.4 External Service Contacts
Service	Support URL	Status Page
Stripe	support.stripe.com	status.stripe.com
Resend	resend.com/help	status.resend.com
Hostinger	support.hostinger.com	status.hostinger.com
Cloudflare	support.cloudflare.com	cloudflarestatus.com
Backblaze	help.backblaze.com	status.backblaze.com
24.5 Document History
Version	Date	Author	Changes
1.0	Nov 2024	Dev Team	Initial PRD draft
1.1	Nov 2024	Dev Team	Added warehouse requirements
2.0	Dec 2024	Dev Team	Complete rewrite for SvelteKit/PocketBase
2.0.1	Dec 2024	Dev Team	Integrated gap analysis (47 gaps addressed)
2.0.2	Dec 2024	Dev Team	Added Sections 17-24
24.6 Approval Sign-Off
Role	Name	Signature	Date
Project Sponsor			
Product Owner			
Technical Lead			
QA Lead			
Operations Manager			
