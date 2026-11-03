import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import useCurrentUser from '../../hooks/useCurrentUser'

export default function MainLayout() {
  const me = useCurrentUser()
  const meStatus = me.error?.response?.status
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 401 is handled by the hook (logout). Everything else keeps the user here.
  const showMeError = me.isError && meStatus !== 401

  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen full-viewport-height">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 animate-fade-in">
          {showMeError && (
            <div
              role="alert"
              className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              <span>Could not refresh your account data. Check your connection.</span>
              <button
                type="button"
                onClick={() => me.refetch()}
                disabled={me.isFetching}
                className="rounded-lg border border-red-400/40 px-3 py-1 font-medium hover:bg-red-500/20 disabled:opacity-50 touch-target no-zoom"
              >
                {me.isFetching ? 'Retrying…' : 'Retry'}
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}