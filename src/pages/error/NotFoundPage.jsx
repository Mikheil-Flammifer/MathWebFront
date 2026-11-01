import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function NotFoundPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()

  const homePath = isAuthenticated ? '/home' : '/'

  const handleBack = () => {
    // opened directly (no history): going back would leave the site
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(homePath, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center animate-fade-in">
        <p className="mono-label mb-4">ERROR 404</p>

        <div
          className="animate-float font-display font-semibold text-chalk-50 leading-none mb-6"
          style={{ fontSize: 'clamp(5rem, 22vw, 9rem)' }}
        >
          <span className="text-glow-plasma">4</span>
          <span className="text-chalk-400">0</span>
          <span className="text-glow-plasma">4</span>
        </div>

        <h1 className="page-title mb-3">This page doesn't exist</h1>

        <div className="eq-block text-left inline-block mb-4">
          page = ? &nbsp;→&nbsp; undefined
        </div>

        <p className="text-chalk-400 text-sm mb-1">
          We couldn't find anything at
        </p>
        <p className="font-mono text-xs text-chalk-500 mb-8 break-all">
          {location.pathname}
        </p>

        <div className="accent-rule mb-8" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={homePath} className="btn-primary">
            <Home size={16} />
            {isAuthenticated ? 'Go to Home' : 'Go to start page'}
          </Link>
          <button type="button" onClick={handleBack} className="btn-secondary">
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}