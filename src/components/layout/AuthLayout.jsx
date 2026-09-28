import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50
                    via-white to-indigo-50 flex items-center
                    justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2
                                   font-bold text-2xl text-primary-600">
            <span className="text-3xl">📐</span>
            <span>MathWeb</span>
          </Link>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}