import { getDifficultyInfo } from '../../utils/helpers'

export function DifficultyBadge({ level }) {
  const info = getDifficultyInfo(level)
  return (
    <span className={`badge ${info.color}`}>
      {info.label}
    </span>
  )
}

export function RoleBadge({ role }) {
  const colors = {
    ADMIN: 'bg-red-100 text-red-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    STUDENT: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`badge ${colors[role] || colors.STUDENT}`}>
      {role}
    </span>
  )
}

export function StatusBadge({ status }) {
  const colors = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT: 'bg-yellow-100 text-yellow-700',
    UPLOADING: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    ARCHIVED: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}