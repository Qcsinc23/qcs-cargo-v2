import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.VITE_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in dev, adjust for prod
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true
    }),
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^\//],
    })
  ],

  // Filter out known non-critical errors
  beforeSend(event, hint) {
    // Filter out network errors during development
    if (event.exception?.values?.[0]?.value?.includes('Failed to fetch') && 
        import.meta.env.DEV) {
      return null;
    }
    return event;
  }
});

export const handleError = Sentry.handleErrorWithSentry();

