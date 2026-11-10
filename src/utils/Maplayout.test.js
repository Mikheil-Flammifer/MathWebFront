import { describe, it, expect } from 'vitest'
import { computeMapLayout } from './mapLayout'

describe('computeMapLayout', () => {
  it('returns a default box for an empty map', () => {
    expect(computeMapLayout([])).toEqual({ viewBox: '0 0 800 500', width: 800, height: 500 })
  })

  it('uses the minimum size for a single node', () => {
    const r = computeMapLayout([{ x: 100, y: 200 }])
    expect(r.width).toBe(400)
    expect(r.height).toBe(300)
    expect(r.viewBox).toBe('10 110 400 300')
  })

  it('grows with the spread of the nodes', () => {
    const r = computeMapLayout([{ x: 0, y: 0 }, { x: 1000, y: 600 }])
    expect(r.width).toBe(1180)
    expect(r.height).toBe(780)
    expect(r.viewBox).toBe('-90 -90 1180 780')
  })

  it('respects a custom padding', () => {
    const r = computeMapLayout([{ x: 0, y: 0 }, { x: 1000, y: 1000 }], 10)
    expect(r.width).toBe(1020)
    expect(r.viewBox.startsWith('-10 -10')).toBe(true)
  })
})