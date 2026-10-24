import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

// Keeps the stored user (role, subscription, avatar…) in sync with the backend.
// 401  -> the session is gone: log out (axios already tried one refresh).
// 5xx or network error -> stay logged in, retry twice, then expose the error.
export default function useCurrentUser() {
  const userId = useAuthStore((s) => s.user?.id)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useAuthStore((s) => s.logout)

  const query = useQuery({
    // the user id is in the key, so a different account never sees cached data
    queryKey: ['me', userId],
    queryFn: async () => (await api.get('/api/users/me')).data.data,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      const status = error?.response?.status
      if (status && status < 500) {
        return false
      }
      return failureCount < 2
    },
  })

  useEffect(() => {
    if (query.data) {
      updateUser(query.data)
    }
  }, [query.data, updateUser])

  const status = query.error?.response?.status
  useEffect(() => {
    if (status === 401) {
      logout()
    }
  }, [status, logout])

  return query
}