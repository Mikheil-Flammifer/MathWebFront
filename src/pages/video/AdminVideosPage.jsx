import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AlertTriangle, ArrowLeft, Film, Pencil, Play, Plus, Search, Trash2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../utils/constants'
import { videoApi } from '../../api/videoApi'
import EmptyState from '../../components/common/EmptyState'
import { getAssetUrl, formatDuration, getDifficultyInfo } from '../../utils/helpers'

const PAGE_SIZE = 10

const STATUS_FILTERS = [
  ['', 'All statuses'],
  ['PUBLISHED', 'Published'],
  ['DRAFT', 'Draft'],
  ['ARCHIVED', 'Archived'],
]

const STATUS_BADGE = {
  PUBLISHED: { label: 'Published', badge: 'badge-success' },
  DRAFT: { label: 'Draft', badge: 'badge-warning' },
  ARCHIVED: { label: 'Archived', badge: 'badge-gray' },
  PROCESSING: { label: 'Processing', badge: 'badge-sky' },
  UPLOADING: { label: 'Uploading', badge: 'badge-sky' },
}

const inputClass =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none'

export default function AdminVideosPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isStaff = user?.role === ROLES.ADMIN || user?.role === ROLES.TEACHER
  const isAdmin = user?.role === ROLES.ADMIN

  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [mine, setMine] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['videos-admin', { page, status, mine, keyword }],
    queryFn: () => videoApi.listAdmin({ page, size: PAGE_SIZE, status, keyword, mine }),
    placeholderData: keepPreviousData,
    enabled: isStaff,
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => videoApi.remove(id),
    onSuccess: (result, id) => {
      toast.success('Video deleted')
      setConfirmId(null)
      queryClient.invalidateQueries({ queryKey: ['videos-admin'] })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.removeQueries({ queryKey: ['video', String(id)] })
      // The last row of a page was deleted: go one page back.
      if (data && data.content.length === 1 && page > 0) {
        setPage(page - 1)
      }
    },
    onError: (err) => {
      setConfirmId(null)
      toast.error(err?.response?.data?.message || 'Could not delete the video')
    },
  })

  if (!isStaff) return <Navigate to="/home" replace />

  const videos = data?.content ?? []

  const changeStatus = (value) => {
    setStatus(value)
    setPage(0)
    setConfirmId(null)
  }

  const changeMine = (value) => {
    setMine(value)
    setPage(0)
    setConfirmId(null)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setKeyword(keywordInput.trim())
    setPage(0)
    setConfirmId(null)
  }

  const canModify = (video) => isAdmin || video.uploadedBy?.id === user?.id

  return (
    <div className="space-y-6">
      <Link
        to="/home"
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Home
      </Link>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-white">Manage videos</h1>
        <Link to="/admin/videos/new" className="btn-primary inline-flex items-center gap-1">
          <Plus size={15} /> Upload video
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={keywordInput}
            placeholder="Search by title"
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          <button type="submit" className="btn-secondary inline-flex items-center gap-1">
            <Search size={15} /> Search
          </button>
        </form>

        <select
          className={inputClass}
          value={status}
          onChange={(e) => changeStatus(e.target.value)}
        >
          {STATUS_FILTERS.map(([value, label]) => (
            <option key={value} value={value} className="text-black">
              {label}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => changeMine(e.target.checked)}
            className="h-4 w-4 accent-violet-500"
          />
          My videos only
        </label>
      </div>

      {isLoading ? (
        <div className="h-64 skeleton rounded-xl" />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load videos"
          subtitle={error?.response?.data?.message || 'Check that the backend is running and try again.'}
        />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No videos found"
          subtitle={keyword || status || mine ? 'Try other filters.' : 'Upload your first video.'}
        />
      ) : (
        <div className={isPlaceholderData ? 'space-y-2 opacity-60' : 'space-y-2'}>
          {videos.map((video) => {
            const diff = getDifficultyInfo(video.difficultyLevel)
            const badge = STATUS_BADGE[video.status] || { label: video.status, badge: 'badge-gray' }
            const modifiable = canModify(video)
            const confirming = confirmId === video.id
            const deleting = deleteMutation.isPending && deleteMutation.variables === video.id

            return (
              <div
                key={video.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid aspect-video w-28 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/40 text-chalk-600">
                    {video.thumbnailPath ? (
                      <img
                        src={getAssetUrl(video.thumbnailPath)}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Play size={22} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{video.title}</h3>
                      <span className={`badge ${badge.badge}`}>{badge.label}</span>
                      {video.free === true && <span className="badge-plasma">Free</span>}
                    </div>
                    <p className="mt-1 text-sm text-chalk-400">
                      #{video.id} · <span className={`badge ${diff.badge} !py-0`}>{diff.label}</span>
                      {video.durationSeconds ? ` · ${formatDuration(video.durationSeconds)}` : ''}
                      {` · ${video.viewCount ?? 0} views · ${video.commentCount ?? 0} comments`}
                    </p>
                    <p className="text-xs text-chalk-500">
                      {video.questTitle ? `Quest: ${video.questTitle}` : 'No quest'}
                      {video.categoryName ? ` · ${video.categoryName}` : ''}
                      {video.uploadedBy
                        ? ` · by ${video.uploadedBy.firstName} ${video.uploadedBy.lastName}`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {confirming ? (
                    <>
                      <span className="text-sm text-red-300">Delete this video?</span>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={deleting}
                        onClick={() => setConfirmId(null)}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={deleting}
                        onClick={() => deleteMutation.mutate(video.id)}
                      >
                        {deleting ? 'Deleting…' : 'Yes, delete'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/videos/${video.id}`}
                        className="btn-secondary inline-flex items-center gap-1"
                      >
                        <Play size={15} /> Open
                      </Link>
                      {modifiable && (
                        <>
                          <Link
                            to={`/admin/videos/${video.id}/edit`}
                            className="btn-secondary inline-flex items-center gap-1"
                          >
                            <Pencil size={15} /> Edit
                          </Link>
                          <button
                            type="button"
                            className="btn-secondary inline-flex items-center gap-1"
                            onClick={() => setConfirmId(video.id)}
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="btn-secondary"
            disabled={data.first || isPlaceholderData}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span className="text-sm text-chalk-400">
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} videos
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={data.last || isPlaceholderData}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}