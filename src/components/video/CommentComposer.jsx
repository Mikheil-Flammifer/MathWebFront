import { useState } from 'react'
import toast from 'react-hot-toast'
import Avatar from '../common/Avatar'
import useAuthStore from '../../store/authStore'
import { getErrorMessage } from '../../utils/helpers'

export default function CommentComposer({ onSubmit, placeholder = 'Add a comment...', autoFocus = false, onCancel }) {
  const user = useAuthStore((s) => s.user)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setPosting(true)
    try {
      await onSubmit(content)
      setText('')
      onCancel?.()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not post comment'))
    } finally {
      setPosting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-3">
      <Avatar user={user} className="w-8 h-8 text-xs shrink-0 mt-0.5" />
      <div className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={2}
          className="input-field resize-none text-sm"
        />
        <div className="flex justify-end gap-2 mt-2">
          {onCancel && <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>}
          <button type="submit" disabled={posting || !text.trim()} className="btn-primary py-1.5 px-4">
            {posting ? <span className="spinner-sm border-white/30 border-t-white" /> : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}