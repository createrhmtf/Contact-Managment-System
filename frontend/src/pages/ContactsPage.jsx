import { ArrowUpDown, ChevronLeft, ChevronRight, Mail, Phone, Plus, Search, Tags, UserPlus, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ContactDetail } from '../components/ContactDetail'
import { ContactForm } from '../components/ContactForm'
import { DeleteContactModal } from '../components/DeleteContactModal'
import { Modal } from '../components/Modal'
import { api } from '../lib/api'
import { displayName, initials, primaryValue } from '../lib/format'

const PAGE_SIZE = 8

export function ContactsPage() {
  const { token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalContacts, setTotalContacts] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formMode, setFormMode] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadContacts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = keyword
        ? await api.searchContacts(token, keyword, page, PAGE_SIZE)
        : await api.contacts(token, page, PAGE_SIZE)
      setContacts(result.content)
      setTotalPages(result.totalPages)
      setTotalContacts(result.totalElements)
      setSelectedContact((current) => result.content.find((contact) => contact.id === current?.id) ?? result.content[0] ?? null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [keyword, page, token])

  useEffect(() => {
    // The directory request intentionally refreshes whenever paging or search state changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContacts()
  }, [loadContacts])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      // The query parameter is router state from the shell's New Contact action.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormMode({ type: 'create' })
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.delete('new')
      setSearchParams(nextSearchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(0)
    setKeyword(searchInput.trim())
  }

  const handleSearchInput = (event) => {
    const value = event.target.value
    setSearchInput(value)
    setKeyword(value.trim())
    setPage(0)
  }

  const clearSearch = () => {
    setSearchInput('')
    setKeyword('')
    setPage(0)
  }

  const handleCreate = async (payload) => {
    const created = await api.createContact(token, payload)
    setFormMode(null)
    await loadContacts()
    setSelectedContact(created)
  }

  const handleUpdate = async (payload) => {
    const updated = await api.updateContact(token, formMode.contact.id, payload)
    setFormMode(null)
    await loadContacts()
    setSelectedContact(updated)
  }

  const handleDelete = async (contact) => {
    await api.deleteContact(token, contact.id)
    setDeleteTarget(null)
    setSelectedContact(null)
    await loadContacts()
  }

  return (
    <div className="page-layout page-layout--directory">
      <section className="content-page directory">
        <header className="content-header">
          <div>
            <h2>Contact Management</h2>
            <p>Manage, filter, and organize your organization&apos;s directory.</p>
          </div>
          <button className="button button--primary" type="button" onClick={() => setFormMode({ type: 'create' })}>
            <UserPlus size={17} /> Add New Contact
          </button>
        </header>

        <div className="directory-toolbar directory-toolbar--portal">
          <form className="search-box" onSubmit={handleSearch}>
            <Search size={18} />
            <input value={searchInput} onChange={handleSearchInput} placeholder="Search by name, email, or title..." aria-label="Search contacts" />
            {keyword && <button type="button" onClick={clearSearch}>Clear</button>}
          </form>
          <div className="filter-group">
            <span>Filter by:</span>
            <button className="button button--outline" type="button"><Tags size={17} /> Label</button>
            <button className="button button--outline" type="button"><ArrowUpDown size={17} /> Sort</button>
          </div>
        </div>

        {error && <div className="form-alert">{error}</div>}

        <div className="contacts-card">
          {loading ? (
            <div className="state-panel">Loading your directory...</div>
          ) : contacts.length === 0 ? (
            <div className="empty-directory">
              <div className="empty-directory-icon"><UsersRound size={25} /></div>
              <p className="eyebrow">{keyword ? 'No matches' : 'Fresh workspace'}</p>
              <h3>{keyword ? 'No contacts found' : 'Your directory is ready'}</h3>
              <p>{keyword ? 'Try another name or clear the current search.' : 'Add your first contact and start building a useful candidate directory.'}</p>
              {keyword ? (
                <button className="button button--outline" type="button" onClick={clearSearch}>Clear search</button>
              ) : (
                <button className="button button--primary" type="button" onClick={() => setFormMode({ type: 'create' })}><Plus size={16} /> Add your first contact</button>
              )}
            </div>
          ) : (
            <>
              <div className="table-scroll">
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" aria-label="Select all contacts" /></th>
                      <th>Name &amp; Title</th>
                      <th>Contact Info</th>
                      <th>Labels</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => {
                      const email = primaryValue(contact.emails, 'email')
                      const phone = primaryValue(contact.phones, 'phone')

                      return (
                        <tr
                          key={contact.id}
                          className={contact.id === selectedContact?.id ? 'table-row--selected' : ''}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <td><input type="checkbox" aria-label="Select contact" onClick={(event) => event.stopPropagation()} /></td>
                          <td>
                            <div className="contact-cell">
                              <span className="avatar">{initials(contact.firstName, contact.lastName)}</span>
                              <span><strong>{displayName(contact)}</strong><small>{contact.title || 'Contact'}</small></span>
                            </div>
                          </td>
                          <td>
                            <div className="table-contact-info">
                              <span>{email ? <><Mail size={15} /> {email}</> : <span className="table-muted">Email not added</span>}</span>
                              <span>{phone ? <><Phone size={15} /> {phone}</> : <span className="table-muted">Phone not added</span>}</span>
                            </div>
                          </td>
                          <td>
                            <div className="chip-row">
                              {contact.company && <span className="chip">{contact.company}</span>}
                              {contact.title && <span className="chip chip--muted">{contact.title}</span>}
                              {!contact.company && !contact.title && <span className="table-muted">No labels</span>}
                            </div>
                          </td>
                          <td>
                            <button className="text-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedContact(contact) }}>
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <footer className="table-footer">
                <p>Showing <strong>{contacts.length ? page * PAGE_SIZE + 1 : 0}</strong> to <strong>{page * PAGE_SIZE + contacts.length}</strong> of <strong>{totalContacts}</strong> contacts</p>
                <div>
                  <button className="button button--outline" type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 0} aria-label="Previous page"><ChevronLeft size={17} /> Previous</button>
                  <button className="page-pill" type="button" aria-current="page">{page + 1}</button>
                  <button className="button button--outline" type="button" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages - 1} aria-label="Next page">Next <ChevronRight size={17} /></button>
                </div>
              </footer>
            </>
          )}
        </div>
      </section>

      <ContactDetail contact={selectedContact} onEdit={(contact) => setFormMode({ type: 'edit', contact })} onDelete={setDeleteTarget} />

      {formMode?.type === 'create' && (
        <Modal title="Create Contact" eyebrow="Add a new professional connection to your network" onClose={() => setFormMode(null)} variant="drawer">
          <ContactForm onCancel={() => setFormMode(null)} onSubmit={handleCreate} />
        </Modal>
      )}
      {formMode?.type === 'edit' && (
        <Modal title="Edit Contact" eyebrow={displayName(formMode.contact)} onClose={() => setFormMode(null)} variant="drawer">
          <ContactForm initialValue={formMode.contact} onCancel={() => setFormMode(null)} onSubmit={handleUpdate} submitLabel="Save changes" />
        </Modal>
      )}
      {deleteTarget && <DeleteContactModal contact={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  )
}
