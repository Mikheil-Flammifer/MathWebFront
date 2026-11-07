import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUserApi } from '../api/adminUserApi'

const USERS_KEY = 'admin-users'

export function useAdminUsers(params) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => adminUserApi.list(params),
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useAccessHistory(userId, enabled = true) {
  return useQuery({
    queryKey: ['access-history', userId],
    queryFn: () => adminUserApi.history(userId),
    enabled: enabled && !!userId,
    staleTime: 0,
  })
}

function useUserMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['access-history'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

// mutate({ id, role })
export function useUpdateUserRole() {
  return useUserMutation(({ id, role }) => adminUserApi.setRole(id, role))
}

// mutate({ id, active })
export function useSetUserActive() {
  return useUserMutation(({ id, active }) =>
    active ? adminUserApi.activate(id) : adminUserApi.deactivate(id)
  )
}

// mutate({ id, days, note })
export function useGrantAccess() {
  return useUserMutation(({ id, days, note }) =>
    adminUserApi.grantAccess(id, { days, note: note || null })
  )
}

// mutate({ id, note })
export function useRevokeAccess() {
  return useUserMutation(({ id, note }) => adminUserApi.revokeAccess(id, note))
}