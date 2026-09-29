import { useQuery } from '@tanstack/react-query'
import { videoApi } from '../api/videoApi'

export default function useVideo(id) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => (await videoApi.get(id)).data.data,
    enabled: !!id,
  })
}