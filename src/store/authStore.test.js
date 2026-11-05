import { describe, it, expect, beforeEach } from 'vitest'
import useAuthStore from './authStore'
import { USER_KEY } from '../utils/constants'

const reset = () => useAuthStore.setState({ user: null, isAuthenticated: false })

describe('authStore', () => {
  beforeEach(() => {
    reset()
    localStorage.clear()
  })

  it('starts logged out', () => {
    const s = useAuthStore.getState()
    expect(s.user).toBeNull()
    expect(s.isAuthenticated).toBe(false)
  })

  it('setAuth stores the user and marks the session as logged in', () => {
    useAuthStore.getState().setAuth({ firstName: 'Ana', role: 'STUDENT' })
    const s = useAuthStore.getState()
    expect(s.user).toEqual({ firstName: 'Ana', role: 'STUDENT' })
    expect(s.isAuthenticated).toBe(true)
  })

  it('logout clears the user and the flag', () => {
    useAuthStore.getState().setAuth({ firstName: 'Ana' })
    useAuthStore.getState().logout()
    const s = useAuthStore.getState()
    expect(s.user).toBeNull()
    expect(s.isAuthenticated).toBe(false)
  })

  it('updateUser merges and keeps the other fields', () => {
    useAuthStore.getState().setAuth({ firstName: 'Ana', role: 'STUDENT' })
    useAuthStore.getState().updateUser({ firstName: 'Anna' })
    expect(useAuthStore.getState().user).toEqual({ firstName: 'Anna', role: 'STUDENT' })
  })

  it.each([
    ['ADMIN', { isAdmin: true, isTeacher: false, isAdminOrTeacher: true }],
    ['TEACHER', { isAdmin: false, isTeacher: true, isAdminOrTeacher: true }],
    ['STUDENT', { isAdmin: false, isTeacher: false, isAdminOrTeacher: false }],
  ])('role helpers for %s', (role, expected) => {
    useAuthStore.getState().setAuth({ role })
    const s = useAuthStore.getState()
    expect(s.isAdmin()).toBe(expected.isAdmin)
    expect(s.isTeacher()).toBe(expected.isTeacher)
    expect(s.isAdminOrTeacher()).toBe(expected.isAdminOrTeacher)
  })

  it('role helpers are false when nobody is logged in', () => {
    const s = useAuthStore.getState()
    expect(s.isAdmin()).toBe(false)
    expect(s.isTeacher()).toBe(false)
    expect(s.isAdminOrTeacher()).toBe(false)
  })

  it('saves only user and isAuthenticated to localStorage', () => {
    useAuthStore.getState().setAuth({ firstName: 'Ana', role: 'STUDENT' })
    const saved = JSON.parse(localStorage.getItem(USER_KEY))
    expect(Object.keys(saved.state).sort()).toEqual(['isAuthenticated', 'user'])
  })

  it('drops old saved tokens when loading a version 1 state', async () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        state: {
          user: { firstName: 'Old' },
          isAuthenticated: true,
          token: 'secret-access',
          refreshToken: 'secret-refresh',
        },
        version: 1,
      })
    )

    await useAuthStore.persist.rehydrate()

    const s = useAuthStore.getState()
    expect(s.user).toEqual({ firstName: 'Old' })
    expect(s.isAuthenticated).toBe(true)
    expect(s.token).toBeUndefined()
    expect(s.refreshToken).toBeUndefined()
  })
})