import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Logo from '../common/Logo'
import Footer from './Footer'
import useAuthStore from '../../store/authStore'

export default function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-space-500 bg-space-800/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Logo />
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/subscribe" className="text-chalk-300 hover:text-plasma-300">Pricing</Link>
            {isAuthenticated ? (
              <Link to="/home" className="btn-primary">Open app</Link>
            ) : (
              <>
                <Link to="/login" className="text-chalk-300 hover:text-plasma-300">Sign in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}