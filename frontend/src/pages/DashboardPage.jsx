import { AlertTriangle, FileText, Plus, UserPlus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { api } from '../lib/api'
import { displayName, initials, primaryValue } from '../lib/format'

export function DashboardPage() {
  const { token } = useAuth()
  const [contacts, setContacts] = useState([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.contacts(token, 0, 6)
      .then((result) => {
        setContacts(result.content ?? [])
        setTotalContacts(result.totalElements ?? 0)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [token])

  const missingInfo = useMemo(() => (
    contacts.filter((contact) => !primaryValue(contact.emails, 'email') || !primaryValue(contact.phones, 'phone')).length
  ), [contacts])

  // UI-002: Real 30-day filter using createdAt timestamp
  const recentCount = useMemo(() => (
    contacts.filter((c) => {
      if (!c.createdAt) return false
      return (Date.now() - new Date(c.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    }).length
  ), [contacts])

  const recentContacts = contacts.slice(0, 3)

  return (
    <section className="content-page dashboard-page">
      <header className="content-header">
        <div>
          <h2>Overview</h2>
          <p>Here&apos;s what&apos;s happening with your contacts today.</p>
        </div>
      </header>

      {error && <div className="form-alert">{error}</div>}

      <div className="dashboard-grid">
        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon metric-icon--blue"><UsersRound size={22} /></span>
          </div>
          <p>Total Contacts</p>
          <strong>{loading ? '...' : totalContacts.toLocaleString()}</strong>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon"><UserPlus size={22} /></span>
          </div>
          <p>Recently Added (30d)</p>
          <strong>{loading ? '...' : recentCount}</strong>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon metric-icon--danger"><AlertTriangle size={22} /></span>
            <span className="status-badge">Needs Action</span>
          </div>
          <p>Missing Info</p>
          <strong>{loading ? '...' : missingInfo}</strong>
        </article>

        <article className="activity-card">
          <div className="section-title-row">
            <h3>Recently Added</h3>
            <Link to="/contacts">View All</Link>
          </div>
          {recentContacts.length === 0 && !loading ? (
            <div className="state-panel">No contacts yet. Add your first one!</div>
          ) : (
            <div className="activity-list">
              {(recentContacts.length ? recentContacts : [null, null, null]).map((contact, index) => (
                <div className="activity-item" key={contact?.id ?? index}>
                  <span className="avatar">{contact ? initials(contact.firstName, contact.lastName) : <FileText size={17} />}</span>
                  <p>
                    <strong>{contact ? displayName(contact) : '...'}</strong>
                    <span>{contact ? (primaryValue(contact.emails, 'email') || 'No email') : ''}</span>
                    <small>{contact?.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ''}</small>
                  </p>
                  <em>{contact?.company || contact?.title || ''}</em>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <Link className="floating-action" to="/contacts?new=1" aria-label="New contact">
        <Plus size={22} />
      </Link>
    </section>
  )
}
