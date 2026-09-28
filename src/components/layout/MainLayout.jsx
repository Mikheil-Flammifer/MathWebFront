import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import useCurrentUser from '../../hooks/useCurrentUser'

export default function MainLayout() {
  useCurrentUser()

  // scroll to top on page change
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}