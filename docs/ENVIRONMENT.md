# Environment Variables

This reference reflects the current application behavior and deployment on Hostinger VPS.

## 1. Core Public App Vars (required)

| Variable | Required | Purpose |
|---|---|---|
| `PUBLIC_SITE_URL` | Yes | Canonical app URL used in links, emails, webhook callbacks |
| `PUBLIC_POCKETBASE_URL` | Yes | PocketBase base URL used by app/API |
| `PUBLIC_COMPANY_NAME` | Yes | Company branding text |
| `PUBLIC_COMPANY_PHONE` | Yes | Public contact phone |
| `PUBLIC_COMPANY_EMAIL` | Yes | Public contact email |
| `PUBLIC_COMPANY_ADDRESS` | Yes | Public company address |

## 2. Authentication / PocketBase Admin (required)

| Variable | Required | Purpose |
|---|---|---|
| `POCKETBASE_ADMIN_EMAIL` | Yes | Server-side admin auth for backend operations |
| `POCKETBASE_ADMIN_PASSWORD` | Yes | Server-side admin auth password |
| `PB_ADMIN_EMAIL` | Optional | Alias used by scripts/tests |
| `PB_ADMIN_PASSWORD` | Optional | Alias used by scripts/tests |

## 3. Stripe (required for payments)

| Variable | Required | Purpose |
|---|---|---|
| `PUBLIC_STRIPE_KEY` | Yes | Client publishable key |
| `STRIPE_SECRET_KEY` | Yes | Server key for payment intent/refund actions |
| `STRIPE_WEBHOOK_SECRET` | Yes | Signature verification for Stripe webhooks |

## 4. Email (required for magic link + notifications)

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API authentication |
| `RESEND_FROM_EMAIL` | Optional | Preferred sender format (`Name <email>`) |
| `FROM_EMAIL` | Yes | Sender fallback email |
| `REPLY_TO_EMAIL` | Yes | Reply-to target |
| `ADMIN_EMAIL` | Optional | Additional email fallback for operational notifications |

## 5. SMS (optional)

| Variable | Required | Purpose |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | Optional | Twilio API auth |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio API auth |
| `TWILIO_PHONE_NUMBER` | Optional | Sender phone number |

## 6. Monitoring (optional but recommended)

| Variable | Required | Purpose |
|---|---|---|
| `SENTRY_DSN` | Recommended | Server-side Sentry |
| `SENTRY_ENVIRONMENT` | Recommended | `production`, `staging`, etc. |
| `VITE_PUBLIC_SENTRY_DSN` | Recommended | Client-side Sentry |
| `VITE_PUBLIC_SENTRY_ENVIRONMENT` | Recommended | Client environment label |

## 7. Integration Secrets (optional)

| Variable | Required | Purpose |
|---|---|---|
| `CARRIER_WEBHOOK_SECRET` | Optional | Signature validation for carrier webhook endpoint |
| `PUBLIC_APP_URL` | Optional | Legacy fallback URL used in a few server utilities |

## 8. Runtime/Test Convenience

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Yes | Runtime mode (`development`/`production`) |
| `BASE_URL` | Optional | Playwright base URL override |
| `PB_URL` | Optional | Playwright PocketBase URL override |

## 9. Local Setup

1. Copy template:

```bash
cp .env.example .env
```

2. Fill required values.
3. For E2E tests, ensure admin creds are set (`POCKETBASE_ADMIN_*` or `PB_ADMIN_*`).
