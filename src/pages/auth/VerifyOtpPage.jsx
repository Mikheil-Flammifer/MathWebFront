import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import useAuthStore from '../../store/authStore'
import AuthLayout from '../../components/layout/AuthLayout'
import OtpInput from '../../components/common/OtpInput'
import SubmitButton from '../../components/common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const email = location.state?.email || sessionStorage.getItem(PENDING_EMAIL_KEY)

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const verify = async (code) => {
    if (loading || code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.verifyOtp({ email, otp: code })
      sessionStorage.removeItem(PENDING_EMAIL_KEY)
      const d = data.data
      if (d?.accessToken) {
        // backend logged us in right after verification
        setAuth(d.user, d.accessToken, d.refreshToken)
        toast.success('Email verified. Welcome to MathWeb!')
        navigate('/home', { replace: true })
      } else {
        toast.success('Email verified. You can sign in now.')
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid or expired code'))
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  // auto-submit when all 6 digits are in
  useEffect(() => {
    if (otp.length === 6) verify(otp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  const resend = async () => {
    try {
      await authApi.resendOtp(email)
      toast.success('New code sent')
      setCooldown(60)
      setError('')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not resend code'))
    }
  }

  if (!email) return null

  return (
    <AuthLayout
      title="Check your email"
      subtitle={<>We sent a 6-digit code to <span className="text-chalk-100 font-medium">{email}</span>. It expires in 10 minutes.</>}
      footer={<Link to="/login" className="inline-flex items-center gap-1.5 hover:text-chalk-100"><ArrowLeft size={14} /> Back to sign in</Link>}
    >
      <form onSubmit={(e) => { e.preventDefault(); verify(otp) }} className="space-y-6">
        {error && <div className="alert-error"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />
        <SubmitButton loading={loading} disabled={otp.length !== 6}>Verify email</SubmitButton>
        <p className="text-sm text-chalk-400 text-center">
          Didn't get it?{' '}
          {cooldown > 0 ? (
            <span className="text-chalk-500">Resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={resend} className="text-plasma-300 hover:text-plasma-200 font-medium">Resend code</button>
          )}
        </p>
      </form>
    </AuthLayout>
  )
}