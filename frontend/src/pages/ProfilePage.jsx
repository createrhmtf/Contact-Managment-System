import { KeyRound, LogOut, Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../lib/api'
import { initials } from '../lib/format'

export function ProfilePage() {
  const { token, logout, updateSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPasswordRef = useRef(null)
  const securityRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    api.profile(token)
      .then((result) => {
        setProfile(result)
        setForm({ firstName: result.firstName ?? '', lastName: result.lastName ?? '' })
      })
      .catch((requestError) => setStatus({ type: 'error', message: requestError.message }))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!loading && location.pathname.startsWith('/settings')) {
      setTimeout(() => {
        securityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [loading, location.pathname])

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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setChangingPassword(true)
    setPasswordStatus({ type: '', message: '' })
    try {
      await api.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (requestError) {
      setPasswordStatus({ type: 'error', message: requestError.message })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const updatePassword = (field, value) => setPasswordForm((current) => ({ ...current, [field]: value }))

  if (loading) {
    return <div className="state-panel state-panel--page">Loading your profile...</div>
  }

  return (
    <section className="content-page profile-page">
      <header className="content-header">
        <div>
          <h2>User Profile</h2>
          <p>Manage your account details, security settings, and preferences.</p>
        </div>
      </header>

      {status.message && <div className={`form-alert form-alert--${status.type}`}>{status.message}</div>}

      <div className="profile-layout">
        <section className="profile-card profile-card--identity">
          <div className="profile-avatar-wrap">
            <span className="avatar avatar--profile">{initials(profile?.firstName, profile?.lastName)}</span>
            <button className="icon-button icon-button--dark" type="button" aria-label="Edit profile picture">
              <Pencil size={16} />
            </button>
          </div>
          <h2>{profile?.firstName} {profile?.lastName}</h2>
          <p>Software Engineering Candidate</p>
          <div className="profile-facts">
            <p><span>Email Address</span><strong>{profile?.email}</strong></p>
            <p><span>Phone Number</span><strong>{profile?.phoneNumber || 'No phone number added'}</strong></p>
            <p><span>Member Since</span><strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Today'}</strong></p>
          </div>
          <form className="stack-form profile-edit-form" onSubmit={handleSubmit}>
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
            <button className="button button--outline button--wide" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
          </form>
        </section>

        <div className="profile-main-column">
          <section className="profile-card profile-card--security" ref={securityRef}>
            <div className="card-heading">
              <div>
                <h3>Security</h3>
                <p>Update your password to keep your account secure.</p>
              </div>
              <button className="button button--outline" type="button" onClick={() => currentPasswordRef.current?.focus()}>
                <KeyRound size={16} /> Change password
              </button>
            </div>
            {passwordStatus.message && <div className={`form-alert form-alert--${passwordStatus.type}`}>{passwordStatus.message}</div>}
            <form className="stack-form security-form" onSubmit={handlePasswordSubmit}>
              <label className="field">
                <span>Current password</span>
                <input ref={currentPasswordRef} required type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => updatePassword('currentPassword', event.target.value)} />
              </label>
              <label className="field">
                <span>New password</span>
                <input required minLength="6" type="password" autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => updatePassword('newPassword', event.target.value)} />
              </label>
              <label className="field">
                <span>Confirm new password</span>
                <input required minLength="6" type="password" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => updatePassword('confirmPassword', event.target.value)} />
              </label>
              <div className="form-actions form-actions--left">
                <button className="button button--primary" type="submit" disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update password'}
                </button>
                <button className="button button--ghost" type="button" onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}>Cancel</button>
              </div>
            </form>
          </section>


          <section className="profile-card profile-card--session">
            <div className="card-heading">
              <div>
                <h3>Session</h3>
                <p>Log out securely when you are finished using the portal.</p>
              </div>
              <LogOut size={20} />
            </div>
            <button className="button button--ghost" type="button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
          </section>
        </div>
      </div>
    </section>
  )
}
