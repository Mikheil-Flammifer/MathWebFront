import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import {
  useMarkAllRead,
  useOpenNotification,
  useRecentNotifications,
  useUnreadCount,
} from '../../hooks/useNotifications'
import NotificationItem from './NotificationItem'

function Panel({ unread, onClose }) {
  const { data, isLoading, isError, refetch } = useRecentNotifications(8)
  const markAll = useMarkAllRead()
  const open = useOpenNotification(onClose)
  const items = data?.content ?? []

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="fixed inset-x-3 top-16 z-50 mt-2 rounded-xl border border-space-400 bg-space-700 animate-fade-in sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-96"
      style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center justify-between border-b border-space-500 px-4 py-3">
        <p className="text-sm font-semibold text-chalk-50">Notifications</p>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={unread === 0 || markAll.isPending}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-plasma-300 hover:text-plasma-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-1.5">
        {isLoading && (
          <div className="space-y-2 p-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 skeleton" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 text-center text-sm text-chalk-400">
            Could not load notifications.{' '}
            <button type="button" onClick={() => refetch()} className="text-plasma-300 underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <BellOff size={24} className="text-chalk-500" />
            <p className="text-sm text-chalk-400">You're all caught up.</p>
          </div>
        )}

        {items.map((n) => (
          <NotificationItem key={n.id} notification={n} onOpen={open} />
        ))}
      </div>

      <div className="border-t border-space-500 p-2">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block rounded-lg py-2 text-center text-sm font-medium text-chalk-300 hover:bg-space-600 hover:text-chalk-50"
        >
          View all
        </Link>
      </div>
    </div>
  )
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation()
  const { data: unread = 0 } = useUnreadCount()

  const close = useCallback(() => setOpen(false), [])

  // close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="btn-icon relative touch-target no-zoom"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && <Panel unread={unread} onClose={close} />}
    </div>
  )
}