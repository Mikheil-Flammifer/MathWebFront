import { useState } from 'react'
import { AlertTriangle, BellOff, CheckCheck } from 'lucide-react'
import {
  useDeleteNotification,
  useMarkAllRead,
  useNotificationsInfinite,
  useOpenNotification,
  useUnreadCount,
} from '../../hooks/useNotifications'
import NotificationItem from '../../components/notification/NotificationItem'
import EmptyState from '../../components/common/EmptyState'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
]

export default function NotificationsPage() {
  const [tab, setTab] = useState('all')
  const unreadOnly = tab === 'unread'

  const { data: unread = 0 } = useUnreadCount()
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotificationsInfinite({ unreadOnly })
  const markAll = useMarkAllRead()
  const remove = useDeleteNotification()
  const open = useOpenNotification()

  const items = data?.pages.flatMap((p) => p.content) ?? []
  const deletingId = remove.isPending ? remove.variables : null

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="mt-1 text-chalk-400">
            {unread > 0 ? `${unread} unread` : 'You are all caught up.'}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={unread === 0 || markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="flex gap-1 border-b border-space-500">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'tab-item-active' : 'tab-item'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load notifications"
          subtitle="Check your connection and try again."
          action={
            <button type="button" className="btn-secondary" onClick={() => refetch()}>
              Try again
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          subtitle={
            unreadOnly
              ? 'Everything has been read.'
              : 'New videos, replies and quest updates will show up here.'
          }
        />
      ) : (
        <>
          <div className="card space-y-1 p-2">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onOpen={open}
                onDelete={(id) => remove.mutate(id)}
                deleting={deletingId === n.id}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <button
                type="button"
                className="btn-secondary"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? <span className="spinner-sm" /> : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}