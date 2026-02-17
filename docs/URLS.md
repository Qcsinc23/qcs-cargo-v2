# Required URLs for QCS Cargo (production)

**Base URL:** `https://qcs-cargo.com` (no trailing slash)

Set `PUBLIC_SITE_URL=https://qcs-cargo.com` in production so all links, webhooks, and redirects use this base.

---

## 1. Webhook endpoints (configure in each service)

| Service   | URL | Where to set |
|-----------|-----|--------------|
| **Stripe** | `https://qcs-cargo.com/api/webhooks/stripe` | [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) → your endpoint → Update URL |
| **Twilio (SMS status)** | `https://qcs-cargo.com/api/webhooks/sms/status` | Uses `PUBLIC_SITE_URL` in code (per-message `statusCallback`); no Twilio dashboard URL needed if env is set |
| **Carrier tracking** | `https://qcs-cargo.com/api/webhooks/carrier-tracking` | Only if a carrier is configured to POST here |

---

## 2. Kinde (auth) — set in Kinde Dashboard and in `.env`

In [Kinde Dashboard](https://qcsinc.kinde.com) → Application → URLs, set:

| Kinde setting | Production URL |
|---------------|-----------------|
| **Allowed redirect URL** | `https://qcs-cargo.com/api/auth/kinde_callback` |
| **Allowed logout redirect URL** | `https://qcs-cargo.com` |
| **Post login redirect** (if configurable) | `https://qcs-cargo.com/dashboard` |

In production `.env`:

```env
PUBLIC_SITE_URL=https://qcs-cargo.com
KINDE_REDIRECT_URL=https://qcs-cargo.com/api/auth/kinde_callback
KINDE_POST_LOGOUT_REDIRECT_URL=https://qcs-cargo.com
KINDE_POST_LOGIN_REDIRECT_URL=https://qcs-cargo.com/dashboard
```

---

## 3. App URLs derived from `PUBLIC_SITE_URL`

These are built in code from `PUBLIC_SITE_URL`; no extra config if that env is set.

- **Site home:** `https://qcs-cargo.com`
- **Dashboard:** `https://qcs-cargo.com/dashboard`
- **Login:** `https://qcs-cargo.com/login`
- **Verify (magic link):** `https://qcs-cargo.com/verify?token=...`
- **Booking confirmation (Stripe return):** `https://qcs-cargo.com/dashboard/bookings/{id}/confirmation`
- **Track:** `https://qcs-cargo.com/track?number=...`
- **Legal:** `https://qcs-cargo.com/legal/privacy`, etc.
- **Sitemap:** `https://qcs-cargo.com/sitemap.xml`
- **Robots:** `https://qcs-cargo.com/robots.txt`

---

## 4. Stripe webhook (production)

Ensure the Stripe webhook endpoint URL is set to:

**`https://qcs-cargo.com/api/webhooks/stripe`**

Update it in [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks) → select your endpoint → **Update details** → set **Endpoint URL** to the value above.
