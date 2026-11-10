import { describe, it, expect } from 'vitest'
import { parseApiError } from './parseApiError'

const httpError = (status, body) => ({ response: { status, data: body } })

describe('parseApiError', () => {
  it('returns the status, the server message and field errors', () => {
    const err = httpError(400, { message: 'Validation failed', data: { name: 'Required' } })
    expect(parseApiError(err)).toEqual({
      status: 400,
      message: 'Validation failed',
      fieldErrors: { name: 'Required' },
    })
  })

  it('ignores data that is not a field-error object', () => {
    expect(parseApiError(httpError(500, { message: 'x', data: ['a'] })).fieldErrors).toEqual({})
    expect(parseApiError(httpError(500, { message: 'x', data: 'text' })).fieldErrors).toEqual({})
    expect(parseApiError(httpError(500, { message: 'x', data: null })).fieldErrors).toEqual({})
  })

  it('explains a network failure', () => {
    const r = parseApiError({ request: {} })
    expect(r.status).toBeUndefined()
    expect(r.message).toMatch(/cannot reach the server/i)
  })

  it('uses the fallback when the server sends no message', () => {
    expect(parseApiError(httpError(500, {}), 'Custom').message).toBe('Custom')
    expect(parseApiError(new Error('x')).message).toMatch(/something went wrong/i)
  })

  it('does not crash on null', () => {
    expect(() => parseApiError(null)).not.toThrow()
  })
})