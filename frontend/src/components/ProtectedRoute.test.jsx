import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { createAuthValue, renderWithProviders } from '../test/test-utils'

function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<h1>Login screen</h1>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/contacts" element={<h1>Private contacts</h1>} />
      </Route>
    </Routes>
  )
}

describe('ProtectedRoute', () => {
  it('TC-FE-ROUTE-01: redirects unauthenticated users to login', () => {
    renderWithProviders(<ProtectedRoutes />, {
      route: '/contacts',
      auth: createAuthValue({ session: null, token: null }),
    })

    expect(screen.getByRole('heading', { name: /login screen/i })).toBeInTheDocument()
  })

  it('TC-FE-ROUTE-02: renders protected content when a token exists', () => {
    renderWithProviders(<ProtectedRoutes />, { route: '/contacts' })

    expect(screen.getByRole('heading', { name: /private contacts/i })).toBeInTheDocument()
  })
})
