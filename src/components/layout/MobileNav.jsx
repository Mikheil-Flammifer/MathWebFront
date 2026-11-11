import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

// Bottom tab bar for small screens. The header, search and drawer
// live in Topbar and Sidebar.
export default function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-space-500 safe-area-inset-bottom"
    >
      {/* grid-cols-5 matches the 5 items in NAV_ITEMS. Change it if you add or remove one. */}
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors touch-target no-zoom ${
                  isActive ? 'text-plasma-300' : 'text-chalk-500 hover:text-chalk-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-x-0 top-0 h-0.5 ${
                      isActive ? 'bg-plasma-500' : 'bg-transparent'
                    }`}
                  />
                  <Icon size={22} />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}