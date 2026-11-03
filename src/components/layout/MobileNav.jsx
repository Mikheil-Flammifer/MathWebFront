import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Home, Map as MapIcon, TrendingUp, User, Crown, Search, ShieldCheck, Layers } from 'lucide-react'
import { NAV_ITEMS, STAFF_NAV_ITEMS, ADMIN_NAV_ITEMS } from './navItems'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../utils/constants'

const linkClass = ({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')

export default function MobileNav() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === ROLES.ADMIN
  const isStaff = isAdmin || user?.role === ROLES.TEACHER

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setSearchQuery('')
  }, [location])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/home?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  // Combine all nav items for bottom tab bar (only show main items)
  const mainNavItems = NAV_ITEMS

  return (
    <>
      {/* Mobile Header with Hamburger Menu */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 glass border-b border-space-500 safe-area-inset-top">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-space-600 transition-colors touch-target no-zoom"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={24} className="text-chalk-200" />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-space-600 transition-colors touch-target no-zoom"
            aria-label="Search"
          >
            <Search size={22} className="text-chalk-200" />
          </button>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-space-800 border-r border-space-500 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Menu Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-space-500">
          <span className="text-xl font-bold text-chalk-50">MathWeb</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-space-600 transition-colors touch-target no-zoom"
            aria-label="Close menu"
          >
            <X size={24} className="text-chalk-200" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 overflow-y-auto no-scrollbar">
          {/* Main Menu */}
          <p className="mono-label px-3 pt-3 pb-2 text-chalk-500">MENU</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors touch-target no-zoom ${
                  isActive
                    ? 'text-plasma-300 bg-plasma-500/10'
                    : 'text-chalk-300 hover:text-chalk-50 hover:bg-space-600'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}

          {/* Staff Menu */}
          {isStaff && (
            <>
              <p className="mono-label px-3 pt-5 pb-2 text-chalk-500">MANAGE</p>
              {STAFF_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors touch-target no-zoom ${
                      isActive
                        ? 'text-plasma-300 bg-plasma-500/10'
                        : 'text-chalk-300 hover:text-chalk-50 hover:bg-space-600'
                    }`
                  }
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </>
          )}

          {/* Admin Menu */}
          {isAdmin && (
            <>
              <p className="mono-label px-3 pt-5 pb-2 text-chalk-500">ADMIN</p>
              {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors touch-target no-zoom ${
                      isActive
                        ? 'text-plasma-300 bg-plasma-500/10'
                        : 'text-chalk-300 hover:text-chalk-50 hover:bg-space-600'
                    }`
                  }
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-space-800/95 backdrop-blur-sm animate-fade-in safe-area-inset-top"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
        >
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-chalk-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                autoFocus
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-space-700 border border-space-500 text-chalk-50 placeholder:text-chalk-600 focus:outline-none focus:border-plasma-500 text-lg"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-chalk-500 hover:text-chalk-200 p-2"
              >
                <X size={24} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (Tab Bar) - Only main items */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-space-500 safe-area-inset-bottom"
      >
        <ul className="grid grid-cols-5">
          {mainNavItems.map(({ to, label, icon: Icon }) => (
            <li key={to} className="relative">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors touch-target no-zoom ${
                    isActive
                      ? 'text-plasma-300'
                      : 'text-chalk-500 hover:text-chalk-200'
                  }`
                }
              >
                <Icon size={22} />
                <span className="truncate">{label}</span>
              </NavLink>
              {/* Active indicator */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 transition-colors ${
                  location.pathname === to ? 'bg-plasma-500' : 'bg-transparent'
                }`}
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}