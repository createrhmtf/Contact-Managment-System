import { Building2, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react'
import { displayName, initials } from '../lib/format'

export function ContactDetail({ contact, onEdit, onDelete }) {
  if (!contact) {
    return (
      <aside className="contact-detail contact-detail--empty">
        <div className="detail-empty-visual">
          <span />
          <span />
        </div>
        <p className="eyebrow">Contact preview</p>
        <h2>Select a contact</h2>
        <p>Choose someone from your directory to see their profile details.</p>
      </aside>
    )
  }

  return (
    <aside className="contact-detail">
      <div className="detail-accent" />
      <div className="detail-header">
        <span className="avatar avatar--large">{initials(contact.firstName, contact.lastName)}</span>
        <p className="eyebrow">Contact profile</p>
        <h2>{displayName(contact)}</h2>
        <p>{contact.title || 'Contact'}{contact.company ? ` at ${contact.company}` : ''}</p>
      </div>

      <div className="detail-actions">
        <button className="button button--outline" type="button" onClick={() => onEdit(contact)}>
          <Pencil size={15} /> Edit
        </button>
        <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(contact)} aria-label={`Delete ${displayName(contact)}`}>
          <Trash2 size={17} />
        </button>
      </div>

      <div className="detail-section">
        <p className="detail-label">Contact details</p>
        {contact.emails?.map((item) => (
          <div className="detail-line" key={`${item.email}-${item.label}`}>
            <Mail size={16} />
            <span><strong>{item.email}</strong><small>{item.label || 'Email'}</small></span>
          </div>
        ))}
        {contact.phones?.map((item) => (
          <div className="detail-line" key={`${item.phone}-${item.label}`}>
            <Phone size={16} />
            <span><strong>{item.phone}</strong><small>{item.label || 'Phone'}</small></span>
          </div>
        ))}
        {contact.company && (
          <div className="detail-line">
            <Building2 size={16} />
            <span><strong>{contact.company}</strong><small>Company</small></span>
          </div>
        )}
        {contact.address && (
          <div className="detail-line">
            <MapPin size={16} />
            <span><strong>{contact.address}</strong><small>Address</small></span>
          </div>
        )}
      </div>

      <div className="detail-section">
        <p className="detail-label">Notes</p>
        <p className="detail-notes">{contact.notes || 'No notes have been added for this contact yet.'}</p>
      </div>
    </aside>
  )
}
