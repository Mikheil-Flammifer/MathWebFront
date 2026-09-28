import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/common/FormField'
import OtpInput from '../../components/common/OtpInput'
import SubmitButton from '../../components/common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || sessionStorage.getItem(PENDING_EMAIL_KEY) || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email'
    if (otp.length !== 6) er.otp = 'Enter the 6-digit code'
    if (password.length < 8) er.password = 'At least 8 characters'
    if (confirm !== password) er.confirm = 'Passwords do not match'
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    try {
      await authApi.resetPassword({ email: email.trim(), otp, newPassword: password })
      sessionStorage.removeItem(PENDING_EMAIL_KEY)
      toast.success('Password updated. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not reset password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter the code we emailed you and choose a new password."
      footer={<Link to="/login" className="inline-flex items-center gap-1.5 hover:text-chalk-100"><ArrowLeft size={14} /> Back to sign in</Link>}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <FormField id="email" label="Email" icon={Mail} type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />

        <div>
          <label className="input-label">Reset code</label>
          <OtpInput value={otp} onChange={setOtp} />
          {errors.otp && <p className="input-error">{errors.otp}</p>}
        </div>

        <FormField id="password" label="New password" icon={Lock} type="password" autoComplete="new-password"
          value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <FormField id="confirm" label="Confirm new password" icon={Lock} type="password" autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />

        <SubmitButton loading={loading}>Update password</SubmitButton>
      </form>
    </AuthLayout>
  )
}