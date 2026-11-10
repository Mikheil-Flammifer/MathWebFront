import api from './axios'

export const authApi = {
  register:       (data)  => api.post('/api/auth/register', data),
  verifyOtp:      (data)  => api.post('/api/auth/verify-otp', data),
  resendOtp: (email, purpose = 'EMAIL_VERIFICATION') =>
                 api.post('/api/auth/resend-otp', { email, purpose }),
  login:          (data)  => api.post('/api/auth/login', data),
  logout:         ()      => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/api/auth/reset-password', data),
}