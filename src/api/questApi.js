import api from './axios';

// Accepts a Spring Page or a custom PageResponse and always returns
// { items, page, size, totalElements, totalPages, last }
export function normalizePage(data) {
  if (Array.isArray(data)) {
    return {
      items: data,
      page: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      last: true,
    };
  }
  const items = data?.content ?? data?.items ?? [];
  const page = data?.page ?? data?.number ?? 0;
  const totalPages = data?.totalPages ?? 1;
  return {
    items,
    page,
    size: data?.size ?? items.length,
    totalElements: data?.totalElements ?? items.length,
    totalPages,
    last: data?.last ?? page >= totalPages - 1,
  };
}

export const questApi = {
  // params: { page, size, level, keyword }
  getAll: (params) =>
    api.get('/api/quests', { params }).then((res) => normalizePage(res.data.data)),
  getById: (id) => api.get(`/api/quests/${id}`),
  getMap: (id) => api.get(`/api/quests/${id}/map`).then((res) => res.data.data),

  // params: { page, size, level, published, keyword }
  getAdminAll: (params) =>
    api.get('/api/quests/admin', { params }).then((res) => normalizePage(res.data.data)),

  // Every quest (drafts included) as a plain array, for dropdowns/pickers.
  // Walks all pages, so it keeps working whatever the backend's max page size is.
  getAdminList: async (params = {}) => {
    const all = [];
    let page = 0;
    while (page < 50) {
      const res = await api.get('/api/quests/admin', {
        params: { ...params, page, size: 50 },
      });
      const p = normalizePage(res.data.data);
      all.push(...p.items);
      if (p.last) break;
      page += 1;
    }
    return all;
  },

  create: (data) => api.post('/api/quests', data),
  update: (id, data) => api.put(`/api/quests/${id}`, data),
  updateMap: (id, payload) =>
    api.put(`/api/quests/${id}/map`, payload).then((res) => res.data.data),
  publish: (id) => api.post(`/api/quests/${id}/publish`).then((res) => res.data.data),
  delete: (id) => api.delete(`/api/quests/${id}`),
};