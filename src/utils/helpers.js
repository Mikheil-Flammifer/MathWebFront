import { API_BASE_URL, DIFFICULTY_LEVELS } from './constants'

export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

export const timeAgo = (dateString) => {
  if (!dateString) return ''
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`
  return `${Math.floor(seconds / 31536000)}y ago`
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export const getDifficultyInfo = (level) =>
  DIFFICULTY_LEVELS[level] || { label: level || 'Unknown', level: 0, badge: 'badge-gray' }

// Works for videos, thumbnails, avatars, problem images
export const getAssetUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}
export const getVideoUrl = getAssetUrl

export const getFullName = (user) =>
  user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''

export const getInitials = (user) =>
  user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?'

// Reads your backend's { success:false, message } error envelope
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.request && !error.response) return 'Cannot reach the server. Is the backend running?'
  return error?.message || fallback
}

// ms left until retryAvailableAt (ISO string), 0 if none or already passed
export function getCooldownRemainingMs(retryAvailableAt) {
  if (!retryAvailableAt) return 0
  const diff = new Date(retryAvailableAt).getTime() - Date.now()
  return diff > 0 ? diff : 0
}

export function formatCountdown(ms) {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}