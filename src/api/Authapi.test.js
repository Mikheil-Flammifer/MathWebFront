import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './axios'
import { authApi } from './authApi'

vi.mock('./axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}))

// These check the request bodies against the Spring DTOs:
// VerifyOtpRequest { email, code (6 digits), purpose }
// ResendOtpRequest { email, purpose }
// ForgotPasswordRequest { email }
// ResetPasswordRequest { email, code, newPassword }

describe('authApi request shapes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('register posts the form as is', async () => {
    const body = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'secret123' }
    await authApi.register(body)
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', body)
  })

  it('login posts email and password', async () => {
    await authApi.login({ email: 'a@b.com', password: 'x' })
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', { email: 'a@b.com', password: 'x' })
  })

  it('verifyOtp passes the body through to /verify-otp', async () => {
    const body = { email: 'a@b.com', code: '123456', purpose: 'EMAIL_VERIFICATION' }
    await authApi.verifyOtp(body)
    expect(api.post).toHaveBeenCalledWith('/api/auth/verify-otp', body)
  })

  it('resendOtp sends the purpose the backend requires', async () => {
    await authApi.resendOtp('a@b.com')
    const [url, body] = api.post.mock.calls[0]
    expect(url).toBe('/api/auth/resend-otp')
    expect(body).toEqual({ email: 'a@b.com', purpose: 'EMAIL_VERIFICATION' })
  })

  it('forgotPassword sends only the email', async () => {
    await authApi.forgotPassword('a@b.com')
    expect(api.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email: 'a@b.com' })
  })

  it('resetPassword passes the body through', async () => {
    const body = { email: 'a@b.com', code: '123456', newPassword: 'newsecret1' }
    await authApi.resetPassword(body)
    expect(api.post).toHaveBeenCalledWith('/api/auth/reset-password', body)
  })

  it('logout posts to /logout', async () => {
    await authApi.logout()
    expect(api.post).toHaveBeenCalledWith('/api/auth/logout')
  })
})