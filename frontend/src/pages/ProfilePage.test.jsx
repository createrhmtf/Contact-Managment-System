import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { api } from '../lib/api'
import { createAuthValue, renderWithProviders } from '../test/test-utils'
import { ProfilePage } from './ProfilePage'

vi.mock('../lib/api', () => ({
  api: {
    profile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}))

const profile = {
  id: 1,
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex@example.com',
  phoneNumber: '+1 555 0101',
  createdAt: '2026-06-01T10:00:00',
}

function ProfileRoutes() {
  return (
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<h1>Login screen</h1>} />
    </Routes>
  )
}

describe('ProfilePage', () => {
  it('TC-FE-PROFILE-01: loads and displays the authenticated user profile', async () => {
    api.profile.mockResolvedValueOnce(profile)

    renderWithProviders(<ProfilePage />, { route: '/profile' })

    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /alex morgan/i })).toBeInTheDocument()
    expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555 0101')).toBeInTheDocument()
    expect(api.profile).toHaveBeenCalledWith('test-token')
  })

  it('TC-FE-PROFILE-02: saves profile details and updates the active session name', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({ updateSession: vi.fn() })
    api.profile.mockResolvedValueOnce(profile)
    api.updateProfile.mockResolvedValueOnce({ ...profile, firstName: 'Alina' })

    renderWithProviders(<ProfilePage />, { route: '/profile', auth })

    await screen.findByRole('heading', { name: /alex morgan/i })
    await user.clear(screen.getByLabelText(/first name/i))
    await user.type(screen.getByLabelText(/first name/i), 'Alina')
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith('test-token', {
        firstName: 'Alina',
        lastName: 'Morgan',
      })
    })
    expect(auth.updateSession).toHaveBeenCalledWith({ firstName: 'Alina' })
    expect(screen.getByText('Profile details saved.')).toBeInTheDocument()
  })

  it('TC-FE-PROFILE-03: opens password modal and sends password change request', async () => {
    const user = userEvent.setup()
    api.profile.mockResolvedValueOnce(profile)
    api.changePassword.mockResolvedValueOnce({})

    renderWithProviders(<ProfilePage />, { route: '/profile' })

    await screen.findByRole('heading', { name: /alex morgan/i })
    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(screen.getByLabelText(/current password/i), 'old-secret')
    await user.type(screen.getByLabelText(/^new password/i), 'new-secret')
    await user.type(screen.getByLabelText(/confirm new password/i), 'new-secret')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith('test-token', {
        currentPassword: 'old-secret',
        newPassword: 'new-secret',
      })
    })
  })

  it('TC-FE-PROFILE-04: logs out and redirects to login', async () => {
    const user = userEvent.setup()
    const auth = createAuthValue({ logout: vi.fn() })
    api.profile.mockResolvedValueOnce(profile)

    renderWithProviders(<ProfileRoutes />, { route: '/profile', auth })

    await screen.findByRole('heading', { name: /alex morgan/i })
    await user.click(screen.getByRole('button', { name: /^logout$/i }))

    expect(auth.logout).toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: /login screen/i })).toBeInTheDocument()
  })
})
