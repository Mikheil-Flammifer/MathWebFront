import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '../api/commentApi'

export function useComments(videoId) {
  return useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => (await commentApi.listForVideo(videoId)).data.data,
    enabled: !!videoId,
  })
}

export function usePostComment(videoId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, parentCommentId }) =>
      commentApi.create({ videoId, content, parentCommentId: parentCommentId ?? null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] }),
  })
}

export function useUpvoteComment(videoId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId) => commentApi.upvote(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] }),
  })
}