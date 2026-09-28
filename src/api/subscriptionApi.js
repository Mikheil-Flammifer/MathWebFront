import api from './axios';

export const subscriptionApi = {
  getMy: () => api.get('/api/subscriptions/my'),
  create: () => api.post('/api/subscriptions/create'),
  cancel: () => api.post('/api/subscriptions/cancel'),
};