import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { questApi } from '../api/questApi'

// params: { page, size, level, keyword }
export default function useQuests(params = {}) {
  return useQuery({
    queryKey: ['quests', params],
    queryFn: () => questApi.getAll(params),
    placeholderData: keepPreviousData,
  })
}