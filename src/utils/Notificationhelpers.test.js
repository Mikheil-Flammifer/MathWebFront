import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseServerDate, notificationTimeAgo, safeInternalLink } from './notificationHelpers'

afterEach(() => {
  vi.useRealTimers()
})

describe('parseServerDate', () => {
  it('reads a zone-less server date as UTC', () => {
    const d = parseServerDate('2026-10-23T09:12:45')
    expect(d.getTime()).toBe(Date.UTC(2026, 9, 23, 9, 12, 45))
  })

  it('keeps an explicit Z', () => {
    expect(parseServerDate('2026-10-23T09:12:45Z').getTime()).toBe(Date.UTC(2026, 9, 23, 9, 12, 45))
  })

  it('keeps an explicit offset', () => {
    expect(parseServerDate('2026-10-23T09:12:45+02:00').getTime()).toBe(
      Date.UTC(2026, 9, 23, 7, 12, 45)
    )
  })

  it.each([null, undefined, '', 'garbage'])('returns null for %p', (v) => {
    expect(parseServerDate(v)).toBeNull()
  })
})

describe('notificationTimeAgo', () => {
  const NOW = new Date('2026-06-15T12:00:00Z')

  it.each([
    ['2026-06-15T11:59:50', 'just now'],
    ['2026-06-15T11:55:00', '5m ago'],
    ['2026-06-15T09:00:00', '3h ago'],
    ['2026-06-12T12:00:00', '3d ago'],
  ])('%s -> %s', (value, expected) => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    expect(notificationTimeAgo(value)).toBe(expected)
  })

  it('shows a date after 30 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    expect(notificationTimeAgo('2026-04-01T12:00:00')).not.toMatch(/ago/)
  })

  it('never shows a negative time for a date in the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    expect(notificationTimeAgo('2026-06-15T13:00:00')).toBe('just now')
  })

  it('returns an empty string for a bad date', () => {
    expect(notificationTimeAgo('nope')).toBe('')
  })
})

describe('safeInternalLink', () => {
  it.each(['/videos/5', '/quests/1?x=1', '/'])('allows %s', (link) => {
    expect(safeInternalLink(link)).toBe(link)
  })

  it.each([
    '//evil.com',
    '/\\evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    'videos/5',
    '',
    null,
    undefined,
    42,
  ])('blocks %p', (link) => {
    expect(safeInternalLink(link)).toBeNull()
  })
})