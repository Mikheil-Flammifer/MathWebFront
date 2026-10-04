import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { problemApi } from '../api/problemApi'

export function useProblem(id) {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: async () => (await problemApi.getById(id)).data.data,
    enabled: !!id,
  })
}

export function useSubmitAnswer(problemId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answer) => problemApi.submit({ problemId: Number(problemId), answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] })
      queryClient.invalidateQueries({ queryKey: ['quest'] })
    },
  })
}