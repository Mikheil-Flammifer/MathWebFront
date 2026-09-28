import api from './axios';

export const questApi = {
  getAll: () => api.get('/api/quests'),
  getById: (id) => api.get(`/api/quests/${id}`),
  create: (data) => api.post('/api/quests', data),
  update: (id, data) => api.put(`/api/quests/${id}`, data),
  publish: (id) => api.post(`/api/quests/${id}/publish`),
  delete: (id) => api.delete(`/api/quests/${id}`),
};