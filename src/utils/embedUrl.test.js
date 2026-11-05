import { describe, it, expect } from 'vitest'
import { isAllowedEmbedUrl } from './embedUrl'

describe('isAllowedEmbedUrl', () => {
  it.each([
    'https://www.desmos.com/calculator/abc123',
    'https://desmos.com/calculator/abc123',
    'https://www.geogebra.org/calculator/xyz',
    'https://geogebra.org/classic/abc',
    'https://www.geogebra.org/material/iframe/id/abc/width/800/height/600',
  ])('accepts %s', (url) => {
    expect(isAllowedEmbedUrl(url)).toBe(true)
  })

  it('ignores case in the protocol and host', () => {
    expect(isAllowedEmbedUrl('HTTPS://WWW.DESMOS.COM/calculator/x')).toBe(true)
  })

  it('ignores surrounding whitespace', () => {
    expect(isAllowedEmbedUrl('  https://www.desmos.com/calculator/abc  ')).toBe(true)
  })

  it('rejects http', () => {
    expect(isAllowedEmbedUrl('http://www.desmos.com/calculator/abc')).toBe(false)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://desmos.com/file',
    'file:///etc/passwd',
  ])('rejects dangerous protocol %s', (url) => {
    expect(isAllowedEmbedUrl(url)).toBe(false)
  })

  it.each([
    'https://evildesmos.com/calculator/abc',
    'https://desmos.com.evil.com/calculator/abc',
    'https://notgeogebra.org/classic/abc',
    'https://evil.com/?u=https://www.desmos.com',
    'https://evil.com/desmos.com',
    'https://desmos.com.',
  ])('rejects lookalike or other domain %s', (url) => {
    expect(isAllowedEmbedUrl(url)).toBe(false)
  })

  it('rejects credentials in the URL (user@host trick)', () => {
    expect(isAllowedEmbedUrl('https://evil.com@desmos.com/calculator/abc')).toBe(false)
    expect(isAllowedEmbedUrl('https://desmos.com@evil.com/calculator/abc')).toBe(false)
  })

  it('rejects custom ports', () => {
    expect(isAllowedEmbedUrl('https://www.desmos.com:8443/calculator/abc')).toBe(false)
  })

  it('rejects relative and protocol-relative URLs', () => {
    expect(isAllowedEmbedUrl('/calculator/abc')).toBe(false)
    expect(isAllowedEmbedUrl('//www.desmos.com/calculator/abc')).toBe(false)
  })

  it.each([null, undefined, '', '   ', 42, {}, []])('rejects non-URL input %p', (value) => {
    expect(isAllowedEmbedUrl(value)).toBe(false)
  })
})