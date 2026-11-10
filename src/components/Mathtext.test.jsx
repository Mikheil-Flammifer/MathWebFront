import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MathText, { tokenize } from './MathText'

describe('tokenize', () => {
  it('returns no tokens for an empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  it('keeps plain text as one token', () => {
    expect(tokenize('hello')).toEqual([{ type: 'text', value: 'hello' }])
  })

  it('splits text and inline math', () => {
    expect(tokenize('a $x$ b')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'inline', value: 'x' },
      { type: 'text', value: ' b' },
    ])
  })

  it('reads $$...$$ as display math', () => {
    expect(tokenize('$$x^2$$')).toEqual([{ type: 'display', value: 'x^2' }])
  })

  it('turns \\$ outside a formula into a literal dollar sign', () => {
    expect(tokenize('costs \\$5')).toEqual([{ type: 'text', value: 'costs $5' }])
  })

  it('keeps an unmatched $ as plain text', () => {
    expect(tokenize('cost $5')).toEqual([{ type: 'text', value: 'cost $5' }])
  })

  it('does not close an inline formula across a line break', () => {
    expect(tokenize('$a\nb$')).toEqual([{ type: 'text', value: '$a\nb$' }])
  })

  it('skips an escaped dollar inside a formula', () => {
    expect(tokenize('$a\\$b$')).toEqual([{ type: 'inline', value: 'a\\$b' }])
  })

  it('treats "$$" with nothing inside as text', () => {
    expect(tokenize('$$')).toEqual([{ type: 'text', value: '$$' }])
  })

  it('handles several formulas in a row', () => {
    const types = tokenize('$a$ and $b$ and $$c$$').map((t) => t.type)
    expect(types).toEqual(['inline', 'text', 'inline', 'text', 'display'])
  })
})

describe('MathText', () => {
  it('renders KaTeX for formulas and plain spans for text', () => {
    const { container } = render(<MathText text="Solve $x^2$ now" />)
    expect(container.querySelector('.katex')).not.toBeNull()
    expect(container.textContent).toContain('Solve ')
    expect(container.textContent).toContain(' now')
  })

  it('renders display math with katex-display', () => {
    const { container } = render(<MathText text="$$x$$" />)
    expect(container.querySelector('.katex-display')).not.toBeNull()
  })

  it('does not turn HTML in the text into elements', () => {
    const { container } = render(<MathText text="<img src=x onerror=alert(1)>" />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('does not crash on null or undefined text', () => {
    expect(() => render(<MathText text={null} />)).not.toThrow()
    expect(() => render(<MathText />)).not.toThrow()
  })
})