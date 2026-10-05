import api from './axios';

export const questApi = {
  getAll: () => api.get('/api/quests'),
  getById: (id) => api.get(`/api/quests/${id}`),
  getMap: (id) => api.get(`/api/quests/${id}/map`).then((res) => res.data.data),
  getAdminAll: () => api.get('/api/quests/admin').then((res) => res.data.data),
  create: (data) => api.post('/api/quests', data),
  update: (id, data) => api.put(`/api/quests/${id}`, data),
  updateMap: (id, payload) =>
    api.put(`/api/quests/${id}/map`, payload).then((res) => res.data.data),
  publish: (id) => api.post(`/api/quests/${id}/publish`).then((res) => res.data.data),
  delete: (id) => api.delete(`/api/quests/${id}`),
};