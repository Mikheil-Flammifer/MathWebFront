import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, User, Crown, ShieldCheck, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '../common/Avatar'
import { authApi } from '../../api/authApi'
import useAuthStore from '../../store/authStore'
import { API_BASE_URL, ROLES } from '../../utils/constants'
import { getFullName } from '../../utils/helpers'

export default function UserMenu() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    try {
      await authApi.logout() // blacklists the token; must run before we clear it
    } catch {
      /* even if this fails, we still log out locally */
    }
    logout()
    queryClient.clear()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  const itemClass = 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-chalk-300 hover:bg-space-600 hover:text-chalk-50 transition-colors'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-space-600 transition-colors"
      >
        <Avatar user={user} />
        <span className="hidden sm:block text-sm font-medium text-chalk-100 max-w-[9rem] truncate">
          {user?.firstName}
        </span>
        <ChevronDown size={15} className={`text-chalk-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-space-400 bg-space-700 p-2 animate-fade-in"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="px-3 py-2.5 mb-1 border-b border-space-500">
            <p className="text-sm font-semibold text-chalk-50 truncate">{getFullName(user)}</p>
            <p className="text-xs text-chalk-500 truncate mb-2">{user?.email}</p>
            <span className="badge-plasma">{user?.role}</span>
          </div>

          <Link to="/profile" onClick={() => setOpen(false)} className={itemClass}><User size={16} /> Profile</Link>
          <Link to="/subscribe" onClick={() => setOpen(false)} className={itemClass}>
            <Crown size={16} /> {user?.hasActiveSubscription ? 'Manage subscription' : 'Go Premium'}
          </Link>
          {user?.role === ROLES.ADMIN && (
            <a href={`${API_BASE_URL}/admin/login`} className={itemClass}><ShieldCheck size={16} /> Admin panel</a>
          )}

          <div className="my-1 border-t border-space-500" />
          <button onClick={handleLogout} className={`${itemClass} w-full hover:!text-red-400`}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}