import api from './axios'

const unwrap = (res) => res.data.data

export const adminUserApi = {
  // active and hasAccess: '' (no filter), 'true' or 'false'
  list: ({ page = 0, size = 20, keyword, role, active, hasAccess } = {}) => {
    const params = { page, size }
    if (keyword) params.keyword = keyword
    if (role) params.role = role
    if (active) params.active = active
    if (hasAccess) params.hasAccess = hasAccess
    return api.get('/api/admin/users', { params }).then(unwrap)
  },

  setRole: (id, role) =>
    api.put(`/api/admin/users/${id}/role`, null, { params: { role } }).then(unwrap),

  activate: (id) => api.put(`/api/admin/users/${id}/activate`),
  deactivate: (id) => api.put(`/api/admin/users/${id}/deactivate`),

  grantAccess: (id, body) =>
    api.post(`/api/admin/users/${id}/grant-access`, body).then(unwrap),

  revokeAccess: (id, note) =>
    api
      .post(`/api/admin/users/${id}/revoke-access`, null, {
        params: note ? { note } : {},
      })
      .then(unwrap),

  history: (id) => api.get(`/api/admin/users/${id}/access-history`).then(unwrap),
}