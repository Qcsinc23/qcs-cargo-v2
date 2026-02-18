# Stripe Configuration

QCS Cargo uses Stripe for booking payments and webhook-driven payment status updates.

## Required Environment Variables

- `PUBLIC_STRIPE_KEY`: publishable key (client-side)
- `STRIPE_SECRET_KEY`: secret key (server-side)
- `STRIPE_WEBHOOK_SECRET`: webhook signing secret

Never commit real values.

## Production (Hostinger VPS)

1. In Stripe Dashboard, create/update webhook endpoint:
   - `https://qcs-cargo.com/api/webhooks/stripe`
2. Subscribe to these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.requires_action`
   - `charge.dispute.created`
3. Set production env values on VPS/Dokploy:

```env
PUBLIC_STRIPE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxx
```

## Local Development

Use Stripe CLI to forward events:

```bash
npm run stripe:listen
```

This forwards to:

- `http://localhost:5173/api/webhooks/stripe`

The CLI prints a temporary webhook secret (`whsec_...`). Put that in local `.env` as `STRIPE_WEBHOOK_SECRET`.

## Webhook Behavior in App

Endpoint:

- `POST /api/webhooks/stripe`

Key outcomes:

- Successful payment marks booking paid and creates invoice
- Failed/canceled payments update booking/payment status
- Disputes mark related payments for follow-up

## Quick Verification

1. Run `stripe trigger payment_intent.succeeded` locally.
2. Confirm webhook endpoint returns `2xx`.
3. Confirm booking and invoice state update in admin dashboard.
