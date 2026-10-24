import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_KEY, ROLES } from '../utils/constants'

// Tokens are no longer stored here. They live in httpOnly cookies that
// JavaScript cannot read. Only the user and a "logged in" flag are kept,
// and the flag is for the UI only.
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) => set({ user, isAuthenticated: true }),

      // merges, so a partial update keeps the other fields
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      logout: () => set({ user: null, isAuthenticated: false }),

      isAdmin: () => get().user?.role === ROLES.ADMIN,
      isTeacher: () => get().user?.role === ROLES.TEACHER,
      isAdminOrTeacher: () =>
        [ROLES.ADMIN, ROLES.TEACHER].includes(get().user?.role),
    }),
    {
      name: USER_KEY,
      version: 2,
      // Old saved state had token and refreshToken. This drops them.
      migrate: (persisted) => ({
        user: persisted?.user ?? null,
        isAuthenticated: !!persisted?.isAuthenticated,
      }),
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore