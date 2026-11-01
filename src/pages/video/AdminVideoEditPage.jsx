import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { videoApi } from '../../api/videoApi'
import { questApi } from '../../api/questApi'
import VideoForm from '../../components/video/VideoForm'
import EmptyState from '../../components/common/EmptyState'

export default function AdminVideoEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const {
    data: video,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['video-edit', id],
    queryFn: () => videoApi.get(id).then((res) => res.data.data),
    retry: false,
  })

  const { data: quests = [] } = useQuery({
    queryKey: ['quests-admin'],
    queryFn: () => questApi.getAdminAll(),
  })

  const saveMutation = useMutation({
    mutationFn: async ({ payload, files }) => {
      await videoApi.update(id, payload)
      let thumbnailFailed = false
      if (files.thumbnailFile) {
        try {
          await videoApi.uploadThumbnail(id, files.thumbnailFile)
        } catch (thumbError) {
          thumbnailFailed = true
        }
      }
      return { thumbnailFailed }
    },
    onSuccess: ({ thumbnailFailed }) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: ['video', id] })
      queryClient.invalidateQueries({ queryKey: ['video-edit', id] })
      if (thumbnailFailed) {
        toast.error('Details saved, but the thumbnail failed. Try the thumbnail again.')
        return
      }
      toast.success('Video saved')
      navigate(`/videos/${id}`)
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Could not save the video')
    },
  })

  const handleSubmit = (payload, files) => {
    setError('')
    saveMutation.mutate({ payload, files })
  }

  if (isLoading) {
    return <div className="mx-auto h-96 max-w-3xl skeleton rounded-xl" />
  }

  if (isError || !video) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Video not found"
        subtitle="It may have been removed or the link is incorrect."
      />
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/videos/${id}`}
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Back to video
      </Link>

      <VideoForm
        key={video.updatedAt}
        isEdit
        initial={video}
        quests={quests}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitting={saveMutation.isPending}
        error={error}
        submitLabel="Save changes"
      />
    </div>
  )
}