# Deployment Runbook (Hostinger VPS)

This runbook is for production deployment on your Hostinger VPS.

## 1. Assumptions

- Docker and Docker Compose are installed on VPS.
- Deployment uses `docker-compose.prod.yml`.
- Traefik/Dokploy network exists (`dokploy-network`).
- DNS is pointed to VPS for:
  - `qcs-cargo.com` (web)
  - `api.qcs-cargo.com` (PocketBase/API)

## 2. Required Production Environment

At minimum, configure:

- `WEB_DOMAIN`
- `API_DOMAIN`
- `PUBLIC_SITE_URL`
- `PUBLIC_POCKETBASE_URL`
- `POCKETBASE_ADMIN_EMAIL`
- `POCKETBASE_ADMIN_PASSWORD`
- `PUBLIC_STRIPE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `REPLY_TO_EMAIL`
- `PB_ENCRYPTION_KEY`

Optional but recommended:

- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT=production`
- `VITE_PUBLIC_SENTRY_DSN`
- `VITE_PUBLIC_SENTRY_ENVIRONMENT=production`
- Twilio variables

## 3. Deploy Steps

From repo root on VPS:

```bash
git pull origin main
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

Check containers:

```bash
docker ps
```

## 4. Post-Deploy Verification

1. Health checks:

```bash
curl -sS https://qcs-cargo.com/api/health
curl -sS https://api.qcs-cargo.com/api/health
```

2. Functional smoke checks:
- Login page loads
- Magic-link request endpoint responds (`/api/auth/magic-link/request`)
- Dashboard loads for admin user
- Stripe webhook endpoint reachable

3. Logs:

```bash
docker logs --tail=200 qcs_web
docker logs --tail=200 qcs_pocketbase
```

## 5. Schema Sync / Initialization

If deploying to a fresh PocketBase data volume or after schema changes:

```bash
cd pocketbase
node ../scripts/setup-full-schema.js
cd ..
```

Notes:
- Script requires `POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD` (or `PB_ADMIN_*` aliases).
- Run during maintenance windows if schema changes are disruptive.

## 6. Rollback Procedure

If deployment is unhealthy:

1. Roll back code:

```bash
git log --oneline -n 10
git checkout <last-known-good-commit>
```

2. Rebuild + restart:

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

3. Re-run health checks.

If DB migration caused failure, restore PocketBase data volume backup before restarting app services.

## 7. Backup Guidance

At minimum back up:

- `../files/qcs_pb_data` (PocketBase data volume)
- Environment/secrets managed in VPS or Dokploy

Run backups before schema-changing deployments.

## 8. Release Validation Gate

Before production deploy from local/CI branch:

```bash
npm run check
npm run lint -- --quiet
npm run test:unit
npm run test:a11y
npm run test:e2e -- --project=chromium
```
