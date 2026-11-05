import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import { authApi } from '../../api/authApi'
import { PENDING_EMAIL_KEY } from '../../utils/constants'

const { setAuth } = vi.hoisted(() => ({ setAuth: vi.fn() }))

vi.mock('../../api/authApi', () => ({ authApi: { login: vi.fn() } }))

vi.mock('../../store/authStore', () => ({
  default: (selector) => selector({ setAuth }),
}))

vi.mock('../../utils/helpers', async (importOriginal) => ({
  ...(await importOriginal()),
  getErrorMessage: (err, fallback) => err?.response?.data?.message || fallback,
}))

vi.mock('../../components/layout/AuthLayout', async () => {
  const React = await import('react')
  return {
    default: ({ children }) => React.createElement('div', null, children),
  }
})

function renderLogin(from) {
  const entry = from === undefined ? '/login' : { pathname: '/login', state: { from } }
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<div>HOME PAGE</div>} />
        <Route path="/subscribe" element={<div>SUBSCRIBE PAGE</div>} />
        <Route path="/verify-otp" element={<div>OTP PAGE</div>} />
      </Routes>
    </MemoryRouter>
  )
  return userEvent.setup()
}

async function fillAndSubmit(user, email = 'ana@test.com', password = 'secret123') {
  await user.type(screen.getByPlaceholderText('you@example.com'), email)
  await user.type(screen.getByPlaceholderText(/•+/), password)
  await user.click(screen.getByRole('button', { name: /sign in/i }))
}

const loginOk = () =>
  authApi.login.mockResolvedValue({ data: { data: { user: { firstName: 'Ana' } } } })

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('asks for email and password when the form is empty', async () => {
    const user = renderLogin()
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Enter your email and password')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('logs in, stores the user and goes to /home', async () => {
    loginOk()
    const user = renderLogin()
    await fillAndSubmit(user, '  ana@test.com  ', 'secret123')

    expect(await screen.findByText('HOME PAGE')).toBeInTheDocument()
    expect(authApi.login).toHaveBeenCalledWith({ email: 'ana@test.com', password: 'secret123' })
    expect(setAuth).toHaveBeenCalledWith({ firstName: 'Ana' })
  })

  it('goes back to the page the user came from', async () => {
    loginOk()
    const user = renderLogin('/subscribe')
    await fillAndSubmit(user)

    expect(await screen.findByText('SUBSCRIBE PAGE')).toBeInTheDocument()
  })

  it.each([
    '//evil.com',
    'https://evil.com',
    '/\\evil.com',
    'javascript:alert(1)',
    '/login',
    '/register',
    '/reset-password?token=abc',
  ])('ignores the unsafe redirect %s and goes to /home', async (from) => {
    loginOk()
    const user = renderLogin(from)
    await fillAndSubmit(user)

    expect(await screen.findByText('HOME PAGE')).toBeInTheDocument()
  })

  it('shows the server message on wrong credentials and does not log in', async () => {
    authApi.login.mockRejectedValue({
      response: { status: 401, data: { message: 'Invalid email or password' } },
    })
    const user = renderLogin()
    await fillAndSubmit(user)

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(screen.queryByText('HOME PAGE')).toBeNull()
    expect(setAuth).not.toHaveBeenCalled()
  })

  it('sends an unverified account to the OTP page and remembers the email', async () => {
    authApi.login.mockRejectedValue({
      response: { status: 403, data: { message: 'Please verify your email first' } },
    })
    const user = renderLogin()
    await fillAndSubmit(user, 'ana@test.com')

    expect(await screen.findByText('OTP PAGE')).toBeInTheDocument()
    expect(sessionStorage.getItem(PENDING_EMAIL_KEY)).toBe('ana@test.com')
    expect(setAuth).not.toHaveBeenCalled()
  })

  it('shows other 403 errors on the page instead of going to OTP', async () => {
    authApi.login.mockRejectedValue({
      response: { status: 403, data: { message: 'Account is disabled' } },
    })
    const user = renderLogin()
    await fillAndSubmit(user)

    expect(await screen.findByText('Account is disabled')).toBeInTheDocument()
    expect(screen.queryByText('OTP PAGE')).toBeNull()
  })
})