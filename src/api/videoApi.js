import api from './axios'

// Staff calls return the unwrapped `data` (a VideoResponse).
// The existing list/search/get keep returning the raw axios response,
// because the current hooks already unwrap them.

export const videoApi = {
  list: (page = 0, size = 12, filters = {}) =>
    api.get('/api/videos', { params: { page, size, ...filters } }),

  // The backend parameter is `keyword`, not `query`.
  search: (keyword, page = 0, size = 12) =>
    api.get('/api/videos/search', { params: { keyword, page, size } }),

  get: (id) => api.get(`/api/videos/${id}`),

    // Staff only. Every status is returned. Returns the page object
    // { content, page, size, totalElements, totalPages, first, last }.
    listAdmin: ({ page = 0, size = 10, status, keyword, mine } = {}) => {
      const params = { page, size }
      if (status) params.status = status
      if (keyword) params.keyword = keyword
      if (mine) params.mine = true
      return api.get('/api/videos/admin', { params }).then((res) => res.data.data)
    },

  // Staff only. `data` = { title, description, difficultyLevel, free, questId, categoryId }.
  // The backend expects the "data" part as JSON, so it is sent as a Blob.
  // onProgress receives a number from 0 to 100.
  upload: (file, data, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    return api
      .post('/api/videos/upload', formData, {
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      })
      .then((res) => res.data.data)
  },

  // Staff only. All fields are optional, a missing field stays unchanged.
  // `data` can have: title, description, difficultyLevel, status, free, questId, categoryId.
  update: (id, data) =>
    api.put(`/api/videos/${id}`, data).then((res) => res.data.data),

  // Staff only. Returns the updated VideoResponse.
  uploadThumbnail: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/videos/${id}/thumbnail`, formData).then((res) => res.data.data)
  },

  remove: (id) => api.delete(`/api/videos/${id}`).then((res) => res.data),
}