import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { notificationApi } from '../api/notificationApi'
import useAuthStore from '../store/authStore'
import { getErrorMessage } from '../utils/helpers'
import { safeInternalLink } from '../utils/notificationHelpers'

const POLL_MS = 30 * 1000

// The user id is in every key, so another account never sees cached data.
const useUserId = () => useAuthStore((s) => s.user?.id)

export function useUnreadCount() {
  const userId = useUserId()
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: notificationApi.unreadCount,
    enabled: !!userId,
    staleTime: POLL_MS / 2,
    refetchInterval: POLL_MS, // pauses while the tab is in the background
    retry: false,
  })
}

// Small list for the dropdown.
export function useRecentNotifications(size = 8) {
  const userId = useUserId()
  return useQuery({
    queryKey: ['notifications', 'recent', userId, size],
    queryFn: () => notificationApi.list({ page: 0, size }),
    enabled: !!userId,
    staleTime: 0,
  })
}

// Full page with "Load more".
export function useNotificationsInfinite({ unreadOnly = false } = {}) {
  const userId = useUserId()
  return useInfiniteQuery({
    queryKey: ['notifications', 'list', userId, { unreadOnly }],
    queryFn: ({ pageParam = 0 }) => notificationApi.list({ page: pageParam, size: 20, unreadOnly }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.page + 1),
    enabled: !!userId,
    staleTime: 0,
  })
}

function useRefreshNotifications() {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    [queryClient]
  )
}

export function useMarkRead() {
  const refresh = useRefreshNotifications()
  return useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: refresh,
  })
}

export function useMarkAllRead() {
  const refresh = useRefreshNotifications()
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: refresh,
    onError: (err) => toast.error(getErrorMessage(err, 'Could not mark all as read')),
  })
}

export function useDeleteNotification() {
  const refresh = useRefreshNotifications()
  return useMutation({
    mutationFn: (id) => notificationApi.remove(id),
    onSuccess: refresh,
    onError: (err) => toast.error(getErrorMessage(err, 'Could not delete the notification')),
  })
}

// Click handler shared by the dropdown and the page:
// marks it read (if needed) and goes to its link.
export function useOpenNotification(afterOpen) {
  const navigate = useNavigate()
  const markRead = useMarkRead()

  return useCallback(
    (notification) => {
      if (!notification.read) markRead.mutate(notification.id)
      const target = safeInternalLink(notification.link)
      if (afterOpen) afterOpen()
      if (target) navigate(target)
    },
    [markRead, navigate, afterOpen]
  )
}