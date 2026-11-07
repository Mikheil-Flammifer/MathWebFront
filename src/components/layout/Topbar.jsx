import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, X, Menu } from 'lucide-react'
import Logo from '../common/Logo'
import UserMenu from './UserMenu'
import NotificationBell from '../notification/NotificationBell'

export default function Topbar({ onMobileMenuClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [searchOpen, setSearchOpen] = useState(false)

  // Sync search input with URL
  useEffect(() => {
    setQ(params.get('q') || '')
  }, [params])

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false)
  }, [location])

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/home?q=${encodeURIComponent(term)}` : '/home')
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-space-500 flex items-center gap-4 px-4 sm:px-6 lg:px-8 safe-area-inset-top">
      {/* Mobile: Hamburger Menu */}
      <button
        onClick={onMobileMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-space-600 transition-colors touch-target no-zoom"
        aria-label="Open menu"
      >
        <Menu size={24} className="text-chalk-200" />
      </button>

      {/* Search - Desktop */}
      <form onSubmit={submit} className="hidden sm:block flex-1 max-w-xl" role="search">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-500 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons, e.g. quadratic equations"
            className="input-field pl-10 pr-10 py-2.5 bg-space-800/80 touch-target"
            aria-label="Search videos"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(''); navigate('/home') }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-icon w-7 h-7 touch-target no-zoom"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Mobile Search Toggle */}
      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="sm:hidden p-2 rounded-lg hover:bg-space-600 transition-colors touch-target no-zoom"
        aria-label="Search"
      >
        <Search size={22} className="text-chalk-200" />
      </button>

      {/* User Menu */}
        {/* Notifications + User Menu */}
        <div className="ml-auto flex items-center gap-1.5">
          <NotificationBell />
          <UserMenu />
        </div>

      {/* Mobile Search Bar (slides down) */}
      {searchOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-space-800/95 backdrop-blur-md border-b border-space-500 p-4">
          <form onSubmit={submit} className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-chalk-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lessons..."
              autoFocus
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-space-700 border border-space-500 text-chalk-50 placeholder:text-chalk-600 focus:outline-none focus:border-plasma-500 text-lg"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-chalk-500 hover:text-chalk-200 p-2 touch-target no-zoom"
              aria-label="Close search"
            >
              <X size={24} />
            </button>
          </form>
        </div>
      )}
    </header>
  )
}