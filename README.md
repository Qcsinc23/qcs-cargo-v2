# QCS Cargo 2.0

[![Test](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/test.yml/badge.svg)](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/test.yml)
[![Deploy](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/deploy.yml/badge.svg)](https://github.com/Qcsinc23/qcs-cargo-v2/actions/workflows/deploy.yml)

Air freight shipping platform for Caribbean destinations.

## Tech Stack

- **Frontend:** SvelteKit 2.x + TypeScript
- **Styling:** Tailwind CSS + shadcn-svelte
- **Backend:** PocketBase
- **Payments:** Stripe
- **Email:** Resend
- **Deployment:** Dokploy

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (for PocketBase)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Qcsinc23/qcs-cargo-v2.git
   cd qcs-cargo-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start PocketBase:
   ```bash
   docker-compose up pocketbase -d
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5173

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check the codebase |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:a11y` | Run accessibility tests |

## Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG.md](docs/CHANGELOG.md) | Version history and releases |
| [PRODUCTION-MONITORING.md](docs/PRODUCTION-MONITORING.md) | Monitoring & observability setup |
| [PRD.md](docs/PRD.md) | Full product requirements (reference) |

> **Note**: Development notes are archived in `docs/archive/` for historical reference.

## Project Structure

```
qcs-cargo-v2/
├── .github/workflows/     # CI/CD workflows
├── docs/                  # Documentation
├── pocketbase/            # PocketBase hooks & migrations
├── scripts/               # Utility scripts
├── src/
│   ├── lib/
│   │   ├── components/    # UI components
│   │   ├── server/        # Server-only code
│   │   ├── stores/        # Svelte stores
│   │   ├── services/      # Client services
│   │   ├── utils/         # Utilities
│   │   ├── types/         # TypeScript types
│   │   └── config/        # Configuration
│   ├── routes/            # SvelteKit routes
│   └── app.css            # Global styles
├── static/                # Static assets
└── tests/                 # Test files
```

## Environment Variables

See [.env.example](.env.example) for all required environment variables.

## Deployment

The application is configured for deployment via Dokploy on Hostinger VPS.

### Docker Deployment

```bash
docker compose -f docker-compose.prod.yml up -d
```

This starts both the SvelteKit application and PocketBase.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## License

Proprietary - All rights reserved

---

**QCS Cargo** - Trusted Air Freight to the Caribbean 🌴✈️