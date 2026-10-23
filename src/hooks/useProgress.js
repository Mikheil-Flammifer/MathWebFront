import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';

export function useProgressTopics() {
  return useQuery({
    queryKey: ['progress', 'topics'],
    queryFn: () => progressApi.getTopics(),
    staleTime: 30 * 1000,
  });
}

export function useProgressMistakes(categoryId) {
  return useQuery({
    queryKey: ['progress', 'mistakes', categoryId ?? 'all'],
    queryFn: () => progressApi.getMistakes(categoryId),
    staleTime: 30 * 1000,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['progress', 'streak'],
    queryFn: () => progressApi.getStreak(),
    staleTime: 30 * 1000,
  });
}