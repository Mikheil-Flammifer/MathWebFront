const dsn = import.meta.env.VITE_SENTRY_DSN
let sentry
let sentryReady

function loadSentry() {
  if (!dsn) return Promise.resolve(null)
  if (sentryReady) return sentryReady

  sentryReady = import('@sentry/react').then((module) => {
    sentry = module
    sentry.init({
      dsn,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
      sendDefaultPii: false,
      integrations: [sentry.browserTracingIntegration()],
      tracesSampleRate: 0.1,
    })
    return sentry
  })

  return sentryReady
}

export function initSentry() {
  void loadSentry()
}

export function captureError(error, context = {}) {
  if (!dsn) return
  void loadSentry().then((client) => client?.captureException(error, { extra: context }))
}
