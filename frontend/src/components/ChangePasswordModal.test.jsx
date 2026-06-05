import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { renderWithProviders } from '../test/test-utils'
import { ChangePasswordModal } from './ChangePasswordModal'

vi.mock('../lib/api', () => ({
  api: {
    changePassword: vi.fn(),
  },
}))

describe('ChangePasswordModal', () => {
  it('TC-FE-PWD-01: blocks submission when new passwords do not match', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ChangePasswordModal token="jwt-token" onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/current password/i), 'old-secret')
    await user.type(screen.getByLabelText(/^new password/i), 'new-secret')
    await user.type(screen.getByLabelText(/confirm new password/i), 'different-secret')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByText('New passwords do not match.')).toBeInTheDocument()
    expect(api.changePassword).not.toHaveBeenCalled()
  })

  it('TC-FE-PWD-02: submits password change request and confirms success', async () => {
    const user = userEvent.setup()
    api.changePassword.mockResolvedValueOnce({})

    renderWithProviders(<ChangePasswordModal token="jwt-token" onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/current password/i), 'old-secret')
    await user.type(screen.getByLabelText(/^new password/i), 'new-secret')
    await user.type(screen.getByLabelText(/confirm new password/i), 'new-secret')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith('jwt-token', {
        currentPassword: 'old-secret',
        newPassword: 'new-secret',
      })
    })
    expect(screen.getByText('Password updated successfully.')).toBeInTheDocument()
  })
})
