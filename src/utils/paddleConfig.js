// Paddle frontend config. The client-side token is public, but keep it in env.
// NEVER put the Paddle server API key in the frontend.
export const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV || 'sandbox'
export const PADDLE_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || ''

// Set to false when GET /api/plans exists on the backend.
export const USE_MOCK_PLANS = false

// MOCK ONLY. Real prices and names come from the server.
// The priceCents values below are fake placeholders. The price ids are the sandbox ones.
export const MOCK_PLANS = [
  {
    code: 'PASS_30',
    name: '30-day pass',
    durationDays: 30,
    priceCents: 199,
    currency: 'USD',
    paddlePriceId: 'pri_01m619081d9accppmkn3em6cge',
  },
  {
    code: 'PASS_90',
    name: '90-day pass',
    durationDays: 90,
    priceCents: 349,
    currency: 'USD',
    paddlePriceId: 'pri_01m6191nxex7krafptdz9t1jzr',
  },
]