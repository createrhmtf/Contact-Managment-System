import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthProvider', () => {
  it('TC-FE-AUTH-01: restores the saved session from localStorage', () => {
    localStorage.setItem('nexa-session', JSON.stringify({
      token: 'saved-token',
      firstName: 'Saved',
      email: 'saved@example.com',
    }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.token).toBe('saved-token')
    expect(result.current.session.email).toBe('saved@example.com')
  })

  it('TC-FE-AUTH-02: login persists the returned backend session', async () => {
    api.login.mockResolvedValueOnce({
      token: 'jwt-token',
      firstName: 'Alex',
      email: 'alex@example.com',
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ emailOrPhone: 'alex@example.com', password: 'secret123' })
    })

    expect(api.login).toHaveBeenCalledWith({ emailOrPhone: 'alex@example.com', password: 'secret123' })
    expect(result.current.token).toBe('jwt-token')
    expect(JSON.parse(localStorage.getItem('nexa-session'))).toMatchObject({ email: 'alex@example.com' })
  })

  it('TC-FE-AUTH-03: register persists the new user session', async () => {
    api.register.mockResolvedValueOnce({
      token: 'new-token',
      firstName: 'Maya',
      email: 'maya@example.com',
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register({ firstName: 'Maya', email: 'maya@example.com', password: 'secret123' })
    })

    expect(result.current.session.firstName).toBe('Maya')
    expect(localStorage.getItem('nexa-session')).toContain('maya@example.com')
  })

  it('TC-FE-AUTH-04: logout clears local session state', async () => {
    localStorage.setItem('nexa-session', JSON.stringify({ token: 'saved-token' }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.session).toBeNull()
    expect(localStorage.getItem('nexa-session')).toBeNull()
  })
})
