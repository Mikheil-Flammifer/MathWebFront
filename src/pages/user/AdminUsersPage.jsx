import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Ban,
  Gift,
  History,
  Search,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../utils/constants'
import { formatDate, getFullName } from '../../utils/helpers'
import { parseApiError } from '../../utils/parseApiError'
import {
  useAdminUsers,
  useSetUserActive,
  useUpdateUserRole,
} from '../../hooks/useAdminUsers'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import UserAccessModal from '../../components/user/UserAccessModal'
import AccessHistoryModal from '../../components/user/AccessHistoryModal'

const PAGE_SIZE = 20

const inputClass =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none'

const ACTIVE_FILTERS = [
  ['', 'Active and inactive'],
  ['true', 'Active only'],
  ['false', 'Inactive only'],
]

const ACCESS_FILTERS = [
  ['', 'Any access'],
  ['true', 'Has access'],
  ['false', 'No access'],
]

function daysLeft(value) {
  const end = new Date(value).getTime()
  if (Number.isNaN(end)) return 0
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000))
}

function AccessBadge({ user }) {
  if (user.hasActiveAccess) {
    const left = daysLeft(user.accessEndsAt)
    return (
      <span className="badge-success">
        Access until {formatDate(user.accessEndsAt)} · {left} {left === 1 ? 'day' : 'days'} left
      </span>
    )
  }
  return <span className="badge-gray">No access</span>
}

export default function AdminUsersPage() {
  const me = useAuthStore((s) => s.user)

  const [page, setPage] = useState(0)
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('')
  const [active, setActive] = useState('')
  const [hasAccess, setHasAccess] = useState('')

  // null | { mode: 'grant' | 'revoke', user }
  const [accessModal, setAccessModal] = useState(null)
  const [historyUser, setHistoryUser] = useState(null)

  const { data, isLoading, isError, error, isPlaceholderData } = useAdminUsers({
    page,
    size: PAGE_SIZE,
    keyword,
    role,
    active,
    hasAccess,
  })

  const roleMutation = useUpdateUserRole()
  const activeMutation = useSetUserActive()
  const busy = roleMutation.isPending || activeMutation.isPending

  const users = data?.content ?? []

  const resetPage = () => setPage(0)

  const submitSearch = (event) => {
    event.preventDefault()
    setKeyword(keywordInput.trim())
    resetPage()
  }

  const changeRole = (user, nextRole) => {
    if (nextRole === user.role) return
    const ok = window.confirm(
      `Change the role of ${getFullName(user)} from ${user.role} to ${nextRole}?`
    )
    if (!ok) return
    roleMutation.mutate(
      { id: user.id, role: nextRole },
      {
        onSuccess: () => toast.success('Role updated'),
        onError: (err) => toast.error(parseApiError(err, 'Could not change the role.').message),
      }
    )
  }

  const toggleActive = (user) => {
    const next = !user.active
    if (!next) {
      const ok = window.confirm(
        `Deactivate ${getFullName(user)}? They will be signed out and cannot log in.`
      )
      if (!ok) return
    }
    activeMutation.mutate(
      { id: user.id, active: next },
      {
        onSuccess: () => toast.success(next ? 'User activated' : 'User deactivated'),
        onError: (err) => toast.error(parseApiError(err, 'Could not update the user.').message),
      }
    )
  }

  const hasFilters = keyword || role || active || hasAccess

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="mono-label mb-2">ADMIN</p>
        <h1 className="page-title flex items-center gap-3">
          <Users className="text-plasma-400" size={28} />
          Users
        </h1>
        <p className="text-sm text-chalk-400 mt-2">
          Manage roles and accounts, and give people free access.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={keywordInput}
            placeholder="Search name or email"
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          <button type="submit" className="btn-secondary inline-flex items-center gap-1">
            <Search size={15} /> Search
          </button>
        </form>

        <select
          className={inputClass}
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            resetPage()
          }}
        >
          <option value="" className="text-black">All roles</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r} className="text-black">{r}</option>
          ))}
        </select>

        <select
          className={inputClass}
          value={active}
          onChange={(e) => {
            setActive(e.target.value)
            resetPage()
          }}
        >
          {ACTIVE_FILTERS.map(([value, label]) => (
            <option key={value} value={value} className="text-black">{label}</option>
          ))}
        </select>

        <select
          className={inputClass}
          value={hasAccess}
          onChange={(e) => {
            setHasAccess(e.target.value)
            resetPage()
          }}
        >
          {ACCESS_FILTERS.map(([value, label]) => (
            <option key={value} value={value} className="text-black">{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-64 skeleton rounded-xl" />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load users"
          subtitle={parseApiError(error, 'Check that the backend is running and try again.').message}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          subtitle={hasFilters ? 'Try other filters.' : 'No users yet.'}
        />
      ) : (
        <div className={isPlaceholderData ? 'space-y-2 opacity-60' : 'space-y-2'}>
          {users.map((u) => {
            const isSelf = u.id === me?.id
            return (
              <div
                key={u.id}
                className="card flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar user={u} className="w-11 h-11 text-sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{getFullName(u)}</h3>
                      {isSelf && <span className="badge-plasma">You</span>}
                      {!u.active && <span className="badge-danger">Inactive</span>}
                      {!u.emailVerified && <span className="badge-warning">Not verified</span>}
                    </div>
                    <p className="text-sm text-chalk-400 truncate">{u.email}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <AccessBadge user={u} />
                      <span className="text-xs text-chalk-500">
                        #{u.id} · joined {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={inputClass + ' py-1.5'}
                    value={u.role}
                    disabled={isSelf || busy}
                    title={isSelf ? 'You cannot change your own role' : 'Change role'}
                    onChange={(e) => changeRole(u, e.target.value)}
                  >
                    {Object.values(ROLES).map((r) => (
                      <option key={r} value={r} className="text-black">{r}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-1"
                    onClick={() => setAccessModal({ mode: 'grant', user: u })}
                  >
                    <Gift size={15} /> Grant access
                  </button>

                  {u.hasActiveAccess && (
                    <button
                      type="button"
                      className="btn-secondary inline-flex items-center gap-1"
                      onClick={() => setAccessModal({ mode: 'revoke', user: u })}
                    >
                      <Ban size={15} /> Revoke
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-icon"
                    title="Access history"
                    aria-label={'Access history of ' + getFullName(u)}
                    onClick={() => setHistoryUser(u)}
                  >
                    <History size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn-icon"
                    disabled={(isSelf && u.active) || busy}
                    title={
                      isSelf && u.active
                        ? 'You cannot deactivate yourself'
                        : u.active
                          ? 'Deactivate user'
                          : 'Activate user'
                    }
                    aria-label={(u.active ? 'Deactivate ' : 'Activate ') + getFullName(u)}
                    onClick={() => toggleActive(u)}
                  >
                    {u.active ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="btn-secondary"
            disabled={data.first || isPlaceholderData}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span className="text-sm text-chalk-400">
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} users
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={data.last || isPlaceholderData}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {accessModal && (
        <UserAccessModal
          mode={accessModal.mode}
          user={accessModal.user}
          onClose={() => setAccessModal(null)}
        />
      )}

      {historyUser && (
        <AccessHistoryModal user={historyUser} onClose={() => setHistoryUser(null)} />
      )}
    </div>
  )
}