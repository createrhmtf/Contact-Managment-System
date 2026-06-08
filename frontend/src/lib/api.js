const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(path, options = {}) {
  const { token, body, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const contentType = response.headers.get('content-type') ?? ''
  const data = response.status === 204
    ? null
    : contentType.includes('application/json')
      ? await response.json()
      : await response.text()

  if (!response.ok) {
    // Handle token expiry — redirect to login
    if (response.status === 401) {
      localStorage.removeItem('nexa-session')
      window.location.href = '/login'
      return
    }
    const message = typeof data === 'object' && data?.message
      ? data.message
      : 'Something went wrong. Please try again.'
    throw new ApiError(message, response.status, data?.errors ?? [])
  }

  return data
}

function queryString(params) {
  return new URLSearchParams(params).toString()
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  forgotPassword: (body) => request('/api/auth/forgot-password', { method: 'POST', body }),
  changePassword: (token, body) => request('/api/auth/change-password', { method: 'PUT', token, body }),
  contacts: (token, page = 0, size = 8) =>
    request(`/api/contacts?${queryString({ page, size })}`, { token }),
  searchContacts: (token, keyword, page = 0, size = 8) =>
    request(`/api/contacts/search?${queryString({ keyword, page, size })}`, { token }),
  contact: (token, id) => request(`/api/contacts/${id}`, { token }),
  createContact: (token, body) => request('/api/contacts', { method: 'POST', token, body }),
  updateContact: (token, id, body) => request(`/api/contacts/${id}`, { method: 'PUT', token, body }),
  deleteContact: (token, id) => request(`/api/contacts/${id}`, { method: 'DELETE', token }),
  profile: (token) => request('/api/users/me', { token }),
  updateProfile: (token, body) => request('/api/users/me', { method: 'PUT', token, body }),
}
