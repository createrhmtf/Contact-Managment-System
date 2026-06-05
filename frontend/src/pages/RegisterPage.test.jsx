import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'
import { createAuthValue, renderWithProviders } from '../test/test-utils'

async function completeRegistrationForm(user) {
  fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Maya' } })
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Chen' } })
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'maya@example.com' } })
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+1 555 0101' } })
  await user.click(screen.getByLabelText(/first name/i))
}

describe('RegisterPage', () => {
  it('TC-FE-REGISTER-01: submits registration details without confirmPassword', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({
      session: null,
      token: null,
      register: vi.fn().mockResolvedValue({ token: 'jwt-token' }),
    })

    renderWithProviders(<RegisterPage />, { route: '/register', auth })

    await completeRegistrationForm(user)
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret123' } })
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalledWith({
        firstName: 'Maya',
        lastName: 'Chen',
        email: 'maya@example.com',
        phoneNumber: '+1 555 0101',
        password: 'secret123',
      })
    })
  })

  it('TC-FE-REGISTER-02: blocks registration when passwords do not match', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({
      session: null,
      token: null,
      register: vi.fn(),
    })

    renderWithProviders(<RegisterPage />, { route: '/register', auth })

    await completeRegistrationForm(user)
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret456' } })
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('TC-FE-REGISTER-03: displays validation details returned by the backend', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({
      session: null,
      token: null,
      register: vi.fn().mockRejectedValue({
        message: 'Validation failed',
        details: ['email: Email must be valid', 'password: size must be between 6 and 100'],
      }),
    })

    renderWithProviders(<RegisterPage />, { route: '/register', auth })

    await completeRegistrationForm(user)
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret123' } })
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/email: Email must be valid/)).toBeInTheDocument()
    expect(screen.getByText(/password: size must be between 6 and 100/)).toBeInTheDocument()
  })
})
