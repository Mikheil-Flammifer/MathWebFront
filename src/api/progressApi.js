import api from './axios';

export const progressApi = {
  getTopics: () =>
    api.get('/api/progress/topics').then((res) => res.data.data),

  getMistakes: (categoryId) =>
    api
      .get('/api/progress/mistakes', {
        params: categoryId ? { categoryId } : {},
      })
      .then((res) => res.data.data),

  getStreak: () =>
    api.get('/api/progress/streak').then((res) => res.data.data),
};