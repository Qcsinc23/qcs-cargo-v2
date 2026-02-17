import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.VITE_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Performance Monitoring -- 100% in dev, 10% in production
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
  
  // Session Replay -- only capture on errors to avoid DOM observer overhead
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true
    }),
    Sentry.browserTracingIntegration()
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





