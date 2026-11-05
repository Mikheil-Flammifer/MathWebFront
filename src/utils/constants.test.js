import { describe, it, expect } from 'vitest'
import {
  DIFFICULTY_LEVELS,
  QUEST_STATUS,
  NODE_STATUS,
  ROLES,
  getCategoryTheme,
  DEFAULT_CATEGORY_THEME,
} from './constants'

describe('DIFFICULTY_LEVELS', () => {
  it('matches the backend enum values', () => {
    expect(Object.keys(DIFFICULTY_LEVELS)).toEqual([
      'LEVEL_1_BEGINNER',
      'LEVEL_2_ELEMENTARY',
      'LEVEL_3_INTERMEDIATE',
      'LEVEL_4_UPPER_INTERMEDIATE',
      'LEVEL_5_ADVANCED',
      'LEVEL_6_EXPERT',
      'LEVEL_7_MASTER',
    ])
  })

  it('has levels 1..7 in order, each with label and matching badge class', () => {
    Object.values(DIFFICULTY_LEVELS).forEach((d, i) => {
      expect(d.level).toBe(i + 1)
      expect(d.label).toBeTruthy()
      expect(d.badge).toBe(`diff-${i + 1}`)
    })
  })
})

describe('QUEST_STATUS / NODE_STATUS / ROLES', () => {
  it('covers all four quest statuses with label, text and badge', () => {
    expect(Object.keys(QUEST_STATUS)).toEqual(['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED'])
    Object.values(QUEST_STATUS).forEach((s) => {
      expect(s.label).toBeTruthy()
      expect(s.text).toBeTruthy()
      expect(s.badge).toBeTruthy()
    })
  })

  it('has the node statuses the map uses', () => {
    expect(NODE_STATUS).toEqual({ LOCKED: 'LOCKED', AVAILABLE: 'AVAILABLE', SOLVED: 'SOLVED' })
  })

  it('has the three roles', () => {
    expect(ROLES).toEqual({ STUDENT: 'STUDENT', TEACHER: 'TEACHER', ADMIN: 'ADMIN' })
  })
})

describe('getCategoryTheme', () => {
  it('returns the theme for a known main category', () => {
    expect(getCategoryTheme('Algebra').label).toBe('Algebra')
    expect(getCategoryTheme('Number Theory').label).toBe('Number Theory')
  })

  it('falls back to the default theme for unknown, null or undefined', () => {
    expect(getCategoryTheme('Nope')).toBe(DEFAULT_CATEGORY_THEME)
    expect(getCategoryTheme(null)).toBe(DEFAULT_CATEGORY_THEME)
    expect(getCategoryTheme(undefined)).toBe(DEFAULT_CATEGORY_THEME)
  })
})