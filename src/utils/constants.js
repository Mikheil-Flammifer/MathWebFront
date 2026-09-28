export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MathWeb';

export const TOKEN_KEY = 'mathweb_token';
export const REFRESH_TOKEN_KEY = 'mathweb_refresh_token';
export const USER_KEY = 'mathweb_user';

export const DIFFICULTY_LEVELS = {
  LEVEL_1_BEGINNER: { label: 'Beginner', color: 'bg-green-100 text-green-700', level: 1 },
  LEVEL_2_ELEMENTARY: { label: 'Elementary', color: 'bg-teal-100 text-teal-700', level: 2 },
  LEVEL_3_INTERMEDIATE: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700', level: 3 },
  LEVEL_4_UPPER_INTERMEDIATE: { label: 'Upper Intermediate', color: 'bg-indigo-100 text-indigo-700', level: 4 },
  LEVEL_5_ADVANCED: { label: 'Advanced', color: 'bg-purple-100 text-purple-700', level: 5 },
  LEVEL_6_EXPERT: { label: 'Expert', color: 'bg-orange-100 text-orange-700', level: 6 },
  LEVEL_7_MASTER: { label: 'Master', color: 'bg-red-100 text-red-700', level: 7 },
};

export const QUEST_STATUS = {
  LOCKED: { label: 'Locked', color: 'text-gray-400', icon: '🔒' },
  AVAILABLE: { label: 'Available', color: 'text-blue-500', icon: '⭐' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-500', icon: '🔥' },
  COMPLETED: { label: 'Completed', color: 'text-green-500', icon: '✅' },
};

export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};