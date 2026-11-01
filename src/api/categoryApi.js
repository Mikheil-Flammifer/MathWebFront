import api from './axios'

export const categoryApi = {
  // students and teachers (filters, forms)
  list: () => api.get('/api/categories'),

  // ADMIN only
  adminList: () => api.get('/api/admin/categories'),
  adminCreate: (body) => api.post('/api/admin/categories', body),
  adminUpdate: (id, body) => api.put('/api/admin/categories/' + id, body),
  adminRemove: (id) => api.delete('/api/admin/categories/' + id),
}