import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import useAuthStore from '../../store/authStore'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/common/FormField'
import SubmitButton from '../../components/common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return setError('Enter your email and password')
    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.login({ email: email.trim(), password })
      const { accessToken, refreshToken, user } = data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate('/home', { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err, 'Login failed')
      // Account exists but email not verified yet: send them to OTP
      if (err.response?.status === 403 && /verif/i.test(msg)) {
        sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim())
        toast(msg)
        navigate('/verify-otp', { state: { email: email.trim() } })
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your quest."
      footer={<>New here? <Link to="/register" className="text-plasma-300 hover:text-plasma-200 font-medium">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <div className="alert-error"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}

        <FormField id="email" label="Email" icon={Mail} type="email" autoComplete="email"
          placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div>
          <FormField id="password" label="Password" icon={Lock} type="password" autoComplete="current-password"
            placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="text-right mt-2">
            <Link to="/forgot-password" className="text-xs text-chalk-400 hover:text-plasma-300">Forgot password?</Link>
          </div>
        </div>

        <SubmitButton loading={loading}>Sign in <ArrowRight size={16} /></SubmitButton>
      </form>
    </AuthLayout>
  )
}