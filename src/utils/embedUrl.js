const ALLOWED_HOSTS = ['desmos.com', 'geogebra.org']

// True only for https URLs on desmos.com / geogebra.org (or their subdomains).
// Rejects other protocols, lookalike domains, credentials in the URL and custom ports.
export function isAllowedEmbedUrl(value) {
  if (typeof value !== 'string') return false

  let url
  try {
    url = new URL(value.trim())
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.port) return false

  return ALLOWED_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith('.' + host)
  )
}