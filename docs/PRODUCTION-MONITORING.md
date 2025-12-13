# Production Monitoring & Observability Setup

## Overview
This document outlines the production monitoring strategy for QCS Cargo v2, including error tracking, uptime monitoring, and performance metrics.

---

## 1. Sentry Integration (Error Tracking)

### Setup

1. **Install Sentry SDK**:
```bash
npm install @sentry/sveltekit
```

2. **Environment Variables**:
```.env
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=qcs-cargo
SENTRY_PROJECT=qcs-cargo-v2
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ENVIRONMENT=production  # or staging, development
```

3. **Client-side Configuration** (`src/hooks.client.ts`):
```typescript
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.VITE_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    }),
    new Sentry.BrowserTracing()
  ]
});
```

4. **Server-side Configuration** (`src/hooks.server.ts`):
```typescript
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0
});

export const handleError = Sentry.handleErrorWithSentry();
```

### Features Enabled
- ✅ **Error tracking** with stack traces
- ✅ **Session replay** for debugging user sessions
- ✅ **Performance monitoring** (transaction tracking)
- ✅ **Release tracking** (linked to Git commits)
- ✅ **User context** (email, ID, role)
- ✅ **Breadcrumbs** (user actions before error)

### Alert Rules
1. **High Priority**: >10 errors/minute → Slack + Email
2. **Medium Priority**: New error type → Slack notification  
3. **Low Priority**: Error spike (>50% increase) → Email digest

---

## 2. UptimeRobot (Uptime Monitoring)

### Monitors to Create

#### 1. Main Application
- **URL**: https://app.qcscargo.com
- **Type**: HTTP(S)
- **Interval**: 5 minutes
- **Alert After**: 2 failed checks (down for 10 min)

#### 2. API Health Check
- **URL**: https://app.qcscargo.com/api/health
- **Type**: HTTP(S) with keyword monitoring
- **Expected**: `"status":"healthy"`
- **Interval**: 5 minutes

#### 3. PocketBase Backend
- **URL**: https://db.qcscargo.com/api/health
- **Type**: HTTP(S)
- **Interval**: 5 minutes

#### 4. Stripe Webhook Endpoint
- **URL**: https://app.qcscargo.com/api/webhooks/stripe
- **Type**: HTTP(S)
- **Interval**: 15 minutes
- **Method**: GET (ping endpoint)

### Alert Contacts
- **Primary**: dev@quietcraftsolutions.com
- **SMS**: +1-xxx-xxx-xxxx (critical only)
- **Slack**: #alerts channel webhook

### SLA Targets
- **Uptime**: 99.5% monthly
- **Response Time**: <2s (p95)
- **TTFB**: <500ms (p95)

---

## 3. Application Health Endpoint

### Implementation (`/api/health/+server.ts`)
```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';

export const GET: RequestHandler = async () => {
  const checks = {
    app: true,
    database: false,
    timestamp: new Date().toISOString()
  };

  // Check database connectivity
  try {
    const pb = new PocketBase(process.env.POCKETBASE_URL);
    await pb.health.check();
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const allHealthy = Object.values(checks).every(v => v === true || typeof v === 'string');

  return json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks
  }, {
    status: allHealthy ? 200 : 503
  });
};
```

---

## 4. Lighthouse CI (Performance Monitoring)

### Setup

1. **Install**:
```bash
npm install --save-dev @lhci/cli
```

2. **Configuration** (`lighthouserc.json`):
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:5179/",
        "http://localhost:5179/shipping-calculator",
        "http://localhost:5179/auth/login",
        "http://localhost:5179/dashboard"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
```

3. **GitHub Actions** (`.github/workflows/lighthouse.yml`):
```yaml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Mondays at 2am

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build app
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Metrics Tracked
- **Performance**: FCP, LCP, TBT, CLS, Speed Index
- **Accessibility**: WCAG 2.1 AA compliance
- **Best Practices**: Security, modern standards
- **SEO**: Meta tags, structured data

---

## 5. Custom Metrics & Logging

### Performance Metrics
```typescript
// Track API response times
export async function trackApiPerformance(endpoint: string, duration: number) {
  if (duration > 1000) {
    console.warn(`[PERF] Slow API: ${endpoint} took ${duration}ms`);
    // Send to Sentry or custom analytics
  }
}
```

### Business Metrics
- **Daily Active Users** (DAU)
- **Booking Conversion Rate**
- **Average Response Time** (customer support)
- **Payment Success Rate**
- **Shipment Delivery On-Time Rate**

---

## 6. Alerting Strategy

### Severity Levels

**P0 (Critical)** - Immediate action required
- Site completely down (>2 min)
- Payment processing failure (>5 failures/min)
- Database unavailable
- **Response**: Page on-call engineer, all hands

**P1 (High)** - Urgent, impacts users
- Site degraded performance (>5s load time)
- API errors (>10% error rate)
- Booking creation failures
- **Response**: Notify team within 15 min

**P2 (Medium)** - Affects some users
- Elevated error rates (>1% but <10%)
- Slow API endpoints (>2s but <5s)
- **Response**: Create ticket, fix within 24h

**P3 (Low)** - Minor issues
- Warning-level logs
- Performance degradation (<10%)
- **Response**: Track, fix in next sprint

---

## 7. Implementation Checklist

### Phase 1: Essential (Week 1)
- [ ] Set up Sentry account and configure SDK
- [ ] Create `/api/health` endpoint
- [ ] Configure UptimeRobot monitors
- [ ] Set up Slack alerting
- [ ] Test alert flow end-to-end

### Phase 2: Enhanced (Week 2)
- [ ] Configure Lighthouse CI
- [ ] Set up GitHub Actions for weekly audits
- [ ] Create monitoring dashboard (Grafana/DataDog)
- [ ] Document runbooks for common incidents

### Phase 3: Advanced (Month 2)
- [ ] Implement custom business metrics tracking
- [ ] Set up log aggregation (Logtail, Papertrail)
- [ ] Create performance budgets
- [ ] Weekly review of metrics and trends

---

## 8. Cost Estimation

| Service | Plan | Cost/Month | Notes |
|---------|------|------------|-------|
| Sentry | Developer | $26 | 50k events/mo |
| UptimeRobot | Pro | $7 | 50 monitors, 1-min intervals |
| Lighthouse CI | Free | $0 | GitHub Actions included |
| **Total** | | **$33/mo** | Scales with usage |

---

## 9. Next Steps

1. ✅ Create this documentation
2. 🔄 Install Sentry and configure hooks
3. 🔄 Create health endpoint
4. 🔄 Set up UptimeRobot
5. 🔄 Configure Lighthouse CI
6. ⏸️ Train team on alerting procedures

---

**Last Updated**: December 13, 2025  
**Owner**: Engineering Team  
**Review Schedule**: Quarterly

