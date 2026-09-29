import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userApi } from '../../api/userApi'
import useAuthStore from '../../store/authStore'
import FormField from '../common/FormField'
import SubmitButton from '../common/SubmitButton'
import { getErrorMessage } from '../../utils/helpers'

export default function EditProfileForm() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const dirty = form.firstName !== user?.firstName || form.lastName !== user?.lastName

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!form.firstName.trim()) er.firstName = 'Required'
    if (!form.lastName.trim()) er.lastName = 'Required'
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    try {
      const { data } = await userApi.updateMe({ firstName: form.firstName.trim(), lastName: form.lastName.trim() })
      updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated')
    } catch (err) {
      const fe = err.response?.data?.data
      if (fe && typeof fe === 'object' && !Array.isArray(fe)) setErrors(fe)
      toast.error(getErrorMessage(err, 'Update failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-md">
      <div className="grid grid-cols-2 gap-4">
        <FormField id="firstName" label="First name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
        <FormField id="lastName" label="Last name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
      </div>
      <FormField id="email" label="Email" value={user?.email || ''} disabled hint="Email cannot be changed here" />
      <SubmitButton loading={loading} disabled={!dirty}>Save changes</SubmitButton>
    </form>
  )
}