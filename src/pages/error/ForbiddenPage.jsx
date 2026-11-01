import { Link } from 'react-router-dom'
import { ShieldAlert, Home } from 'lucide-react'

export default function ForbiddenPage({ message }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full text-center animate-fade-in">
        <ShieldAlert className="mx-auto mb-3 text-amber-400" size={32} />
        <p className="mono-label mb-2">ERROR 403</p>
        <h1 className="section-title mb-2">No access</h1>
        <p className="text-sm text-chalk-400 mb-6">
          {message || "You don't have permission to open this page."}
        </p>
        <Link to="/home" className="btn-primary">
          <Home size={16} />
          Go to Home
        </Link>
      </div>
    </div>
  )
}