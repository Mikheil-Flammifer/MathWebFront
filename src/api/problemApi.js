import api from './axios';

// kind is 'question' or 'explanation'
const IMAGE_KINDS = ['question', 'explanation'];

function imageUrl(id, kind) {
  if (!IMAGE_KINDS.includes(kind)) {
    throw new Error('Unknown image kind: ' + kind);
  }
  return `/api/problems/${id}/image/${kind}`;
}

export const problemApi = {
  getByQuest: (questId) => api.get(`/api/problems/quest/${questId}`),
  getById: (id) => api.get(`/api/problems/${id}`).then((res) => res.data.data),
  create: (data) => api.post('/api/problems', data),
  submit: (payload) =>
    api.post('/api/problems/submit', payload).then((res) => res.data.data),
  hint: (id) => api.post(`/api/problems/${id}/hint`).then((res) => res.data.data),
  giveUp: (id) =>
    api.post(`/api/problems/${id}/give-up`).then((res) => res.data.data),
  delete: (id) => api.delete(`/api/problems/${id}`),

  // Staff only. Returns the full ProblemResponse.
  uploadImage: (id, kind, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(imageUrl(id, kind), formData).then((res) => res.data.data);
  },
  deleteImage: (id, kind) =>
    api.delete(imageUrl(id, kind)).then((res) => res.data.data),
};

export const problemStaffApi = {
  getById: (id) => api.get(`/api/problems/${id}`).then((res) => res.data.data),
  create: (data) => api.post('/api/problems', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/api/problems/${id}`, data).then((res) => res.data.data),
};