import { useQuery } from '@tanstack/react-query'
import { questApi } from '../api/questApi'

export default function useQuestDetail(id) {
  return useQuery({
    queryKey: ['quest', id],
    queryFn: async () => (await questApi.getById(id)).data.data,
    enabled: !!id,
  })
}