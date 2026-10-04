export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MathWeb'

// Zustand persist key (holds user + tokens)
export const USER_KEY = 'mathweb_user'
export const PENDING_EMAIL_KEY = 'mathweb_pending_email'

export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
}


// badge = CSS class from index.css (diff-1 … diff-7)
export const DIFFICULTY_LEVELS = {
  LEVEL_1_BEGINNER:           { label: 'Beginner',           level: 1, badge: 'diff-1' },
  LEVEL_2_ELEMENTARY:         { label: 'Elementary',         level: 2, badge: 'diff-2' },
  LEVEL_3_INTERMEDIATE:       { label: 'Intermediate',       level: 3, badge: 'diff-3' },
  LEVEL_4_UPPER_INTERMEDIATE: { label: 'Upper Intermediate', level: 4, badge: 'diff-4' },
  LEVEL_5_ADVANCED:           { label: 'Advanced',           level: 5, badge: 'diff-5' },
  LEVEL_6_EXPERT:             { label: 'Expert',             level: 6, badge: 'diff-6' },
  LEVEL_7_MASTER:             { label: 'Master',             level: 7, badge: 'diff-7' },
}

export const QUEST_STATUS = {
  LOCKED:      { label: 'Locked',      text: 'text-chalk-500',   badge: 'badge-gray' },
  AVAILABLE:   { label: 'Available',   text: 'text-sky-400',     badge: 'badge-sky' },
  IN_PROGRESS: { label: 'In Progress', text: 'text-amber-400',   badge: 'badge-warning' },
  COMPLETED:   { label: 'Completed',   text: 'text-emerald-400', badge: 'badge-success' },
}

export const NODE_STATUS = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  SOLVED: 'SOLVED',
}

// Keyed by mainCategoryName from /map. Adjust colors to your palette.
export const MAIN_CATEGORY_THEME = {
  Algebra:        { color: '#a78bfa', label: 'Algebra' },
  Geometry:       { color: '#38bdf8', label: 'Geometry' },
  Combinatorics:  { color: '#f472b6', label: 'Combinatorics' },
  'Number Theory': { color: '#fbbf24', label: 'Number Theory' },
}

export const DEFAULT_CATEGORY_THEME = { color: '#94a3b8', label: 'Other' }

export function getCategoryTheme(mainCategoryName) {
  return MAIN_CATEGORY_THEME[mainCategoryName] ?? DEFAULT_CATEGORY_THEME
}