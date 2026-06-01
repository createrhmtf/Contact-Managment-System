import { useState } from 'react'
import { api } from '../lib/api'
import { Modal } from './Modal'

export function ChangePasswordModal({ token, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setSaving(true)
    setStatus({ type: '', message: '' })
    try {
      await api.changePassword(token, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setStatus({ type: 'success', message: 'Password updated successfully.' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaving(false)
    } catch (requestError) {
      setStatus({ type: 'error', message: requestError.message })
      setSaving(false)
    }
  }

  return (
    <Modal title="Change password" eyebrow="Account security" onClose={onClose} variant="small">
      <form className="stack-form" onSubmit={handleSubmit}>
        {status.message && <div className={`form-alert form-alert--${status.type}`}>{status.message}</div>}
        <label className="field">
          <span>Current password</span>
          <input required type="password" autoComplete="current-password" value={form.currentPassword} onChange={(event) => update('currentPassword', event.target.value)} />
        </label>
        <label className="field">
          <span>New password</span>
          <input required minLength="6" type="password" autoComplete="new-password" value={form.newPassword} onChange={(event) => update('newPassword', event.target.value)} />
        </label>
        <label className="field">
          <span>Confirm new password</span>
          <input required minLength="6" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} />
        </label>
        <div className="form-actions">
          <button className="button button--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="button button--primary" type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
