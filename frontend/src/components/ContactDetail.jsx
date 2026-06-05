import { Building2, CalendarDays, Mail, MapPin, Pencil, Phone, Trash2, UserRound } from 'lucide-react'
import { displayName, initials } from '../lib/format'

export function ContactDetail({ contact, onEdit, onDelete }) {
  if (!contact) {
    return (
      <aside className="contact-detail contact-detail--empty">
        <div className="detail-empty-visual">
          <UserRound size={34} />
        </div>
        <p className="eyebrow">Contact preview</p>
        <h2>Select a contact</h2>
        <p>Choose someone from your directory to see their profile details.</p>
      </aside>
    )
  }

  return (
    <aside className="contact-detail">
      <section className="detail-hero">
        <span className="avatar avatar--large">{initials(contact.firstName, contact.lastName)}</span>
        <div>
          <p className="eyebrow">Contact profile</p>
          <h2>{displayName(contact)}</h2>
          <p>{contact.title || 'Contact'}{contact.company ? `, ${contact.company}` : ''}</p>
          <div className="chip-row">
            {contact.company && <span className="chip">Key Account</span>}
            <span className="chip chip--blue">Active Pipeline</span>
          </div>
        </div>
      </section>

      <div className="detail-actions">
        <button className="button button--danger-outline" type="button" onClick={() => onDelete(contact)} aria-label={`Delete ${displayName(contact)}`}>
          <Trash2 size={16} /> Delete Contact
        </button>
        <button className="button button--primary" type="button" onClick={() => onEdit(contact)}>
          <Pencil size={16} /> Edit Contact
        </button>
      </div>

      <section className="detail-card">
        <div className="card-heading">
          <h3>Contact Information</h3>
          <Mail size={20} />
        </div>
        <div className="detail-info-grid">
          <div>
            <p className="detail-label">Email Addresses</p>
            {contact.emails?.length ? contact.emails.map((item) => (
              <div className="detail-line" key={`${item.email}-${item.label}`}>
                <Mail size={16} />
                <span><small>{item.label || 'Email'}</small><strong>{item.email}</strong></span>
              </div>
            )) : <p className="detail-notes">No email addresses added.</p>}
          </div>
          <div>
            <p className="detail-label">Phone Numbers</p>
            {contact.phones?.length ? contact.phones.map((item) => (
              <div className="detail-line" key={`${item.phone}-${item.label}`}>
                <Phone size={16} />
                <span><small>{item.label || 'Phone'}</small><strong>{item.phone}</strong></span>
              </div>
            )) : <p className="detail-notes">No phone numbers added.</p>}
          </div>
        </div>
      </section>

      <section className="detail-card">
        <div className="card-heading">
          <h3>Organization</h3>
          <Building2 size={20} />
        </div>
        <div className="detail-line">
          <Building2 size={16} />
          <span><small>Company</small><strong>{contact.company || 'No organization added'}</strong></span>
        </div>
        {contact.address && (
          <div className="detail-line">
            <MapPin size={16} />
            <span><small>Location</small><strong>{contact.address}</strong></span>
          </div>
        )}
      </section>

      <section className="detail-card">
        <div className="card-heading">
          <h3>Internal Notes</h3>
          <CalendarDays size={20} />
        </div>
        <p className="detail-notes detail-notes--boxed">{contact.notes || 'No notes have been added for this contact yet.'}</p>
      </section>
    </aside>
  )
}
