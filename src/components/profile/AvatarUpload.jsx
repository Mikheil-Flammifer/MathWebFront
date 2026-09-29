import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { userApi } from '../../api/userApi'
import useAuthStore from '../../store/authStore'
import Avatar from '../common/Avatar'
import { getErrorMessage } from '../../utils/helpers'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function AvatarUpload() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const queryClient = useQueryClient()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > MAX_SIZE) return toast.error('Image must be under 5MB')

    setUploading(true)
    try {
      const { data } = await userApi.uploadAvatar(file)
      updateUser({ avatarUrl: data.data.avatarUrl })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Avatar updated')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative w-20 h-20 shrink-0">
      <Avatar user={user} className="w-20 h-20 text-2xl" />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Change avatar"
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-plasma-500 hover:bg-plasma-400
                   grid place-items-center text-white border-2 border-space-800 transition-colors disabled:opacity-50"
      >
        {uploading ? <span className="spinner-sm border-white/30 border-t-white w-4 h-4" /> : <Camera size={14} />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  )
}