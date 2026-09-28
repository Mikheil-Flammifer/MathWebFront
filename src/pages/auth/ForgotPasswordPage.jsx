import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/common/FormField'
import SubmitButton from '../../components/common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email')
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim())
      toast.success('If that account exists, a code is on its way.')
      navigate('/reset-password', { state: { email: email.trim() } })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a code to reset it."
      footer={<Link to="/login" className="inline-flex items-center gap-1.5 hover:text-chalk-100"><ArrowLeft size={14} /> Back to sign in</Link>}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <FormField id="email" label="Email" icon={Mail} type="email" autoComplete="email"
          placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <SubmitButton loading={loading}>Send reset code <ArrowRight size={16} /></SubmitButton>
      </form>
    </AuthLayout>
  )
}