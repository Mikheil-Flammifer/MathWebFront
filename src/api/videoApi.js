import api from './axios';

export const videoApi = {
  getAll: (page = 0, size = 10, level = null) => {
    const params = new URLSearchParams({ page, size });
    if (level) params.append('level', level);
    return api.get(`/api/videos?${params}`);
  },
  getById: (id) => api.get(`/api/videos/${id}`),
  search: (keyword, page = 0, size = 10) =>
    api.get(`/api/videos/search?keyword=${keyword}&page=${page}&size=${size}`),
  upload: (formData) => api.post('/api/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/videos/${id}`, data),
  delete: (id) => api.delete(`/api/videos/${id}`),
  uploadThumbnail: (id, formData) =>
    api.post(`/api/videos/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};