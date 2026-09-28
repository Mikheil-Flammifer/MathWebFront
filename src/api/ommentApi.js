import api from './axios';

export const commentApi = {
  getByVideo: (videoId, page = 0, size = 20) =>
    api.get(`/api/comments/video/${videoId}?page=${page}&size=${size}`),
  create: (data) => api.post('/api/comments', data),
  update: (id, data) => api.put(`/api/comments/${id}`, data),
  delete: (id) => api.delete(`/api/comments/${id}`),
  upvote: (id) => api.post(`/api/comments/${id}/upvote`),
};