import { env } from '$env/dynamic/public';
// import { replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

if (env.PUBLIC_SENTRY_ENVIRONMENT && env.PUBLIC_SENTRY_ENVIRONMENT !== 'local') {
  Sentry.init({
    dsn: env.PUBLIC_SENTRY_DSN,
    environment: env.PUBLIC_SENTRY_ENVIRONMENT,
    tracesSampleRate: env.PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.2 : 0,
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    // replaysSessionSampleRate: env.PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0,
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    // replaysOnErrorSampleRate: env.PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 1.0 : 0,
    // If you don't want to use Session Replay, just remove the line below:
    // integrations: [replayIntegration()],
  });
}
