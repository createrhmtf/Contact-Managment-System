import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { displayName } from '../lib/format'
import { Modal } from './Modal'

export function DeleteContactModal({ contact, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await onConfirm(contact)
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <Modal title={`Delete ${displayName(contact)}?`} eyebrow="Permanent action" onClose={onClose} variant="confirm">
      <div className="confirmation-copy">
        <span className="warning-icon"><AlertTriangle size={24} /></span>
        <p>This contact will be permanently removed from your directory. This action cannot be undone.</p>
      </div>
      {error && <div className="form-alert">{error}</div>}
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onClose}>Cancel</button>
        <button className="button button--danger" type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete contact'}
        </button>
      </div>
    </Modal>
  )
}
