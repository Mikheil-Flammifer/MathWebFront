import { describe, it, expect } from 'vitest'
import { layoutQuestGraph } from './questLayout'

describe('layoutQuestGraph', () => {
  it('returns a minimum size and no positions for no quests', () => {
    const r = layoutQuestGraph([])
    expect(r.positions.size).toBe(0)
    expect(r.edges).toEqual([])
    expect(r.width).toBe(500)
    expect(r.height).toBe(320)
  })

  it('puts root quests in the first column', () => {
    const r = layoutQuestGraph([{ id: 1 }])
    expect(r.positions.get(1)).toEqual({ x: 70, y: 70 })
  })

  it('puts a dependent quest one column to the right', () => {
    const r = layoutQuestGraph([{ id: 1 }, { id: 2, prerequisiteQuestIds: [1] }])
    expect(r.positions.get(2).x).toBe(70 + 200)
  })

  it('uses the longest chain for the column', () => {
    const r = layoutQuestGraph([
      { id: 1 },
      { id: 2, prerequisiteQuestIds: [1] },
      { id: 3, prerequisiteQuestIds: [1, 2] },
    ])
    expect(r.positions.get(3).x).toBe(70 + 2 * 200)
  })

  it('stacks quests of the same column in order', () => {
    const r = layoutQuestGraph([
      { id: 1 },
      { id: 3, prerequisiteQuestIds: [1] },
      { id: 2, prerequisiteQuestIds: [1] },
    ])
    expect(r.positions.get(2).y).toBe(70)
    expect(r.positions.get(3).y).toBe(70 + 150)
  })

  it('builds one edge per prerequisite', () => {
    const r = layoutQuestGraph([
      { id: 1 },
      { id: 2, prerequisiteQuestIds: [1] },
      { id: 3, prerequisiteQuestIds: [1] },
    ])
    expect(r.edges.map((e) => [e.fromId, e.toId])).toEqual([[1, 2], [1, 3]])
  })

  it('skips edges to quests that are not in the list', () => {
    const r = layoutQuestGraph([{ id: 2, prerequisiteQuestIds: [99] }])
    expect(r.edges).toEqual([])
    expect(r.positions.get(2).x).toBe(70)
  })

  it('does not hang on cyclic data', () => {
    const quests = [
      { id: 1, prerequisiteQuestIds: [2] },
      { id: 2, prerequisiteQuestIds: [1] },
    ]
    const r = layoutQuestGraph(quests)
    expect(r.positions.has(1)).toBe(true)
    expect(r.positions.has(2)).toBe(true)
  })
})