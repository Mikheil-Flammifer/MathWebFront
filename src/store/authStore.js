import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER_KEY, ROLES } from '../utils/constants'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      // merges, so a partial update keeps the other fields
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      isAdmin: () => get().user?.role === ROLES.ADMIN,
      isTeacher: () => get().user?.role === ROLES.TEACHER,
      isAdminOrTeacher: () =>
        [ROLES.ADMIN, ROLES.TEACHER].includes(get().user?.role),
    }),
    {
      name: USER_KEY,
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore