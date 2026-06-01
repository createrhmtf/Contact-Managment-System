import { CalendarDays, KeyRound, LogOut, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { api } from '../lib/api'
import { initials } from '../lib/format'

export function ProfilePage() {
  const { token, logout, updateSession } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  useEffect(() => {
    api.profile(token)
      .then((result) => {
        setProfile(result)
        setForm({ firstName: result.firstName ?? '', lastName: result.lastName ?? '' })
      })
      .catch((requestError) => setStatus({ type: 'error', message: requestError.message }))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus({ type: '', message: '' })
    try {
      const updated = await api.updateProfile(token, form)
      setProfile(updated)
      updateSession({ firstName: updated.firstName })
      setStatus({ type: 'success', message: 'Profile details saved.' })
    } catch (requestError) {
      setStatus({ type: 'error', message: requestError.message })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="state-panel state-panel--page">Loading your profile...</div>
  }

  return (
    <div className="profile-page">
      <header className="page-header page-header--profile">
        <div>
          <p className="eyebrow">Personal settings</p>
          <h1>Your profile.</h1>
          <p>Update your details and keep your account protected.</p>
        </div>
        <div className="header-art" aria-hidden="true"><span /><span /></div>
      </header>

      {status.message && <div className={`form-alert form-alert--${status.type}`}>{status.message}</div>}

      <div className="profile-grid">
        <section className="profile-card profile-card--identity">
          <div className="profile-identity">
            <span className="avatar avatar--profile">{initials(profile?.firstName, profile?.lastName)}</span>
            <div>
              <p className="eyebrow">Nexa member</p>
              <h2>{profile?.firstName} {profile?.lastName}</h2>
              <p>Your private contact workspace</p>
            </div>
          </div>
          <div className="profile-facts">
            <p><Mail size={16} /><span>{profile?.email}</span></p>
            <p><Phone size={16} /><span>{profile?.phoneNumber || 'No phone number added'}</span></p>
            <p><CalendarDays size={16} /><span>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'today'}</span></p>
          </div>
        </section>

        <section className="profile-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Profile details</p>
              <h2>Personal information</h2>
            </div>
            <UserRound size={20} />
          </div>
          <form className="stack-form" onSubmit={handleSubmit}>
            <div className="form-grid form-grid--two">
              <label className="field">
                <span>First name</span>
                <input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
              </label>
              <label className="field">
                <span>Last name</span>
                <input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </label>
            </div>
            <div className="form-actions">
              <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
            </div>
          </form>
        </section>

        <section className="profile-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Account security</p>
              <h2>Password & access</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <p className="profile-card-copy">Use a strong password and update it regularly to keep your personal directory protected.</p>
          <button className="button button--outline" type="button" onClick={() => setPasswordOpen(true)}><KeyRound size={16} /> Change password</button>
        </section>

        <section className="profile-card profile-card--logout">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Session</p>
              <h2>Ready to step away?</h2>
            </div>
            <LogOut size={20} />
          </div>
          <p className="profile-card-copy">Log out securely when you are finished using your contact workspace.</p>
          <button className="button button--ghost" type="button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
        </section>
      </div>

      {passwordOpen && <ChangePasswordModal token={token} onClose={() => setPasswordOpen(false)} />}
    </div>
  )
}
