import api from './axios';

export const userApi = {
  getMe: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
  changePassword: (data) => api.put('/api/users/me/password', data),
  updateAvatar: (formData) => api.post('/api/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyStats: () => api.get('/api/users/me/stats'),
  getMyProgress: () => api.get('/api/users/me/progress'),
  getUserById: (id) => api.get(`/api/users/${id}`),
  getAllUsers: (page = 0, size = 20) =>
    api.get(`/api/users?page=${page}&size=${size}`),
};