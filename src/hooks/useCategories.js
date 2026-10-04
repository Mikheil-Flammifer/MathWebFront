import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '../api/categoryApi'

export default function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoryApi.list()).data.data,
    staleTime: 10 * 60 * 1000, // categories basically never change
  })
}