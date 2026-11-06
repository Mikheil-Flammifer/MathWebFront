import api from './axios'

// Backend wraps everything as { success, message, data }.
export const notificationApi = {
  list: ({ page = 0, size = 20, unreadOnly = false } = {}) =>
    api
      .get('/api/notifications', { params: { page, size, unreadOnly } })
      .then((res) => res.data.data),

  unreadCount: () =>
    api.get('/api/notifications/unread-count').then((res) => res.data.data.count),

  markRead: (id) =>
    api.put(`/api/notifications/${id}/read`).then((res) => res.data.data),

  markAllRead: () =>
    api.put('/api/notifications/read-all').then((res) => res.data.data),

  remove: (id) => api.delete(`/api/notifications/${id}`).then((res) => res.data),
}