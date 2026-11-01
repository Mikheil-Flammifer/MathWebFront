import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '../api/categoryApi'

const ADMIN_KEY = ['admin-categories']

// backend wrapper: { success, message, data }
const unwrap = (res) => res.data.data

export function useAdminCategories() {
  return useQuery({
    queryKey: ADMIN_KEY,
    queryFn: async () => unwrap(await categoryApi.adminList()),
  })
}

function useCategoryMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      // refresh the admin tree and the lists used by filters and forms
      queryClient.invalidateQueries({ queryKey: ADMIN_KEY })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useCreateCategory() {
  return useCategoryMutation(async (body) => unwrap(await categoryApi.adminCreate(body)))
}

// call as mutate({ id, body })
export function useUpdateCategory() {
  return useCategoryMutation(async ({ id, body }) =>
    unwrap(await categoryApi.adminUpdate(id, body))
  )
}

// call as mutate(id)
export function useDeleteCategory() {
  return useCategoryMutation(async (id) => {
    await categoryApi.adminRemove(id)
    return id
  })
}