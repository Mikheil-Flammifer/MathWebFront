import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/common/FormField'
import OtpInput from '../../components/common/OtpInput'
import SubmitButton from '../../components/common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

const MAX_CODE_ATTEMPTS = 5

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || sessionStorage.getItem(PENDING_EMAIL_KEY) || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [failedCodes, setFailedCodes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)

  // the server kills the code after 5 wrong tries
  const codeDead = failedCodes >= MAX_CODE_ATTEMPTS

  const submit = async (e) => {
    e.preventDefault()
    if (codeDead) return
    const er = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email'
    if (otp.length !== 6) er.otp = 'Enter the 6-digit code'
    if (password.length < 8) er.password = 'At least 8 characters'
    if (confirm !== password) er.confirm = 'Passwords do not match'
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    setFormError('')
    try {
      await authApi.resetPassword({ email: email.trim(), code: otp, newPassword: password })
      sessionStorage.removeItem(PENDING_EMAIL_KEY)
      toast.success('Password updated. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err, 'Could not reset password')
      setFormError(msg)
      // only a wrong or expired code uses up an attempt
      if (/invalid or expired/i.test(msg)) {
        setFailedCodes((n) => n + 1)
        setOtp('')
      }
    } finally {
      setLoading(false)
    }
  }

  const requestNewCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: 'Enter a valid email' })
      return
    }
    setRequesting(true)
    try {
      await authApi.forgotPassword(email.trim())
      toast.success('If this email exists, a code has been sent.')
      setFailedCodes(0)
      setFormError('')
      setOtp('')
    } catch (err) {
      // rate limit message (400) is shown as-is
      toast.error(getErrorMessage(err))
    } finally {
      setRequesting(false)
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter the code we emailed you and choose a new password."
      footer={<Link to="/login" className="inline-flex items-center gap-1.5 hover:text-chalk-100"><ArrowLeft size={14} /> Back to sign in</Link>}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {formError && (
          <div role="alert" className="alert-error">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{formError}
          </div>
        )}

        {codeDead && (
          <div role="alert" className="alert-error">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              Too many wrong codes. This code no longer works.{' '}
              <button
                type="button"
                onClick={requestNewCode}
                disabled={requesting}
                className="underline font-medium disabled:opacity-50"
              >
                {requesting ? 'Sending…' : 'Request a new code'}
              </button>
            </span>
          </div>
        )}

        <FormField id="email" label="Email" icon={Mail} type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />

        <div>
          <label className="input-label">Reset code</label>
          <OtpInput value={otp} onChange={setOtp} disabled={loading || codeDead} />
          {errors.otp && <p className="input-error">{errors.otp}</p>}
        </div>

        <FormField id="password" label="New password" icon={Lock} type="password" autoComplete="new-password"
          value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <FormField id="confirm" label="Confirm new password" icon={Lock} type="password" autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />

        <SubmitButton loading={loading} disabled={codeDead}>Update password</SubmitButton>
      </form>
    </AuthLayout>
  )
}