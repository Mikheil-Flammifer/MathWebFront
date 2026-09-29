
import { useInfiniteQuery } from '@tanstack/react-query'
import { videoApi } from '../api/videoApi'

export default function useVideos(query) {
  return useInfiniteQuery({
    queryKey: ['videos', query || null],
    queryFn: async ({ pageParam = 0 }) => {
      const res = query
        ? await videoApi.search(query, pageParam)
        : await videoApi.list(pageParam)
      return res.data.data // { content, totalPages, number, ... }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
  })
}