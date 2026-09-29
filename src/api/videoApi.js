import api from './axios'

export const videoApi = {
  list:   (page = 0, size = 12) =>
    api.get('/api/videos', { params: { page, size } }),
  search: (query, page = 0, size = 12) =>
    api.get('/api/videos/search', { params: { query, page, size } }),
  get:    (id) => api.get(`/api/videos/${id}`),
}