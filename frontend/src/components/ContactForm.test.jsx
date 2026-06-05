import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm'
import { renderWithProviders } from '../test/test-utils'

describe('ContactForm', () => {
  it('TC-FE-CONTACT-FORM-01: submits a normalized contact payload', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<ContactForm onCancel={vi.fn()} onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: '  Maya  ' } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Chen' } })
    fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Product Director' } })
    fireEvent.change(screen.getByLabelText(/company/i), { target: { value: 'Northstar Studio' } })
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'maya@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('+1 555 0142'), { target: { value: '+1 555 0101' } })
    await user.click(screen.getByRole('button', { name: /save contact/i }))

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1))
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Maya',
      lastName: 'Chen',
      title: 'Product Director',
      company: 'Northstar Studio',
      emails: [expect.objectContaining({ email: 'maya@example.com', label: 'Work', primary: true })],
      phones: [expect.objectContaining({ phone: '+1 555 0101', label: 'Mobile', primary: true })],
    }))
  })

  it('TC-FE-CONTACT-FORM-02: reassigns primary email after removing the current primary row', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <ContactForm
        initialValue={{
          firstName: 'Maya',
          emails: [
            { email: 'primary@example.com', label: 'Work', primary: true },
            { email: 'backup@example.com', label: 'Personal', primary: false },
          ],
          phones: [],
        }}
        onCancel={vi.fn()}
        onSubmit={handleSubmit}
      />,
    )

    await user.click(screen.getAllByLabelText(/remove email/i)[0])
    await user.click(screen.getByRole('button', { name: /save contact/i }))

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1))
    expect(handleSubmit.mock.calls[0][0].emails).toEqual([
      expect.objectContaining({ email: 'backup@example.com', primary: true }),
    ])
  })

  it('TC-FE-CONTACT-FORM-03: keeps the modal open and shows server errors on failed save', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Contact already exists'))

    renderWithProviders(<ContactForm onCancel={vi.fn()} onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Maya' } })
    await user.click(screen.getByRole('button', { name: /save contact/i }))

    expect(await screen.findByText('Contact already exists')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save contact/i })).toBeEnabled()
  })
})
