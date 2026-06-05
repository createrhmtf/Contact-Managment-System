import { AlertTriangle, Download, FileText, Plus, TrendingUp, UserPlus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { api } from '../lib/api'
import { displayName, initials, primaryValue } from '../lib/format'

const chartBars = [
  { label: 'Jan', value: 28 },
  { label: 'Feb', value: 42 },
  { label: 'Mar', value: 36 },
  { label: 'Apr', value: 55 },
  { label: 'May', value: 78 },
  { label: 'Jun', value: 92 },
]

export function DashboardPage() {
  const { session, token } = useAuth()
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
            <span className="trend-badge"><TrendingUp size={14} /> 12%</span>
          </div>
          <p>Total Contacts</p>
          <strong>{loading ? '...' : totalContacts.toLocaleString()}</strong>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon"><UserPlus size={22} /></span>
            <span className="trend-badge"><TrendingUp size={14} /> 5%</span>
          </div>
          <p>Recently Added (30d)</p>
          <strong>{loading ? '...' : recentContacts.length}</strong>
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
            <h3>Recent Activity</h3>
            <Link to="/contacts">View Full Log</Link>
          </div>
          {recentContacts.length === 0 && !loading ? (
            <div className="state-panel">No recent contact activity yet.</div>
          ) : (
            <div className="activity-list">
              {(recentContacts.length ? recentContacts : [null, null, null]).map((contact, index) => (
                <div className="activity-item" key={contact?.id ?? index}>
                  <span className="avatar">{contact ? initials(contact.firstName, contact.lastName) : <FileText size={17} />}</span>
                  <p>
                    <strong>{contact ? displayName(contact) : ['John Doe', 'Sarah Connor', 'Alice Smith'][index]}</strong>
                    <span>{index === 0 ? 'updated contact details' : index === 1 ? 'created a new contact profile' : 'added a note'}</span>
                    <small>{index === 0 ? '2 hours ago' : index === 1 ? '5 hours ago' : 'Yesterday'}</small>
                  </p>
                  <em>{index === 0 ? 'Update' : index === 1 ? 'Creation' : 'Note'}</em>
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
