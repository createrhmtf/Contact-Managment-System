import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'
import { createAuthValue, renderWithProviders } from '../test/test-utils'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: {
    forgotPassword: vi.fn(),
  },
}))

describe('LoginPage', () => {
  it('TC-FE-LOGIN-01: submits email or phone and password to the auth service', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({
      session: null,
      token: null,
      login: vi.fn().mockResolvedValue({ token: 'jwt-token' }),
    })

    renderWithProviders(<LoginPage />, { route: '/login', auth })

    await user.type(screen.getByLabelText(/email or phone number/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        emailOrPhone: 'alex@example.com',
        password: 'secret123',
      })
    })
  })

  it('TC-FE-LOGIN-02: displays backend login errors to the user', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({
      session: null,
      token: null,
      login: vi.fn().mockRejectedValue(new Error('Invalid password')),
    })

    renderWithProviders(<LoginPage />, { route: '/login', auth })

    await user.type(screen.getByLabelText(/email or phone number/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled()
  })

  it('TC-FE-LOGIN-03: lets the user reveal and hide the password', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({ session: null, token: null })

    renderWithProviders(<LoginPage />, { route: '/login', auth })

    const password = screen.getByLabelText(/^password/i)
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(password).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('TC-FE-LOGIN-04: opens forgot password form and submits recovery details', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({ session: null, token: null })
    api.forgotPassword.mockResolvedValueOnce('Password reset successfully')

    renderWithProviders(<LoginPage />, { route: '/login', auth })

    await user.click(screen.getByRole('button', { name: /forgot password/i }))
    await user.type(screen.getByLabelText(/registered email/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/registered phone number/i), '+1 555 0101')
    await user.type(screen.getByLabelText(/^new password/i), 'new-secret')
    await user.type(screen.getByLabelText(/confirm new password/i), 'new-secret')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(api.forgotPassword).toHaveBeenCalledWith({
        email: 'alex@example.com',
        phoneNumber: '+1 555 0101',
        newPassword: 'new-secret',
      })
    })
    expect(await screen.findByText(/password reset successfully/i)).toBeInTheDocument()
  })

  it('TC-FE-LOGIN-05: blocks forgot password submission when new passwords do not match', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({ session: null, token: null })

    renderWithProviders(<LoginPage />, { route: '/login#forgot-password', auth })

    await user.type(screen.getByLabelText(/registered email/i), 'alex@example.com')
    await user.type(screen.getByLabelText(/registered phone number/i), '+1 555 0101')
    await user.type(screen.getByLabelText(/^new password/i), 'new-secret')
    await user.type(screen.getByLabelText(/confirm new password/i), 'different-secret')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(screen.getByText('New passwords do not match.')).toBeInTheDocument()
    expect(api.forgotPassword).not.toHaveBeenCalled()
  })
})
