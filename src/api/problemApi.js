import api from './axios';

export const problemApi = {
  getByQuest: (questId) => api.get(`/api/problems/quest/${questId}`),
  getById: (id) => api.get(`/api/problems/${id}`),
  create: (data) => api.post('/api/problems', data),
  submit: (data) => api.post('/api/problems/submit', data),
  delete: (id) => api.delete(`/api/problems/${id}`),
  uploadQuestionImage: (id, formData) =>
    api.post(`/api/problems/${id}/image/question`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadExplanationImage: (id, formData) =>
    api.post(`/api/problems/${id}/image/explanation`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};