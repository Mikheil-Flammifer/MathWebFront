import { useQuery } from '@tanstack/react-query'
import { questApi } from '../api/questApi'

export default function useQuests() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: async () => (await questApi.getAll()).data.data,
  })
}