import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, BookOpen, Home,
         Map, Bell } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import { authApi } from '../../api/authApi'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      // ignore
    } finally {
      logout()
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white
                    border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/home"
                className="flex items-center gap-2 font-bold
                           text-xl text-primary-600">
            <span className="text-2xl">📐</span>
            <span>MathWeb</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/home" icon={<Home className="w-4 h-4" />}
                     label="Home" />
            <NavLink to="/quests" icon={<Map className="w-4 h-4" />}
                     label="Quests" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Admin panel link */}
            {isAdmin() && (
              <a
                href="http://localhost:8080/admin/dashboard"
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5
                           text-sm text-gray-600 hover:text-primary-600
                           transition px-3 py-1.5 rounded-lg
                           hover:bg-primary-50"
              >
                <Settings className="w-4 h-4" />
                Admin
              </a>
            )}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl
                           hover:bg-gray-50 transition"
              >
                <Avatar user={user} size="sm" />
                <span className="hidden md:block text-sm font-medium
                                 text-gray-700 max-w-[120px] truncate">
                  {user?.firstName}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 w-56
                                  bg-white rounded-xl shadow-lg border
                                  border-gray-100 py-2 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5
                                 text-sm text-gray-700 hover:bg-gray-50
                                 transition"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/subscribe"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5
                                 text-sm text-gray-700 hover:bg-gray-50
                                 transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      Subscription
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full
                                   px-4 py-2.5 text-sm text-red-600
                                   hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                 text-sm font-medium text-gray-600 hover:text-primary-600
                 hover:bg-primary-50 transition"
    >
      {icon}
      {label}
    </Link>
  )
}