import { useInfiniteQuery } from '@tanstack/react-query'
import { videoApi } from '../api/videoApi'

export default function useVideos({ query, categoryId, sort } = {}) {
  return useInfiniteQuery({
    queryKey: ['videos', { query: query || null, categoryId: categoryId || null, sort: sort || null }],
    queryFn: async ({ pageParam = 0 }) => {
      const filters = {}
      if (categoryId) filters.categoryId = categoryId
      if (sort) filters.sort = sort
      const res = query
        ? await videoApi.search(query, pageParam, 12, filters)
        : await videoApi.list(pageParam, 12, filters)
      return res.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
  })
}