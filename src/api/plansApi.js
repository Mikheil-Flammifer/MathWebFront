import api from './axios'
import { USE_MOCK_PLANS, MOCK_PLANS } from '../utils/paddleConfig'

// Active plans: { code, name, durationDays, priceCents, currency, paddlePriceId }
export async function fetchPlans() {
  if (USE_MOCK_PLANS) {
    return MOCK_PLANS
  }
  const res = await api.get('/api/plans')
  return res.data.data // assumed to be wrapped like /api/users/me; confirm with the real JSON
}