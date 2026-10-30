import api from './axios'

// data: { id, status, amountCents, currency, currentPeriodStart,
//         currentPeriodEnd, cancelledAt, isActive }
// No subscription: 200 with isActive false and the other fields null.
export async function fetchMySubscription() {
  const res = await api.get('/api/subscriptions/my')
  return res.data.data
}