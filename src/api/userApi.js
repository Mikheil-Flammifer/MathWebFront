import api from './axios'

export const userApi = {
  getMe:          ()      => api.get('/api/users/me'),
  updateMe:       (data)  => api.put('/api/users/me', data),
  changePassword: (data)  => api.put('/api/users/me/password', data),
  getStats:       ()      => api.get('/api/users/me/stats'),
  getProgress:    ()      => api.get('/api/users/me/progress'),
  uploadAvatar:   (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/api/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}