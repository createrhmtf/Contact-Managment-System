import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext } from '../auth/auth-context'

export const sessionFixture = {
  token: 'test-token',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex@example.com',
}

export function createAuthValue(overrides = {}) {
  const session = overrides.session === undefined ? sessionFixture : overrides.session

  return {
    session,
    token: overrides.token === undefined ? session?.token : overrides.token,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateSession: vi.fn(),
    ...overrides,
  }
}

export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    auth = createAuthValue(),
  } = options

  return {
    auth,
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider value={auth}>
          {ui}
        </AuthContext.Provider>
      </MemoryRouter>,
    ),
  }
}
