import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

// Keeps the stored user (role, subscription, avatar…) in sync with the backend
export default function useCurrentUser() {
  const updateUser = useAuthStore((s) => s.updateUser)

  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/api/users/me')).data.data,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (query.data) updateUser(query.data)
  }, [query.data, updateUser])

  return query
}