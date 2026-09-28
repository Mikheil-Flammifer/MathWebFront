import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/common/FormField'
import SubmitButton from '../../components/common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

const strengthScore = (pw) =>
  [pw.length >= 8, /[a-z]/.test(pw) && /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length

const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-sky-400', 'bg-emerald-500']
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const er = {}
    if (!form.firstName.trim()) er.firstName = 'Required'
    if (!form.lastName.trim()) er.lastName = 'Required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email'
    if (form.password.length < 8) er.password = 'At least 8 characters'
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const email = form.email.trim()
      await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        password: form.password,
      })
      sessionStorage.setItem(PENDING_EMAIL_KEY, email)
      toast.success('Account created. Check your email for the code.')
      navigate('/verify-otp', { state: { email } })
    } catch (err) {
      // Spring validation usually puts field errors in data.data
      const fe = err.response?.data?.data
      if (fe && typeof fe === 'object' && !Array.isArray(fe)) setErrors(fe)
      toast.error(getErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const score = strengthScore(form.password)

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start solving. It takes less than a minute."
      footer={<>Already have an account? <Link to="/login" className="text-plasma-300 hover:text-plasma-200 font-medium">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField id="firstName" label="First name" icon={User} autoComplete="given-name"
            value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
          <FormField id="lastName" label="Last name" autoComplete="family-name"
            value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
        </div>

        <FormField id="email" label="Email" icon={Mail} type="email" autoComplete="email"
          placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />

        <div>
          <FormField id="password" label="Password" icon={Lock} type="password" autoComplete="new-password"
            value={form.password} onChange={set('password')} error={errors.password} />
          {form.password && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1 rounded-full transition-colors ${i < score ? strengthColors[score - 1] : 'bg-space-500'}`} />
                ))}
              </div>
              <span className="text-xs text-chalk-400 w-12 text-right">{strengthLabels[Math.max(score - 1, 0)]}</span>
            </div>
          )}
        </div>

        <FormField id="confirm" label="Confirm password" icon={Lock} type="password" autoComplete="new-password"
          value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

        <SubmitButton loading={loading}>Create account <ArrowRight size={16} /></SubmitButton>
      </form>
    </AuthLayout>
  )
}