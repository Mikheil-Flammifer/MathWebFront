import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
      toast.success('Password reset code sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full
                          flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-6">
            We sent a password reset code to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <button
            onClick={() => navigate(
              `/verify-otp?email=${encodeURIComponent(email)}&purpose=PASSWORD_RESET`
            )}
            className="btn-primary w-full flex items-center
                       justify-center gap-2"
          >
            Enter Reset Code
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-gray-500 hover:text-gray-700 mt-4 block w-full"
          >
            Try a different email
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset code"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
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
              <Mail className="w-5 h-5" />
              Send Reset Code
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{' '}
        <Link
          to="/login"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}