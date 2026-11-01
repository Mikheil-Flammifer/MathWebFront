export function parseApiError(err, fallback = 'Something went wrong. Try again.') {
  const status = err?.response?.status
  const body = err?.response?.data

  const fieldErrors =
    body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? body.data
      : {}

  let message = body?.message
  if (!message) {
    message = err?.request && !err?.response
      ? 'Cannot reach the server. Check your connection.'
      : fallback
  }

  return { status, message, fieldErrors }
}