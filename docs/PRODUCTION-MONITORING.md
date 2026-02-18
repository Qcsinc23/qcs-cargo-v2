# Production Monitoring (Hostinger VPS)

This document describes the monitoring baseline for the production deployment on your Hostinger VPS.

## 1. Health Endpoints

Primary health endpoint:

- `GET /api/health`

Expected response:

- HTTP `200` when healthy
- JSON includes:
  - `status: "healthy"`
  - `checks.app: true`
  - `checks.database: true`

If database connectivity fails, the endpoint returns HTTP `503` with `status: "degraded"`.

## 2. Uptime Monitoring

Create external monitors (UptimeRobot, BetterStack, or equivalent):

1. `https://qcs-cargo.com/api/health` (every 1-5 min)
2. `https://api.qcs-cargo.com/api/health` (if PocketBase exposed separately)
3. Optional homepage monitor: `https://qcs-cargo.com/`

Alert routing recommendations:

- Critical: SMS + email
- High: email + Slack/Discord
- Low: daily digest

## 3. Error Tracking (Sentry)

Current integration points:

- Server: `src/hooks.server.ts`
  - `SENTRY_DSN`
  - `SENTRY_ENVIRONMENT`
- Client: `src/hooks.client.ts`
  - `VITE_PUBLIC_SENTRY_DSN`
  - `VITE_PUBLIC_SENTRY_ENVIRONMENT`

Minimum production env values:

```env
SENTRY_DSN=https://<server-dsn>
SENTRY_ENVIRONMENT=production
VITE_PUBLIC_SENTRY_DSN=https://<public-dsn>
VITE_PUBLIC_SENTRY_ENVIRONMENT=production
```

## 4. CI Monitoring Signals

GitHub Actions workflows:

- `.github/workflows/test.yml`
- `.github/workflows/lighthouse.yml`
- `.github/workflows/deploy.yml`

Recommended policy:

- Block deploy if test workflow fails.
- Review Lighthouse trend weekly (performance/accessibility regressions).

## 5. Runtime Signals to Watch

1. `5xx` response rate on API routes
2. Stripe webhook failures (`/api/webhooks/stripe`)
3. Auth failures for magic-link verify endpoint
4. PocketBase health check failures
5. Elevated latency on admin dashboard API (`/api/admin/dashboard`)

## 6. Incident Severity Guide

- `P0`: Site down, payments blocked, or database unavailable
- `P1`: Partial outage (critical user workflows failing)
- `P2`: Degraded performance without full outage
- `P3`: Non-critical errors, noisy logs, or minor UX regressions

## 7. On-Hostinger Quick Checks

Run on VPS shell:

```bash
docker ps
docker logs --tail=200 qcs_web
docker logs --tail=200 qcs_pocketbase
curl -sS https://qcs-cargo.com/api/health
```

If unhealthy:

1. Check env values and container health.
2. Restart services in controlled order (`qcs_pocketbase` then `qcs_web`).
3. Re-check `api/health` before reopening traffic.
