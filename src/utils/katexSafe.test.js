import { describe, it, expect } from 'vitest'
import { escapeHtml, renderMath } from './katexSafe'

describe('escapeHtml', () => {
  it('escapes all five special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    )
  })

  it('converts non-strings to text', () => {
    expect(escapeHtml(42)).toBe('42')
  })
})

describe('renderMath', () => {
  it('renders valid TeX with KaTeX', () => {
    const html = renderMath('x^2')
    expect(html).toContain('class="katex"')
  })

  it('uses display mode when requested', () => {
    expect(renderMath('x', true)).toContain('katex-display')
    expect(renderMath('x', false)).not.toContain('katex-display')
  })

  it('does not throw on invalid TeX and shows an error span', () => {
    expect(() => renderMath('\\frac{')).not.toThrow()
    expect(renderMath('\\frac{')).toContain('katex-error')
  })

  it('handles null, undefined and empty input', () => {
    expect(() => renderMath(null)).not.toThrow()
    expect(() => renderMath(undefined)).not.toThrow()
    expect(typeof renderMath('')).toBe('string')
  })

    it('does not create links from \\href (trust is off)', () => {
      const html = renderMath('\\href{javascript:alert(1)}{click}')
      const box = document.createElement('div')
      box.innerHTML = html

      expect(box.querySelector('a')).toBeNull()
      expect(box.querySelector('[href]')).toBeNull()
    })

    it('never puts raw HTML from the input into the output', () => {
      const box = document.createElement('div')
      box.innerHTML = renderMath('<img src=x onerror=alert(1)>')

      expect(box.querySelector('img')).toBeNull()
    })

  it('stops macro expansion bombs (maxExpand)', () => {
    const html = renderMath('\\def\\a{\\a\\a}\\a')
    expect(html).toContain('katex-error')
  })

  it('falls back to an escaped error span for over-long input', () => {
    const html = renderMath('<script>'.repeat(300))
    expect(html).toContain('katex-error')
    expect(html).not.toContain('class="katex"')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})