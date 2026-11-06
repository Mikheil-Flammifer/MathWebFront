import {
  Bell, MessageSquare, PlayCircle, Trophy, Unlock, Crown, Clock, Trash2,
} from 'lucide-react'
import { notificationTimeAgo } from '../../utils/notificationHelpers'

// Icons are components, so they live here and not in constants.js.
// Keep the keys in sync with the backend NotificationType enum.
const TYPE_STYLE = {
  SYSTEM:                 { icon: Bell,          tone: 'text-chalk-300 bg-space-600' },
  COMMENT_REPLY:          { icon: MessageSquare, tone: 'text-sky-400 bg-sky-400/10' },
  NEW_VIDEO:              { icon: PlayCircle,    tone: 'text-plasma-300 bg-plasma-500/15' },
  QUEST_COMPLETED:        { icon: Trophy,        tone: 'text-emerald-400 bg-emerald-400/10' },
  QUEST_UNLOCKED:         { icon: Unlock,        tone: 'text-amber-400 bg-amber-400/10' },
  SUBSCRIPTION_ACTIVATED: { icon: Crown,         tone: 'text-emerald-400 bg-emerald-400/10' },
  SUBSCRIPTION_EXPIRING:  { icon: Clock,         tone: 'text-amber-400 bg-amber-400/10' },
  SUBSCRIPTION_EXPIRED:   { icon: Clock,         tone: 'text-red-400 bg-red-400/10' },
}

export default function NotificationItem({ notification, onOpen, onDelete, deleting = false }) {
  const style = TYPE_STYLE[notification.type] || TYPE_STYLE.SYSTEM
  const Icon = style.icon
  const unread = !notification.read

  return (
    <div
      className={`group flex items-start gap-1 rounded-xl transition-colors hover:bg-space-600/60 ${
        unread ? 'bg-plasma-500/5' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-3 text-left"
      >
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${style.tone}`}>
          <Icon size={17} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span
              className={`line-clamp-1 text-sm ${
                unread ? 'font-semibold text-chalk-50' : 'font-medium text-chalk-300'
              }`}
            >
              {notification.title}
            </span>
            {unread && (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-plasma-400"
                aria-label="Unread"
              />
            )}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs text-chalk-400">
            {notification.message}
          </span>
          <span className="mt-1 block text-[11px] text-chalk-500">
            {notificationTimeAgo(notification.createdAt)}
          </span>
        </span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          disabled={deleting}
          aria-label="Delete notification"
          title="Delete"
          className="btn-icon mr-1 mt-2 h-8 w-8 shrink-0 opacity-100 hover:text-red-400 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}