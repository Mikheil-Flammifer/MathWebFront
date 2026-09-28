import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import toast from 'react-hot-toast'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const purpose = searchParams.get('purpose') || 'EMAIL_VERIFICATION'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const inputRefs = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)
    try {
      await authApi.verifyOtp({ email, code, purpose })
      toast.success('Email verified successfully!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authApi.resendOtp({ email, purpose })
      toast.success('New OTP sent to your email!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full
                        flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary-600" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700
                        px-4 py-3 rounded-lg mb-5 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* OTP inputs */}
        <div className="flex justify-center gap-3 mb-6"
             onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold
                         border-2 rounded-xl outline-none transition
                         ${digit
                           ? 'border-primary-500 bg-primary-50 text-primary-700'
                           : 'border-gray-200 focus:border-primary-400'
                         }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="btn-primary w-full flex items-center
                     justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white
                            border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Verify Email
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500 mb-2">
          Didn't receive the code?
        </p>
        {countdown > 0 ? (
          <p className="text-sm text-gray-400">
            Resend in <span className="font-medium text-primary-600">
              {countdown}s
            </span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-primary-600 font-medium
                       hover:text-primary-700 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>

      <div className="text-center mt-4">
        <Link to="/login"
              className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}