import axios from 'axios'
import useAuthStore from '../store/authStore'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Attach access token ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Refresh on 401 (one refresh at a time, others wait) ─────────────
let isRefreshing = false
let waiting = []

const flushQueue = (error, token = null) => {
  waiting.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  waiting = []
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

    const { refreshToken, setTokens, logout } = useAuthStore.getState()
    if (!refreshToken) {
      logout()
      return Promise.reject(error)
    }

    // Another request is already refreshing: wait for it, then retry
    if (isRefreshing) {
      return new Promise((resolve, reject) => waiting.push({ resolve, reject })).then(
        (token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        }
      )
    }

    isRefreshing = true
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
      const { accessToken, refreshToken: newRefresh } = data.data
      setTokens(accessToken, newRefresh ?? refreshToken)
      flushQueue(null, accessToken)
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshError) {
      flushQueue(refreshError)
      logout() // ProtectedRoute reacts to the store and redirects to /login, no page reload
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api