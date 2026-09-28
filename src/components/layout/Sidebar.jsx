import { NavLink, Link } from 'react-router-dom'
import { ShieldCheck, Sparkles } from 'lucide-react'
import Logo from '../common/Logo'
import useAuthStore from '../../store/authStore'
import { API_BASE_URL, ROLES } from '../../utils/constants'
import { NAV_ITEMS } from './navItems'

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === ROLES.ADMIN

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-space-500 bg-space-800/80 backdrop-blur-md">
      <div className="h-16 px-5 flex items-center border-b border-space-500">
        <Logo to="/home" />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="mono-label px-3 pt-3 pb-2">MENU</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="mono-label px-3 pt-5 pb-2">ADMIN</p>
            <a href={`${API_BASE_URL}/admin/login`} className="nav-item">
              <ShieldCheck size={18} />
              Admin panel
            </a>
          </>
        )}
      </nav>

      {!user?.hasActiveSubscription && (
        <div className="p-3">
          <div className="card-plasma">
            <div className="flex items-center gap-2 text-plasma-300 mb-1.5">
              <Sparkles size={15} />
              <span className="text-sm font-semibold">Go Premium</span>
            </div>
            <p className="text-xs text-chalk-400 mb-3.5">
              Unlock every video and quest for $2.49/month.
            </p>
            <Link to="/subscribe" className="btn-primary w-full py-2">Upgrade</Link>
          </div>
        </div>
      )}
    </aside>
  )
}