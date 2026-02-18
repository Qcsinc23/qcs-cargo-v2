# Production URL Reference (Hostinger VPS)

This document is the source of truth for external URLs used by QCS Cargo in production.

## Environment Context

- Production hosting: **Hostinger VPS**
- Deployment model: Docker Compose (`docker-compose.prod.yml`) behind Traefik / Dokploy
- Primary site URL is controlled by `PUBLIC_SITE_URL`

---

## 1. Canonical Base URLs

Set these in production:

- `PUBLIC_SITE_URL=https://qcs-cargo.com`
- `PUBLIC_POCKETBASE_URL=https://api.qcs-cargo.com` (or your API domain)

Derived app URLs:

- Home: `https://qcs-cargo.com/`
- Login: `https://qcs-cargo.com/login`
- Verify magic link: `https://qcs-cargo.com/verify?token=...`
- Dashboard: `https://qcs-cargo.com/dashboard`
- Tracking: `https://qcs-cargo.com/track?number=...`
- Health: `https://qcs-cargo.com/api/health`
- Sitemap: `https://qcs-cargo.com/sitemap.xml`
- Robots: `https://qcs-cargo.com/robots.txt`

---

## 2. Webhook Endpoints

| Service | URL | Configuration Location |
|---|---|---|
| Stripe | `https://qcs-cargo.com/api/webhooks/stripe` | Stripe Dashboard > Developers > Webhooks |
| Twilio status callback | `https://qcs-cargo.com/api/webhooks/sms/status` | Generated from app env (`PUBLIC_SITE_URL`) |
| Carrier tracking (optional) | `https://qcs-cargo.com/api/webhooks/carrier-tracking` | Carrier integration settings |

---

## 3. Auth URLs (Magic Link)

QCS Cargo uses magic-link authentication (no OAuth callback URL required).

Required auth route URLs:

- Request link API: `https://qcs-cargo.com/api/auth/magic-link/request`
- Verify link API: `https://qcs-cargo.com/api/auth/magic-link/verify`
- Verify page: `https://qcs-cargo.com/verify?token=...`

---

## 4. Stripe Return URLs

Stripe flows ultimately return users into dashboard routes. Ensure `PUBLIC_SITE_URL` is correct in production so all generated links are valid.

Typical destination:

- `https://qcs-cargo.com/dashboard/bookings/{bookingId}/confirmation`

---

## 5. Validation Checklist

1. Confirm `PUBLIC_SITE_URL` in production env matches the real HTTPS domain.
2. Confirm Stripe webhook endpoint points to production domain.
3. Hit `https://qcs-cargo.com/api/health` and verify `status: healthy`.
4. Send a test magic-link email and verify URL opens production `/verify`.
5. Trigger a Twilio message and verify callback hits `/api/webhooks/sms/status`.
