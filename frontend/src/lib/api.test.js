import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from './api'

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('api client', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('TC-FE-API-01: sends login credentials as JSON and returns the session payload', async () => {
    const session = { token: 'jwt-token', firstName: 'Alex', email: 'alex@example.com' }
    fetch.mockResolvedValueOnce(jsonResponse(session))

    await expect(api.login({ emailOrPhone: 'alex@example.com', password: 'secret123' }))
      .resolves.toEqual(session)

    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ emailOrPhone: 'alex@example.com', password: 'secret123' }),
    }))
    expect(fetch.mock.calls[0][1].headers.get('Content-Type')).toBe('application/json')
  })

  it('TC-FE-API-02: includes bearer token and pagination query for contact lists', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ content: [], totalPages: 0, totalElements: 0 }))

    await api.contacts('jwt-token', 2, 8)

    expect(fetch).toHaveBeenCalledWith('/api/contacts?page=2&size=8', expect.any(Object))
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer jwt-token')
  })

  it('TC-FE-API-06: sends forgot password reset details as JSON', async () => {
    fetch.mockResolvedValueOnce(jsonResponse('Password reset successfully'))

    await expect(api.forgotPassword({
      email: 'alex@example.com',
      phoneNumber: '+1 555 0101',
      newPassword: 'new-secret',
    })).resolves.toBe('Password reset successfully')

    expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        email: 'alex@example.com',
        phoneNumber: '+1 555 0101',
        newPassword: 'new-secret',
      }),
    }))
    expect(fetch.mock.calls[0][1].headers.get('Content-Type')).toBe('application/json')
  })

  it('TC-FE-API-03: raises ApiError with server message, status, and validation details', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({
      message: 'Validation failed',
      errors: ['firstName: First name is required'],
    }, { status: 400 }))

    await expect(api.createContact('jwt-token', { firstName: '' }))
      .rejects.toMatchObject({
        name: 'ApiError',
        message: 'Validation failed',
        status: 400,
        details: ['firstName: First name is required'],
      })
  })

  it('TC-FE-API-04: returns null for successful delete responses without a body', async () => {
    fetch.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(api.deleteContact('jwt-token', 25)).resolves.toBeNull()
    expect(fetch).toHaveBeenCalledWith('/api/contacts/25', expect.objectContaining({
      method: 'DELETE',
    }))
  })

  it('TC-FE-API-05: exposes ApiError for callers that need status-aware handling', () => {
    const error = new ApiError('Forbidden', 403, ['No access'])

    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(403)
    expect(error.details).toEqual(['No access'])
  })
})
