import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { videoApi } from '../../api/videoApi'
import { questApi } from '../../api/questApi'
import VideoForm from '../../components/video/VideoForm'

function messageOf(err, fallback) {
  if (err?.response?.status === 413) return 'The file is too large for the server.'
  return err?.response?.data?.message || fallback
}

export default function AdminVideoCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  const { data: quests = [] } = useQuery({
    queryKey: ['quests-admin'],
    queryFn: () => questApi.getAdminList(),
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ payload, files }) => {
      setProgress(0)
      const video = await videoApi.upload(files.videoFile, payload, setProgress)
      let thumbnailFailed = false
      if (files.thumbnailFile) {
        try {
          await videoApi.uploadThumbnail(video.id, files.thumbnailFile)
        } catch (thumbError) {
          thumbnailFailed = true
        }
      }
      return { video, thumbnailFailed }
    },
    onSuccess: ({ video, thumbnailFailed }) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      if (thumbnailFailed) {
        toast.error('Video uploaded, but the thumbnail failed. Add it here.')
        navigate(`/admin/videos/${video.id}/edit`)
      } else {
        toast.success('Video uploaded')
        navigate(`/videos/${video.id}`)
      }
    },
    onError: (err) => {
      setProgress(null)
      setError(messageOf(err, 'Could not upload the video'))
    },
  })

  const handleSubmit = (payload, files) => {
    setError('')
    uploadMutation.mutate({ payload, files })
  }

  return (
    <div className="space-y-6">
      <Link
        to="/home"
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <VideoForm
        quests={quests}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitting={uploadMutation.isPending}
        progress={progress}
        error={error}
        submitLabel="Upload video"
      />
    </div>
  )
}