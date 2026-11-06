// The server sends LocalDateTime without a zone ("2026-10-23T09:12:45.318211"),
// and the database stores UTC. new Date() would read it as local time, so add "Z".
export function parseServerDate(value) {
  if (!value) return null
  const text = String(value)
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(text)
  const date = new Date(hasZone ? text : text + 'Z')
  return Number.isNaN(date.getTime()) ? null : date
}

export function notificationTimeAgo(value) {
  const date = parseServerDate(value)
  if (!date) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Only allow in-app paths like "/videos/5". Blocks "//evil.com", "https://..." and "/\evil.com".
export function safeInternalLink(link) {
  if (typeof link !== 'string') return null
  if (!link.startsWith('/') || link.startsWith('//') || link.startsWith('/\\')) return null
  return link
}