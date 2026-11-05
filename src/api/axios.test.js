import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios, { AxiosError } from 'axios'
import api from './axios'
import useAuthStore from '../store/authStore'

// handler(config, callNumber) returns { status, data }. callNumber counts per URL.
function useFakeServer(handler) {
  const calls = {}
  const adapter = vi.fn(async (config) => {
    calls[config.url] = (calls[config.url] ?? 0) + 1
    const { status, data } = handler(config, calls[config.url])
    const response = { status, data, statusText: '', headers: {}, config }
    if (status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response)
    }
    return response
  })
  api.defaults.adapter = adapter
  return adapter
}

const loggedIn = () =>
  useAuthStore.setState({ user: { role: 'STUDENT' }, isAuthenticated: true })

describe('axios instance', () => {
  const originalAdapter = api.defaults.adapter
  let refreshSpy

  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
    refreshSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('sends cookies and the CSRF header by default', () => {
    expect(api.defaults.withCredentials).toBe(true)
    expect(api.defaults.headers['X-Requested-With']).toBe('XMLHttpRequest')
  })

  it('returns successful responses untouched', async () => {
    useFakeServer(() => ({ status: 200, data: { ok: true } }))
    const res = await api.get('/api/problems/1')
    expect(res.data).toEqual({ ok: true })
    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('refreshes the session on 401 and retries the request once', async () => {
    loggedIn()
    useFakeServer((_config, n) =>
      n === 1 ? { status: 401, data: {} } : { status: 200, data: { retried: true } }
    )

    const res = await api.get('/api/problems/1')

    expect(res.data).toEqual({ retried: true })
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(refreshSpy.mock.calls[0][0]).toContain('/api/auth/refresh')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('logs the user out when the refresh fails', async () => {
    loggedIn()
    refreshSpy.mockRejectedValue(new Error('refresh expired'))
    useFakeServer(() => ({ status: 401, data: {} }))

    await expect(api.get('/api/problems/1')).rejects.toThrow('refresh expired')

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('does not loop forever when the retry also returns 401', async () => {
    loggedIn()
    const adapter = useFakeServer(() => ({ status: 401, data: {} }))

    await expect(api.get('/api/problems/1')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(adapter).toHaveBeenCalledTimes(2)
  })

  it('does not try to refresh for auth endpoints like login', async () => {
    loggedIn()
    useFakeServer(() => ({ status: 401, data: { message: 'Bad credentials' } }))

    await expect(api.post('/api/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(refreshSpy).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('does not try to refresh when the user is not logged in', async () => {
    useFakeServer(() => ({ status: 401, data: {} }))

    await expect(api.get('/api/problems/1')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it.each([400, 403, 404, 500])('does not refresh on a %i error', async (status) => {
    loggedIn()
    useFakeServer(() => ({ status, data: {} }))

    await expect(api.get('/api/problems/1')).rejects.toMatchObject({
      response: { status },
    })

    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('shares one refresh between requests that fail at the same time', async () => {
    loggedIn()
    let release
    refreshSpy.mockImplementation(() => new Promise((resolve) => (release = resolve)))
    useFakeServer((_config, n) =>
      n === 1 ? { status: 401, data: {} } : { status: 200, data: { ok: true } }
    )

    const a = api.get('/api/problems/1')
    const b = api.get('/api/problems/2')
    await vi.waitFor(() => expect(refreshSpy).toHaveBeenCalled())
    release({ data: {} })

    const [resA, resB] = await Promise.all([a, b])
    expect(resA.data).toEqual({ ok: true })
    expect(resB.data).toEqual({ ok: true })
    expect(refreshSpy).toHaveBeenCalledTimes(1)
  })
})