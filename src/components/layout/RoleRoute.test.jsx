import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RoleRoute from './RoleRoute'
import StaffRoute from './StaffRoute'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../utils/constants'

vi.mock('../../pages/error/ForbiddenPage', async () => {
  const React = await import('react')
  return {
    default: ({ message }) => React.createElement('div', null, `FORBIDDEN: ${message}`),
  }
})

function renderGuard(guard) {
  render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route element={guard}>
          <Route path="/secret" element={<div>SECRET CONTENT</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

const loginAs = (role) =>
  useAuthStore.setState({ user: role ? { role } : null, isAuthenticated: true })

describe('RoleRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects to /login when not logged in', () => {
    renderGuard(<RoleRoute roles={[ROLES.ADMIN]} message="Admins only" />)
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument()
    expect(screen.queryByText('SECRET CONTENT')).toBeNull()
  })

  it('shows the page to an allowed role', () => {
    loginAs(ROLES.ADMIN)
    renderGuard(<RoleRoute roles={[ROLES.ADMIN]} message="Admins only" />)
    expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument()
  })

  it('shows the "no access" page to a role that is not allowed', () => {
    loginAs(ROLES.STUDENT)
    renderGuard(<RoleRoute roles={[ROLES.ADMIN]} message="Admins only" />)
    expect(screen.getByText('FORBIDDEN: Admins only')).toBeInTheDocument()
    expect(screen.queryByText('SECRET CONTENT')).toBeNull()
  })

  it('blocks a logged-in session that has no user object', () => {
    loginAs(null)
    renderGuard(<RoleRoute roles={[ROLES.ADMIN]} message="Admins only" />)
    expect(screen.queryByText('SECRET CONTENT')).toBeNull()
  })

  it('shows neither the page nor a redirect while the store is still loading', () => {
    vi.spyOn(useAuthStore.persist, 'hasHydrated').mockReturnValue(false)
    vi.spyOn(useAuthStore.persist, 'onFinishHydration').mockReturnValue(() => {})
    loginAs(ROLES.ADMIN)

    renderGuard(<RoleRoute roles={[ROLES.ADMIN]} message="Admins only" />)

    expect(screen.queryByText('SECRET CONTENT')).toBeNull()
    expect(screen.queryByText('LOGIN PAGE')).toBeNull()
  })
})

describe('StaffRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  it.each([ROLES.ADMIN, ROLES.TEACHER])('lets %s in', (role) => {
    loginAs(role)
    renderGuard(<StaffRoute />)
    expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument()
  })

  it('blocks students with the staff message', () => {
    loginAs(ROLES.STUDENT)
    renderGuard(<StaffRoute />)
    expect(screen.getByText(/only for teachers and administrators/i)).toBeInTheDocument()
    expect(screen.queryByText('SECRET CONTENT')).toBeNull()
  })

  it('redirects to /login when not logged in', () => {
    renderGuard(<StaffRoute />)
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument()
  })
})