import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { DIFFICULTY_LEVELS } from '../../utils/constants'
import { getAssetUrl } from '../../utils/helpers'

const LEVEL_OPTIONS = Object.entries(DIFFICULTY_LEVELS).map(([value, info]) => [
  value,
  `Level ${info.level} · ${info.label}`,
])

// UPLOADING and PROCESSING are set by the server, so they are not offered as a choice.
const STATUS_OPTIONS = [
  ['PUBLISHED', 'Published'],
  ['DRAFT', 'Draft'],
  ['ARCHIVED', 'Archived'],
]

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none'
const cardClass = 'space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6'
const labelClass = 'mb-1 block text-sm font-medium text-white/80'
const helpClass = 'mt-1 text-xs text-white/50'
const primaryBtn =
  'rounded-lg bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50'
const ghostBtn =
  'rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5 disabled:opacity-30'

function formatMegabytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function VideoForm({
  initial,
  quests = [],
  isEdit = false,
  onSubmit,
  onCancel,
  submitting = false,
  progress = null,
  error = '',
  submitLabel = 'Save',
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [difficultyLevel, setDifficultyLevel] = useState(
    initial?.difficultyLevel ?? 'LEVEL_1_BEGINNER'
  )
  const [categoryId, setCategoryId] = useState(String(initial?.categoryId ?? ''))
  const [questId, setQuestId] = useState(String(initial?.questId ?? ''))
  const [free, setFree] = useState(initial?.free === true)
  const [status, setStatus] = useState(initial?.status ?? 'PUBLISHED')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [errors, setErrors] = useState({})

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((res) => res.data.data),
  })

  const subsOf = (main) =>
    main.subcategories || main.subCategories || main.children || []

  // Preview of a newly picked thumbnail. The object URL is released on change.
  const thumbnailPreview = useMemo(() => {
    return thumbnailFile ? URL.createObjectURL(thumbnailFile) : null
  }, [thumbnailFile])

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])

  const savedThumbnail = initial?.thumbnailPath ? getAssetUrl(initial.thumbnailPath) : null
  const shownThumbnail = thumbnailPreview || savedThumbnail

  const pickVideo = (event) => {
    const file = event.target.files && event.target.files[0]
    setVideoFile(file || null)
    setErrors((prev) => ({ ...prev, videoFile: undefined }))
  }

  const pickThumbnail = (event) => {
    const file = event.target.files && event.target.files[0]
    if (file && !file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, thumbnail: 'Choose an image file' }))
      event.target.value = ''
      return
    }
    setThumbnailFile(file || null)
    setErrors((prev) => ({ ...prev, thumbnail: undefined }))
  }

  const getErrors = () => {
    const next = {}
    const trimmed = title.trim()
    if (trimmed.length < 3 || trimmed.length > 255) {
      next.title = 'Title must be between 3 and 255 characters'
    }
    if (description.length > 5000) {
      next.description = 'Description cannot exceed 5000 characters'
    }
    if (!isEdit) {
      if (!videoFile) {
        next.videoFile = 'Choose a video file'
      } else if (!videoFile.type.startsWith('video/')) {
        next.videoFile = 'This file is not a video'
      }
    }
    return next
  }

  const save = () => {
    const found = getErrors()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setErrors({})

    const payload = {
      title: title.trim(),
      description: description.trim(),
      difficultyLevel,
      free,
      questId: questId ? Number(questId) : null,
      categoryId: categoryId ? Number(categoryId) : null,
    }
    if (isEdit) {
      payload.status = status
    }

    onSubmit(payload, { videoFile, thumbnailFile })
  }

  const fieldError = (key) =>
    errors[key] ? <p className="mt-1 text-xs text-red-400">{errors[key]}</p> : null

  const showProgress = submitting && progress !== null

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-3xl space-y-6">
      <section className={cardClass}>
        <div>
          <h2 className="text-xl font-semibold text-white">
            {isEdit ? 'Video details' : 'New video'}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {isEdit
              ? 'Change the details. The video file itself cannot be replaced here.'
              : 'Choose the file and fill in the details.'}
          </p>
        </div>

        {!isEdit && (
          <div>
            <label className={labelClass}>Video file</label>
            <input
              type="file"
              accept="video/*"
              disabled={submitting}
              onChange={pickVideo}
              className="block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-400"
            />
            {videoFile && (
              <p className={helpClass}>
                {videoFile.name} · {formatMegabytes(videoFile.size)}
              </p>
            )}
            {fieldError('videoFile')}
          </div>
        )}

        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            maxLength={255}
            placeholder="For example: Introduction to counting"
            onChange={(e) => setTitle(e.target.value)}
          />
          {fieldError('title')}
        </div>

        <div>
          <label className={labelClass}>Description (optional)</label>
          <textarea
            className={inputClass}
            rows={5}
            value={description}
            maxLength={5000}
            placeholder="What will students learn?"
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className={helpClass}>{description.length} / 5000</p>
          {fieldError('description')}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Difficulty</label>
            <select
              className={inputClass}
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
            >
              {LEVEL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value} className="text-black">
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Category (optional)</label>
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="" disabled={isEdit && !!initial?.categoryId} className="text-black">
                No category
              </option>
              {categoryTree.map((main) => (
                <optgroup key={main.id} label={main.name} className="text-black">
                  {subsOf(main).map((sub) => (
                    <option key={sub.id} value={sub.id} className="text-black">
                      {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Quest (optional)</label>
          <select
            className={inputClass}
            value={questId}
            onChange={(e) => setQuestId(e.target.value)}
          >
            <option value="" disabled={isEdit && !!initial?.questId} className="text-black">
              Not attached to a quest
            </option>
            {quests.map((q) => (
              <option key={q.id} value={q.id} className="text-black">
                {q.title}
              </option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {!STATUS_OPTIONS.some(([value]) => value === status) && (
                <option value={status} disabled className="text-black">
                  {status}
                </option>
              )}
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value} className="text-black">
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <input
            type="checkbox"
            checked={free}
            onChange={(e) => setFree(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-violet-500"
          />
          <span>
            <span className="block text-sm font-medium text-white">Free video</span>
            <span className="block text-xs text-white/60">
              Everyone can watch it, even without a paid pass.
            </span>
          </span>
        </label>

        <div className="border-t border-white/10 pt-5">
          <label className={labelClass}>Thumbnail (optional)</label>
          {shownThumbnail && (
            <img
              src={shownThumbnail}
              alt="Thumbnail preview"
              className="mb-3 aspect-video w-full max-w-xs rounded-lg border border-white/10 object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={submitting}
            onChange={pickThumbnail}
            className="block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
          />
          {thumbnailFile && (
            <p className={helpClass}>New: {thumbnailFile.name}</p>
          )}
          {fieldError('thumbnail')}
        </div>
      </section>

      {showProgress && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>{progress < 100 ? 'Uploading…' : 'Processing on the server…'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-violet-400 transition-all"
              style={{ width: progress + '%' }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        {onCancel ? (
          <button type="button" className={ghostBtn} disabled={submitting} onClick={onCancel}>
            Cancel
          </button>
        ) : (
          <span />
        )}
        <button type="button" className={primaryBtn} disabled={submitting} onClick={save}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}