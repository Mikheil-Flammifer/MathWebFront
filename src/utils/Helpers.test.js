import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  cn,
  formatDuration,
  formatFileSize,
  timeAgo,
  getDifficultyInfo,
  getAssetUrl,
  getFullName,
  getInitials,
  getErrorMessage,
  getCooldownRemainingMs,
  formatCountdown,
} from './helpers'

afterEach(() => {
  vi.useRealTimers()
})

describe('cn', () => {
  it('joins truthy values only', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })
})

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [null, '0:00'],
    [5, '0:05'],
    [65, '1:05'],
    [3600, '1:00:00'],
    [3661, '1:01:01'],
    [65.9, '1:05'],
  ])('%p -> %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected)
  })
})

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1536, '1.5 KB'],
    [2 * 1024 ** 2, '2.0 MB'],
    [3 * 1024 ** 3, '3.0 GB'],
  ])('%p -> %s', (input, expected) => {
    expect(formatFileSize(input)).toBe(expected)
  })
})

describe('timeAgo', () => {
  const NOW = new Date('2026-06-15T12:00:00Z')
  const ago = (ms) => new Date(NOW.getTime() - ms).toISOString()

  it('returns an empty string for no date', () => {
    expect(timeAgo(null)).toBe('')
  })

  it.each([
    [30 * 1000, 'just now'],
    [5 * 60 * 1000, '5m ago'],
    [3 * 3600 * 1000, '3h ago'],
    [3 * 86400 * 1000, '3d ago'],
    [60 * 86400 * 1000, '2mo ago'],
    [800 * 86400 * 1000, '2y ago'],
  ])('%p ms ago -> %s', (ms, expected) => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    expect(timeAgo(ago(ms))).toBe(expected)
  })
})

describe('getDifficultyInfo', () => {
  it('returns the info for a known level', () => {
    expect(getDifficultyInfo('LEVEL_3_INTERMEDIATE')).toMatchObject({ label: 'Intermediate', level: 3 })
  })

  it('falls back for an unknown level', () => {
    expect(getDifficultyInfo('NOPE')).toEqual({ label: 'NOPE', level: 0, badge: 'badge-gray' })
  })

  it('falls back to "Unknown" for nothing', () => {
    expect(getDifficultyInfo(undefined).label).toBe('Unknown')
  })
})

describe('getAssetUrl', () => {
  it('returns null for an empty path', () => {
    expect(getAssetUrl(null)).toBeNull()
    expect(getAssetUrl('')).toBeNull()
  })

  it('keeps absolute URLs', () => {
    expect(getAssetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
  })

  it('does not double the slash for a path with a leading slash', () => {
    const url = getAssetUrl('/uploads/images/a.png')
    expect(url.endsWith('/uploads/images/a.png')).toBe(true)
    expect(url.endsWith('//uploads/images/a.png')).toBe(false)
  })
})

describe('names', () => {
  it('getFullName joins and trims', () => {
    expect(getFullName({ firstName: 'Ana', lastName: 'K' })).toBe('Ana K')
    expect(getFullName({ firstName: 'Ana' })).toBe('Ana')
    expect(getFullName(null)).toBe('')
  })

  it('getInitials uppercases the first letters', () => {
    expect(getInitials({ firstName: 'ana', lastName: 'kim' })).toBe('AK')
    expect(getInitials(null)).toBe('?')
  })
})

describe('getErrorMessage', () => {
  it('prefers the server message', () => {
    const err = { response: { data: { message: 'Nope' } } }
    expect(getErrorMessage(err)).toBe('Nope')
  })

  it('explains a network failure', () => {
    expect(getErrorMessage({ request: {} })).toMatch(/cannot reach the server/i)
  })

  it('uses the error message, then the fallback', () => {
    expect(getErrorMessage({ message: 'boom' })).toBe('boom')
    expect(getErrorMessage({}, 'fallback')).toBe('fallback')
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
  })
})

describe('cooldown helpers', () => {
  it('getCooldownRemainingMs is 0 for none or past times', () => {
    expect(getCooldownRemainingMs(null)).toBe(0)
    expect(getCooldownRemainingMs('2000-01-01T00:00:00Z')).toBe(0)
  })

  it('getCooldownRemainingMs returns the time left', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
    expect(getCooldownRemainingMs('2026-06-15T12:00:05Z')).toBe(5000)
  })

  it.each([
    [0, '0:00'],
    [1, '0:01'],
    [61000, '1:01'],
    [600000, '10:00'],
  ])('formatCountdown(%p) -> %s', (ms, expected) => {
    expect(formatCountdown(ms)).toBe(expected)
  })
})