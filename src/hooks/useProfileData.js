import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api/userApi'

export function useStats() {
  return useQuery({
    queryKey: ['me', 'stats'],
    queryFn: async () => (await userApi.getStats()).data.data,
  })
}

export function useProgress() {
  return useQuery({
    queryKey: ['me', 'progress'],
    queryFn: async () => (await userApi.getProgress()).data.data,
  })
}