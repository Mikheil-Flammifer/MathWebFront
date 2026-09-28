import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [form, setForm] = useState({
    code: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({
        email,
        code: form.code,
        newPassword: form.newPassword,
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the code from your email and your new password"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700
                        px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reset Code
          </label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="6-digit code"
            maxLength={6}
            required
            className="input-field text-center text-xl
                       tracking-widest font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-600"
            >
              {showPassword
                ? <EyeOff className="w-5 h-5" />
                : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center
                     justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white
                            border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <KeyRound className="w-5 h-5" />
              Reset Password
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link
          to="/login"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          ← Back to login
        </Link>
      </p>
    </AuthLayout>
  )
}