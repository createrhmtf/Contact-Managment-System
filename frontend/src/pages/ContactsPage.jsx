import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { ContactDetail } from '../components/ContactDetail'
import { ContactForm } from '../components/ContactForm'
import { DeleteContactModal } from '../components/DeleteContactModal'
import { Modal } from '../components/Modal'
import { api } from '../lib/api'
import { displayName, initials, primaryValue, todayLabel } from '../lib/format'

const PAGE_SIZE = 8

export function ContactsPage() {
  const { session, token } = useAuth()
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
      <section className="directory">
        <header className="page-header">
          <div>
            <p className="eyebrow">{todayLabel()}</p>
            <h1>Good morning, {session?.firstName || 'there'}.</h1>
            <p>Keep the people who matter close at hand.</p>
          </div>
          <div className="header-art" aria-hidden="true"><span /><span /></div>
        </header>

        <div className="directory-title-row">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h2>Your contacts</h2>
          </div>
          <button className="button button--primary" type="button" onClick={() => setFormMode({ type: 'create' })}>
            <Plus size={17} /> Add contact
          </button>
        </div>

        <div className="directory-toolbar">
          <form className="search-box" onSubmit={handleSearch}>
            <Search size={17} />
            <input value={searchInput} onChange={handleSearchInput} placeholder="Search by first or last name" aria-label="Search contacts" />
            {keyword && <button type="button" onClick={clearSearch}>Clear</button>}
          </form>
          <div className="directory-count"><UsersRound size={17} /><strong>{totalContacts}</strong><span>contacts</span></div>
          <button className="icon-button toolbar-filter" type="button" aria-label="Directory filters"><SlidersHorizontal size={17} /></button>
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
              <p>{keyword ? 'Try another name or clear the current search.' : 'Add your first contact and start building a more thoughtful directory.'}</p>
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
                      <th>Contact</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className={contact.id === selectedContact?.id ? 'table-row--selected' : ''}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <td>
                          <div className="contact-cell">
                            <span className="avatar">{initials(contact.firstName, contact.lastName)}</span>
                            <span><strong>{displayName(contact)}</strong><small>{contact.title || 'Contact'}</small></span>
                          </div>
                        </td>
                        <td>{contact.company || <span className="table-muted">Not added</span>}</td>
                        <td>{primaryValue(contact.emails, 'email') || <span className="table-muted">Not added</span>}</td>
                        <td>{primaryValue(contact.phones, 'phone') || <span className="table-muted">Not added</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className="table-footer">
                <p>Page <strong>{page + 1}</strong> of <strong>{Math.max(totalPages, 1)}</strong></p>
                <div>
                  <button className="icon-button" type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 0} aria-label="Previous page"><ChevronLeft size={17} /></button>
                  <button className="icon-button" type="button" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages - 1} aria-label="Next page"><ChevronRight size={17} /></button>
                </div>
              </footer>
            </>
          )}
        </div>
      </section>

      <ContactDetail contact={selectedContact} onEdit={(contact) => setFormMode({ type: 'edit', contact })} onDelete={setDeleteTarget} />

      {formMode?.type === 'create' && (
        <Modal title="Add new contact" eyebrow="Build your directory" onClose={() => setFormMode(null)}>
          <ContactForm onCancel={() => setFormMode(null)} onSubmit={handleCreate} />
        </Modal>
      )}
      {formMode?.type === 'edit' && (
        <Modal title="Edit contact" eyebrow={displayName(formMode.contact)} onClose={() => setFormMode(null)} variant="drawer">
          <ContactForm initialValue={formMode.contact} onCancel={() => setFormMode(null)} onSubmit={handleUpdate} submitLabel="Save changes" />
        </Modal>
      )}
      {deleteTarget && <DeleteContactModal contact={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  )
}
