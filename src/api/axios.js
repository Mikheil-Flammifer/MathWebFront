import axios from 'axios'
import useAuthStore from '../store/authStore'
import { API_BASE_URL } from '../utils/constants'

const CSRF_HEADER = { 'X-Requested-With': 'XMLHttpRequest' }

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // the browser sends the httpOnly cookies
  headers: { 'Content-Type': 'application/json', ...CSRF_HEADER },
})

// One refresh at a time: requests that fail together share the same refresh call.
let refreshPromise = null

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/api/auth/refresh`, {}, {
        withCredentials: true,
        headers: CSRF_HEADER,
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Login / register / OTP etc. return 401 for bad input. That is NOT an expired session.
const isAuthEndpoint = (url = '') => url.includes('/api/auth/')

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error)
    }
    original._retry = true

    const { isAuthenticated, logout } = useAuthStore.getState()
    if (!isAuthenticated) {
      return Promise.reject(error)
    }

    try {
      await refreshSession() // the server sets new cookies
      return api(original)
    } catch (refreshError) {
      logout() // ProtectedRoute reacts to the store and redirects to /login
      return Promise.reject(refreshError)
    }
  }
)

export default api