import api from './axios'

export const commentApi = {
  listForVideo: (videoId) => api.get(`/api/comments/video/${videoId}`),
  create:       (data)    => api.post('/api/comments', data),
  update:       (id, content) => api.put(`/api/comments/${id}`, { content }),
  remove:       (id)      => api.delete(`/api/comments/${id}`),
  upvote:       (id)      => api.post(`/api/comments/${id}/upvote`),
  downvote:     (id)      => api.post(`/api/comments/${id}/downvote`),
}