import { useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { ShieldCheck, Sparkles, X } from 'lucide-react'
import Logo from '../common/Logo'
import useAuthStore from '../../store/authStore'
import { ADMIN_DASHBOARD_URL, ROLES } from '../../utils/constants'
import { NAV_ITEMS, STAFF_NAV_ITEMS, ADMIN_NAV_ITEMS } from './navItems'

const linkClass = ({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === ROLES.ADMIN
  const isStaff = isAdmin || user?.role === ROLES.TEACHER

  // Close sidebar on escape key
  useEffect(() => {
    if (!mobileOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') onMobileClose?.()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen, onMobileClose])

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop: fixed, Mobile: slide-in */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-space-500 bg-space-800/80 backdrop-blur-md ${
          mobileOpen ? 'flex' : 'hidden lg:flex'
        }`}
        style={mobileOpen ? { paddingTop: 'env(safe-area-inset-top)' } : {}}
      >
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden h-16 px-5 flex items-center justify-between border-b border-space-500">
          <Logo to="/home" />
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-space-600 transition-colors touch-target no-zoom"
            aria-label="Close menu"
          >
            <X size={24} className="text-chalk-200" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:h-16 lg:px-5 lg:flex lg:items-center border-b border-space-500">
          <Logo to="/home" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          <p className="mono-label px-3 pt-3 pb-2">MENU</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onMobileClose}
              className={`${linkClass({ isActive: false })} touch-target no-zoom`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isStaff && (
            <>
              <p className="mono-label px-3 pt-5 pb-2">MANAGE</p>
              {STAFF_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onMobileClose}
                  className={`${linkClass({ isActive: false })} touch-target no-zoom`}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </>
          )}

          {isAdmin && (
            <>
              <p className="mono-label px-3 pt-5 pb-2">ADMIN</p>
              {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onMobileClose}
                  className={`${linkClass({ isActive: false })} touch-target no-zoom`}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
              {ADMIN_DASHBOARD_URL && (
                <a
                  href={ADMIN_DASHBOARD_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="nav-item touch-target no-zoom"
                  onClick={onMobileClose}
                >
                  <ShieldCheck size={18} />
                  Admin panel
                </a>
              )}
            </>
          )}
        </nav>

        {/* Premium CTA */}
        {!user?.hasActiveSubscription && (
          <div className="p-3 border-t border-space-500">
            <div className="card-plasma">
              <div className="flex items-center gap-2 text-plasma-300 mb-1.5">
                <Sparkles size={15} />
                <span className="text-sm font-semibold">Go Premium</span>
              </div>
              <p className="text-xs text-chalk-400 mb-3.5">
                Unlock every video and quest for $2.49/month.
              </p>
              <Link
                to="/subscribe"
                className="btn-primary w-full py-2 touch-target no-zoom"
                onClick={onMobileClose}
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}