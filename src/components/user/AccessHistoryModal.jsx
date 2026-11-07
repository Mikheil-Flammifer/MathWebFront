import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useAccessHistory } from '../../hooks/useAdminUsers'
import { parseApiError } from '../../utils/parseApiError'
import { formatDate, getFullName } from '../../utils/helpers'

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AccessHistoryModal({ user, onClose }) {
  const { data, isLoading, isError, error } = useAccessHistory(user.id)
  const rows = data || []

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="mono-label mb-1">ACCESS HISTORY</p>
            <h2 className="section-title truncate">{getFullName(user)}</h2>
            <p className="text-xs text-chalk-500 truncate">{user.email}</p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        )}

        {isError && (
          <div className="alert-error">
            {parseApiError(error, 'Could not load the history.').message}
          </div>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <p className="text-sm text-chalk-500">
            No free grants or revokes yet. Paid passes are not listed here.
          </p>
        )}

        <div className="space-y-2">
          {rows.map((row) => {
            const isGrant = row.action === 'GRANT'
            return (
              <div
                key={row.id}
                className="rounded-xl border border-space-500 bg-space-800/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={isGrant ? 'badge-success' : 'badge-danger'}>
                    {isGrant ? `Granted +${row.days} days` : 'Revoked'}
                  </span>
                  <span className="text-xs text-chalk-500">{formatDateTime(row.createdAt)}</span>
                </div>
                <p className="mt-2 text-xs text-chalk-400">
                  {row.accessEndsAt ? `Access ends ${formatDate(row.accessEndsAt)}` : ''}
                  {row.accessEndsAt && ' · '}
                  by {row.grantedByName || (row.grantedById ? `user #${row.grantedById}` : 'unknown')}
                </p>
                {row.note && <p className="mt-1.5 text-sm text-chalk-200 break-words">{row.note}</p>}
              </div>
            )
          })}
        </div>

        {rows.length >= 50 && (
          <p className="mt-3 text-xs text-chalk-500">Showing the latest 50 entries.</p>
        )}
      </div>
    </div>
  )
}