# Stripe configuration

This project uses Stripe for payments. The app expects these env vars:

- **PUBLIC_STRIPE_KEY** – Publishable key (safe for client; used in `PaymentElement.svelte`).
- **STRIPE_SECRET_KEY** – Secret key for server (payment intents, customers, refunds). **Never commit.**
- **STRIPE_WEBHOOK_SECRET** – Signing secret for webhook signature verification. **Never commit.**

The live publishable key is set in `.env.example`. Use your own secret key and webhook secret in `.env` (or deployment env).

---

## 1. Stripe CLI (local webhooks)

For local development, Stripe CLI forwards events from Stripe to your app and gives you a temporary **STRIPE_WEBHOOK_SECRET** (`whsec_...`).

### Install Stripe CLI

- **macOS (Homebrew):** `brew install stripe/stripe-cli/stripe`
- **Windows:** `scoop install stripe`
- Or: https://stripe.com/docs/stripe-cli#install

### Log in (one-time)

```bash
stripe login
```

This opens the browser and links the CLI to your Stripe account (uses the same account as your live key).

### Forward webhooks to your app

With the app running (e.g. `npm run dev` on port 5173):

```bash
npm run stripe:listen
```

Or manually:

```bash
stripe listen --forward-to http://localhost:5173/api/webhooks/stripe \
  --events payment_intent.succeeded,payment_intent.payment_failed,payment_intent.canceled,payment_intent.requires_action,charge.dispute.created
```

The CLI will print something like:

```
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copy that value into your `.env` as **STRIPE_WEBHOOK_SECRET** for local dev. Use that same secret only while the CLI is running; for production you’ll use a different secret from the Dashboard.

---

## 2. Webhook events used by this app

The endpoint `POST /api/webhooks/stripe` handles:

| Event | Purpose |
|-------|--------|
| `payment_intent.succeeded` | Mark booking paid, create invoice, send confirmation |
| `payment_intent.payment_failed` | Mark booking payment failed |
| `payment_intent.canceled` | Mark booking canceled |
| `payment_intent.requires_action` | Mark booking pending (e.g. 3DS) |
| `charge.dispute.created` | Mark related booking(s) payment failed |

---

## 3. Create webhook and get the secret (Dashboard)

The Stripe CLI cannot create webhook endpoints when using a restricted key. Create the endpoint in the Dashboard to get your signing secret:

1. Open [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks) (switch to **Live** if you use live keys).
2. Click **Add endpoint**.
3. **Endpoint URL:** Use your real URL: `https://<your-domain>/api/webhooks/stripe` (or a placeholder; update later).
4. **Events to send:** Choose **Select events** and add: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `payment_intent.requires_action`, `charge.dispute.created`.
5. Click **Add endpoint**.
6. On the new endpoint page, click **Reveal** under **Signing secret**.
7. Copy the value (starts with `whsec_`) into your `.env` as **STRIPE_WEBHOOK_SECRET**.

Use the **live** secret key (`sk_live_...`) in production; get it from [API keys](https://dashboard.stripe.com/apikeys).

---

## 4. Quick reference

- **Publishable key (live):** Already in `.env.example` as `PUBLIC_STRIPE_KEY`.
- **Secret key:** [Dashboard → API keys](https://dashboard.stripe.com/apikeys) → Secret key → set `STRIPE_SECRET_KEY` in `.env` / deployment.
- **Local webhook secret:** From `stripe listen` → set `STRIPE_WEBHOOK_SECRET` in `.env` while developing.
- **Production webhook secret:** From Dashboard → Webhooks → endpoint → Signing secret → set `STRIPE_WEBHOOK_SECRET` in production env.
