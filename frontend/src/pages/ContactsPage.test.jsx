import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { renderWithProviders } from '../test/test-utils'
import { ContactsPage } from './ContactsPage'

vi.mock('../lib/api', () => ({
  api: {
    contacts: vi.fn(),
    searchContacts: vi.fn(),
    createContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn(),
  },
}))

const mayaContact = {
  id: 1,
  firstName: 'Maya',
  lastName: 'Chen',
  title: 'Product Director',
  company: 'Northstar Studio',
  address: '42 Market Street',
  notes: 'Met at product summit.',
  emails: [{ email: 'maya@example.com', label: 'Work', primary: true }],
  phones: [{ phone: '+1 555 0101', label: 'Mobile', primary: true }],
}

const alexContact = {
  id: 2,
  firstName: 'Alex',
  lastName: 'Morgan',
  title: 'Engineer',
  company: 'Orbit Labs',
  emails: [{ email: 'alex.contact@example.com', label: 'Work', primary: true }],
  phones: [],
}

function page(content, overrides = {}) {
  return {
    content,
    totalPages: overrides.totalPages ?? 1,
    totalElements: overrides.totalElements ?? content.length,
  }
}

describe('ContactsPage', () => {
  it('TC-FE-CONTACTS-01: loads paginated contacts and selects the first contact profile', async () => {
    api.contacts.mockResolvedValueOnce(page([mayaContact], { totalElements: 1 }))

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    expect(screen.getByText(/loading your directory/i)).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: /maya chen/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /contact management/i })).toBeInTheDocument()
    expect(screen.getAllByText('maya@example.com')).toHaveLength(2)
    expect(screen.getAllByText('+1 555 0101')).toHaveLength(2)
    expect(api.contacts).toHaveBeenCalledWith('test-token', 0, 8)
  })

  it('TC-FE-CONTACTS-02: searches contacts by first or last name', async () => {
    api.contacts.mockResolvedValueOnce(page([mayaContact]))
    api.searchContacts.mockResolvedValueOnce(page([mayaContact]))

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    await screen.findByRole('cell', { name: /maya chen/i })
    fireEvent.change(screen.getByLabelText(/search contacts/i), { target: { value: 'Maya' } })

    await waitFor(() => {
      expect(api.searchContacts).toHaveBeenCalledWith('test-token', 'Maya', 0, 8)
    })
  })

  it('TC-FE-CONTACTS-03: clears search and returns to the full directory', async () => {
    const user = userEvent.setup()
    api.contacts.mockResolvedValue(page([mayaContact]))
    api.searchContacts.mockResolvedValueOnce(page([], { totalElements: 0 }))

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    await screen.findByRole('cell', { name: /maya chen/i })
    fireEvent.change(screen.getByLabelText(/search contacts/i), { target: { value: 'Nobody' } })
    await screen.findByText('No contacts found')

    await user.click(screen.getByRole('button', { name: /clear search/i }))

    await waitFor(() => {
      expect(api.contacts).toHaveBeenCalledTimes(2)
    })
  })

  it('TC-FE-CONTACTS-04: opens create contact modal and refreshes after save', async () => {
    const user = userEvent.setup()
    api.contacts.mockResolvedValue(page([], { totalElements: 0 }))
    api.createContact.mockResolvedValueOnce(mayaContact)

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    await screen.findByText('Your directory is ready')
    await user.click(screen.getByRole('button', { name: /add your first contact/i }))
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Maya' } })
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'maya@example.com' } })
    await user.click(screen.getByRole('button', { name: /save contact/i }))

    await waitFor(() => {
      expect(api.createContact).toHaveBeenCalledWith('test-token', expect.objectContaining({
        firstName: 'Maya',
        emails: [expect.objectContaining({ email: 'maya@example.com', primary: true })],
      }))
    })
    expect(api.contacts).toHaveBeenCalledTimes(2)
  })

  it('TC-FE-CONTACTS-05: updates an existing contact from the detail drawer', async () => {
    const user = userEvent.setup()
    api.contacts.mockResolvedValue(page([mayaContact]))
    api.updateContact.mockResolvedValueOnce({ ...mayaContact, title: 'VP Product' })

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    await screen.findByRole('cell', { name: /maya chen/i })
    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/job title/i))
    await user.type(screen.getByLabelText(/job title/i), 'VP Product')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(api.updateContact).toHaveBeenCalledWith('test-token', 1, expect.objectContaining({
        title: 'VP Product',
      }))
    })
  })

  it('TC-FE-CONTACTS-06: confirms and deletes a contact', async () => {
    const user = userEvent.setup()
    api.contacts.mockResolvedValue(page([mayaContact]))
    api.deleteContact.mockResolvedValueOnce(null)

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    await screen.findByRole('cell', { name: /maya chen/i })
    await user.click(screen.getByRole('button', { name: /delete maya chen/i }))
    expect(screen.getByRole('dialog', { name: /delete maya chen/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete contact/i }))

    await waitFor(() => {
      expect(api.deleteContact).toHaveBeenCalledWith('test-token', 1)
    })
  })

  it('TC-FE-CONTACTS-07: moves between pages using pagination controls', async () => {
    const user = userEvent.setup()
    api.contacts
      .mockResolvedValueOnce(page([mayaContact], { totalPages: 2, totalElements: 2 }))
      .mockResolvedValueOnce(page([alexContact], { totalPages: 2, totalElements: 2 }))

    renderWithProviders(<ContactsPage />, { route: '/contacts' })

    await screen.findByRole('cell', { name: /maya chen/i })
    await user.click(screen.getByRole('button', { name: /next page/i }))

    await waitFor(() => {
      expect(api.contacts).toHaveBeenLastCalledWith('test-token', 1, 8)
    })
    expect(await screen.findByRole('cell', { name: /alex morgan/i })).toBeInTheDocument()
  })
})
