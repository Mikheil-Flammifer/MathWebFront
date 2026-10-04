import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '../api/commentApi'

export function useComments(videoId) {
  return useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const raw = (await commentApi.listForVideo(videoId)).data.data
      return Array.isArray(raw) ? raw : raw?.content ?? []
    },
    enabled: !!videoId,
  })
}

export function usePostComment(videoId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, parentCommentId }) =>
      commentApi.create({ videoId, content, parentId: parentCommentId ?? null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] }),
  })
}

export function useVoteComment(videoId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, direction }) =>
      direction === 'up' ? commentApi.upvote(commentId) : commentApi.downvote(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] }),
  })
}

export function useDeleteComment(videoId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId) => commentApi.remove(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] }),
  })
}