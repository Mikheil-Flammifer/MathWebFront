import { useState } from 'react'
import toast from 'react-hot-toast'
import { userApi } from '../../api/userApi'
import FormField from '../common/FormField'
import SubmitButton from '../common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!form.currentPassword) er.currentPassword = 'Required'
    if (form.newPassword.length < 8) er.newPassword = 'At least 8 characters'
    if (form.confirm !== form.newPassword) er.confirm = 'Passwords do not match'
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    try {
      await userApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password updated')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not change password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-md">
      <FormField id="currentPassword" label="Current password" type="password" autoComplete="current-password"
        value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} />
      <FormField id="newPassword" label="New password" type="password" autoComplete="new-password"
        value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} />
      <FormField id="confirm" label="Confirm new password" type="password" autoComplete="new-password"
        value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
      <SubmitButton loading={loading}>Update password</SubmitButton>
    </form>
  )
}