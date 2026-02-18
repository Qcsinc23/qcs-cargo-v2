# QCS Cargo 2.0

[![Test](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/test.yml/badge.svg)](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/test.yml)
[![Deploy](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/deploy.yml/badge.svg)](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/deploy.yml)

Web application for managing bookings, shipments, invoices, recipients, and warehouse operations for QCS Cargo.

## Current Status

- Stack: `SvelteKit 2` + `TypeScript` + `PocketBase`
- Auth: Magic-link based authentication (PocketBase-backed)
- Payments: Stripe
- Email: Resend
- SMS: Twilio (optional)
- Verified on `2026-02-18`:
  - `npm run check`
  - `npm run lint -- --quiet`
  - `npm run test:unit`
  - `npm run test:a11y`
  - `npm run test:e2e -- --project=chromium`

## Prerequisites

- Node.js `20+`
- npm `10+`
- Docker (for PocketBase)

## Local Development

1. Clone and install:

```bash
git clone https://github.com/Qcsinc23/qcs-cargo-v2.git
cd qcs-cargo-v2
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start PocketBase:

```bash
docker compose up pocketbase -d
```

4. (Optional but recommended for fresh databases) apply full schema:

```bash
cd pocketbase
node ../scripts/setup-full-schema.js
cd ..
```

5. Start app:

```bash
npm run dev
```

6. Open:
- App: `http://localhost:5173`
- PocketBase health: `http://localhost:8090/api/health`

## Test Commands

| Command | Purpose |
|---|---|
| `npm run check` | Svelte/TypeScript checks |
| `npm run lint -- --quiet` | ESLint |
| `npm run test:unit` | Vitest unit/integration tests |
| `npm run test:a11y` | Playwright accessibility suite |
| `npm run test:e2e -- --project=chromium` | Main E2E regression suite |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit + e2e tests |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run stripe:listen` | Forward Stripe webhooks locally |
| `npm run db:generate-types` | Generate PocketBase types from local DB |

## Deployment

Production is deployed to your **Hostinger VPS**.

- Production stack file: `docker-compose.prod.yml`
- Staging stack file: `docker-compose.staging.yml`
- Local production-style stack: `docker-compose.yml`

Use `docs/DEPLOYMENT-RUNBOOK.md` for VPS deployment, verification, rollback, and backup steps.

## Documentation

| Document | Description |
|---|---|
| `docs/ENVIRONMENT.md` | Complete environment variable reference |
| `docs/DEPLOYMENT-RUNBOOK.md` | Production/staging deployment procedures |
| `docs/URLS.md` | Canonical external URL endpoints |
| `docs/STRIPE.md` | Stripe setup and webhook workflow |
| `docs/PRODUCTION-MONITORING.md` | Monitoring, alerting, health checks |
| `docs/CHANGELOG.md` | Release and change history |
| `docs/PRD.md` | Product requirements reference |

Historical implementation notes are in `docs/archive/`.

## Project Structure

```text
qcs-cargo-v2/
├── .github/workflows/
├── docs/
├── pocketbase/
├── scripts/
├── src/
├── static/
└── tests/
```

## Contributing

1. Branch from `main`
2. Make changes
3. Run validation commands
4. Open a pull request

## License

Proprietary - All rights reserved.
