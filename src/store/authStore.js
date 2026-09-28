import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../utils/constants';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ user: null, token: null, refreshToken: null,
              isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isTeacher: () => get().user?.role === 'TEACHER',
      isAdminOrTeacher: () =>
        ['ADMIN', 'TEACHER'].includes(get().user?.role),
    }),
    {
      name: USER_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;