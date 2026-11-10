import { describe, it, expect } from 'vitest'
import { edgeKey, findUnreachable } from './mapEditor'

describe('edgeKey', () => {
  it('is the same for a-b and b-a', () => {
    expect(edgeKey(1, 2)).toBe(edgeKey(2, 1))
    expect(edgeKey(1, 2)).toBe('1-2')
  })

  it('compares numbers, not strings', () => {
    expect(edgeKey(10, 9)).toBe('9-10')
  })
})

describe('findUnreachable', () => {
  const node = (problemId, start = false) => ({ problemId, start })

  it('returns nothing when every node connects to a start', () => {
    const nodes = [node(1, true), node(2), node(3)]
    const edges = [{ from: 1, to: 2 }, { from: 3, to: 2 }]
    expect(findUnreachable(nodes, edges)).toEqual([])
  })

  it('finds nodes that are not connected', () => {
    const nodes = [node(1, true), node(2), node(3)]
    expect(findUnreachable(nodes, [{ from: 1, to: 2 }])).toEqual([3])
  })

  it('treats links as two-way', () => {
    const nodes = [node(1), node(2, true)]
    expect(findUnreachable(nodes, [{ from: 1, to: 2 }])).toEqual([])
  })

  it('marks everything unreachable when there is no start node', () => {
    const nodes = [node(1), node(2)]
    expect(findUnreachable(nodes, [{ from: 1, to: 2 }])).toEqual([1, 2])
  })

  it('works with several start nodes and separate islands', () => {
    const nodes = [node(1, true), node(2), node(3, true), node(4), node(5)]
    const edges = [{ from: 1, to: 2 }, { from: 3, to: 4 }]
    expect(findUnreachable(nodes, edges)).toEqual([5])
  })

  it('ignores edges that point to unknown nodes', () => {
    const nodes = [node(1, true)]
    expect(() => findUnreachable(nodes, [{ from: 1, to: 99 }])).not.toThrow()
    expect(findUnreachable(nodes, [{ from: 1, to: 99 }])).toEqual([])
  })

  it('terminates on cycles', () => {
    const nodes = [node(1, true), node(2), node(3)]
    const edges = [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }]
    expect(findUnreachable(nodes, edges)).toEqual([])
  })
})