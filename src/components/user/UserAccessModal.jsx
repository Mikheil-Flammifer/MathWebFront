import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import { useGrantAccess, useRevokeAccess } from '../../hooks/useAdminUsers'
import { parseApiError } from '../../utils/parseApiError'
import { formatDate, getFullName } from '../../utils/helpers'

const PRESETS = [30, 90, 180, 365]

export default function UserAccessModal({ mode, user, onClose }) {
  const isGrant = mode === 'grant'

  const [days, setDays] = useState('30')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const grant = useGrantAccess()
  const revoke = useRevokeAccess()
  const pending = grant.isPending || revoke.isPending

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !pending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, onClose])

  const handleError = (err) => {
    const { message, fieldErrors } = parseApiError(err, 'Could not save the change.')
    const mapped = {}
    Object.entries(fieldErrors).forEach(([key, value]) => {
      mapped[key] = String(value)
    })
    setErrors(mapped)
    setFormError(Object.keys(mapped).length > 0 ? '' : message)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pending) return
    setFormError('')
    setErrors({})

    if (isGrant) {
      const n = Number(days)
      if (!Number.isInteger(n) || n < 1 || n > 3650) {
        setErrors({ days: 'Enter a whole number from 1 to 3650' })
        return
      }
      grant.mutate(
        { id: user.id, days: n, note: note.trim() },
        {
          onSuccess: () => {
            toast.success(`Granted ${n} days to ${getFullName(user)}`)
            onClose()
          },
          onError: handleError,
        }
      )
    } else {
      revoke.mutate(
        { id: user.id, note: note.trim() },
        {
          onSuccess: () => {
            toast.success('Access revoked')
            onClose()
          },
          onError: handleError,
        }
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/70 backdrop-blur-sm"
      onClick={() => {
        if (!pending) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="card w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="mono-label mb-1">{isGrant ? 'FREE ACCESS' : 'REVOKE ACCESS'}</p>
            <h2 className="section-title truncate">{getFullName(user)}</h2>
            <p className="text-xs text-chalk-500 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div className="alert-error mb-4" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isGrant ? (
            <>
              {user.hasActiveAccess && user.accessEndsAt && (
                <p className="text-sm text-chalk-400">
                  Access is active until{' '}
                  <span className="text-chalk-100">{formatDate(user.accessEndsAt)}</span>. The
                  days are added after that date.
                </p>
              )}

              <div>
                <label className="input-label" htmlFor="grant-days">Days</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDays(String(p))}
                      className={String(p) === days ? 'btn-primary py-1.5 px-3' : 'btn-secondary py-1.5 px-3'}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  id="grant-days"
                  type="number"
                  min="1"
                  max="3650"
                  step="1"
                  className="input-field"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  autoFocus
                />
                {errors.days && <p className="input-error">{errors.days}</p>}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Access ends right now
              {user.accessEndsAt ? ` (it was running until ${formatDate(user.accessEndsAt)})` : ''}.
              This also ends a pass the user paid for, because gifted and paid time are not
              tracked separately.
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="grant-note">Note (optional)</label>
            <textarea
              id="grant-note"
              className="input-field min-h-[72px]"
              value={note}
              maxLength={500}
              placeholder={isGrant ? 'For example: scholarship' : 'Why is access removed?'}
              onChange={(e) => setNote(e.target.value)}
            />
            {errors.note && <p className="input-error">{errors.note}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button
              type="submit"
              className={isGrant ? 'btn-primary' : 'btn-danger'}
              disabled={pending}
            >
              {pending && <Loader2 className="animate-spin" size={16} />}
              {isGrant ? 'Grant access' : 'Revoke access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}