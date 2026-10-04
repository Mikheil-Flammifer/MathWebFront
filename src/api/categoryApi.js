import api from './axios'

export const categoryApi = {
  list: () => api.get('/api/categories'),
}