import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import VerifyOtpPage from './VerifyOtpPage'
import { authApi } from '../../api/authApi'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

const { setAuth } = vi.hoisted(() => ({ setAuth: vi.fn() }))

vi.mock('../../api/authApi', () => ({
  authApi: { verifyOtp: vi.fn(), resendOtp: vi.fn() },
}))

vi.mock('../../store/authStore', () => ({
  default: (selector) => selector({ setAuth }),
}))

vi.mock('../../components/layout/AuthLayout', async () => {
  const React = await import('react')
  return {
    default: ({ children, subtitle }) =>
      React.createElement(
        'div',
        null,
        subtitle,
        children
      ),
  }
})

const EMAIL = 'ana@test.com'

function renderPage({ withEmail = true } = {}) {
  const entry = withEmail
    ? { pathname: '/verify-otp', state: { email: EMAIL } }
    : '/verify-otp'
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/register" element={<div>REGISTER PAGE</div>} />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/home" element={<div>HOME PAGE</div>} />
      </Routes>
    </MemoryRouter>
  )
  return userEvent.setup()
}

const digit = (n) => screen.getByLabelText(`Digit ${n}`)

async function typeCode(user, code = '123456') {
  await user.click(digit(1))
  await user.keyboard(code)
}

const wrongCode = () =>
  authApi.verifyOtp.mockRejectedValue({
    response: { status: 400, data: { message: 'Invalid or expired code' } },
  })

describe('VerifyOtpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('sends the visitor to /register when no email is known', async () => {
    renderPage({ withEmail: false })
    expect(await screen.findByText('REGISTER PAGE')).toBeInTheDocument()
  })

  it('falls back to the email saved in sessionStorage', () => {
    sessionStorage.setItem(PENDING_EMAIL_KEY, EMAIL)
    renderPage({ withEmail: false })
    expect(screen.getByText(EMAIL)).toBeInTheDocument()
  })

  it('submits by itself at 6 digits with the fields the backend expects', async () => {
    authApi.verifyOtp.mockResolvedValue({ data: { data: null } })
    const user = renderPage()
    await typeCode(user)

    await waitFor(() => expect(authApi.verifyOtp).toHaveBeenCalledTimes(1))
    expect(authApi.verifyOtp).toHaveBeenCalledWith({
      email: EMAIL,
      code: '123456',
      purpose: 'EMAIL_VERIFICATION',
    })
  })

  it('goes to /login after success when the backend does not log the user in', async () => {
    authApi.verifyOtp.mockResolvedValue({ data: { data: null } })
    sessionStorage.setItem(PENDING_EMAIL_KEY, EMAIL)
    const user = renderPage()
    await typeCode(user)

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument()
    expect(sessionStorage.getItem(PENDING_EMAIL_KEY)).toBeNull()
    expect(setAuth).not.toHaveBeenCalled()
  })

  it('logs in and goes to /home when the backend returns a token', async () => {
    authApi.verifyOtp.mockResolvedValue({
      data: { data: { accessToken: 't', user: { firstName: 'Ana' } } },
    })
    const user = renderPage()
    await typeCode(user)

    expect(await screen.findByText('HOME PAGE')).toBeInTheDocument()
    expect(setAuth).toHaveBeenCalledWith({ firstName: 'Ana' })
  })

  it('shows the server message and clears the boxes after a wrong code', async () => {
    wrongCode()
    const user = renderPage()
    await typeCode(user)

    expect(await screen.findByText('Invalid or expired code')).toBeInTheDocument()
    await waitFor(() => expect(digit(1)).toHaveValue(''))
  })

  it('locks the form after 5 wrong codes and offers a new code', async () => {
    wrongCode()
    const user = renderPage()

    for (let i = 1; i <= 5; i++) {
      await typeCode(user)
      await waitFor(() => expect(authApi.verifyOtp).toHaveBeenCalledTimes(i))
      await waitFor(() => {
        expect(digit(1)).toHaveValue('')
        if (i < 5) expect(digit(1)).not.toBeDisabled()
      })
    }

    expect(await screen.findByText(/too many wrong codes/i)).toBeInTheDocument()
    expect(digit(1)).toBeDisabled()
    expect(screen.getByRole('button', { name: /request a new code/i })).toBeInTheDocument()
  })

  it('does not count other errors as wrong codes', async () => {
    authApi.verifyOtp.mockRejectedValue({
      response: { status: 429, data: { message: 'Server is busy' } },
    })
    const user = renderPage()

    for (let i = 1; i <= 5; i++) {
      await typeCode(user)
      await waitFor(() => expect(authApi.verifyOtp).toHaveBeenCalledTimes(i))
      await waitFor(() => expect(digit(1)).toHaveValue(''))
    }

    expect(screen.queryByText(/too many wrong codes/i)).toBeNull()
    expect(digit(1)).not.toBeDisabled()
  })

  it('resend calls the API and starts a cooldown', async () => {
    authApi.resendOtp.mockResolvedValue({ data: {} })
    const user = renderPage()
    await user.click(screen.getByRole('button', { name: /resend code/i }))

    await waitFor(() => expect(authApi.resendOtp).toHaveBeenCalledWith(EMAIL))
    expect(await screen.findByText(/resend in \d+s/i)).toBeInTheDocument()
  })
})