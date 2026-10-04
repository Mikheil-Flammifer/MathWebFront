import api from './axios'

export const videoApi = {
  list:   (page = 0, size = 12, filters = {}) =>
    api.get('/api/videos', { params: { page, size, ...filters } }),
  search: (query, page = 0, size = 12, filters = {}) =>
    api.get('/api/videos/search', { params: { query, page, size, ...filters } }),
  get:    (id) => api.get(`/api/videos/${id}`),
}