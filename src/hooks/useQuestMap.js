import { useQuery } from '@tanstack/react-query'
import { questApi } from '../api/questApi'

export function useQuestMap(questId) {
  return useQuery({
    queryKey: ['quest-map', String(questId)],
    queryFn: () => questApi.getMap(questId),
    enabled: !!questId,
    select: (data) => ({
      ...data,
      nodes: data?.nodes ?? [],
      edges: data?.edges ?? [],
    }),
  })
}