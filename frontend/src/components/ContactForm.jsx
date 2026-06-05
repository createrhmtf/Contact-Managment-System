import { AlignLeft, Mail, MapPin, Minus, Plus, UserRound } from 'lucide-react'
import { useState } from 'react'

function createEmail() {
  return { email: '', label: 'Work', primary: false }
}

function createPhone() {
  return { phone: '', label: 'Mobile', primary: false }
}

function normalize(contact = {}) {
  return {
    firstName: contact.firstName ?? '',
    lastName: contact.lastName ?? '',
    title: contact.title ?? '',
    company: contact.company ?? '',
    address: contact.address ?? '',
    notes: contact.notes ?? '',
    emails: contact.emails?.length ? contact.emails.map((item) => ({ ...item })) : [{ ...createEmail(), primary: true }],
    phones: contact.phones?.length ? contact.phones.map((item) => ({ ...item })) : [{ ...createPhone(), primary: true }],
  }
}

export function ContactForm({ initialValue, onCancel, onSubmit, submitLabel = 'Save contact' }) {
  const [form, setForm] = useState(() => normalize(initialValue))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const setListField = (list, index, field, value) => {
    setForm((current) => ({
      ...current,
      [list]: current[list].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  const setPrimary = (list, index) => {
    setForm((current) => ({
      ...current,
      [list]: current[list].map((item, itemIndex) => ({ ...item, primary: itemIndex === index })),
    }))
  }

  const addItem = (list) => {
    const item = list === 'emails' ? createEmail() : createPhone()
    setForm((current) => ({ ...current, [list]: [...current[list], item] }))
  }

  const removeItem = (list, index) => {
    setForm((current) => {
      const remaining = current[list].filter((_, itemIndex) => itemIndex !== index)
      if (remaining.length && !remaining.some((item) => item.primary)) {
        remaining[0] = { ...remaining[0], primary: true }
      }
      return { ...current, [list]: remaining }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      emails: form.emails.filter((item) => item.email.trim()).map((item) => ({ ...item, email: item.email.trim() })),
      phones: form.phones.filter((item) => item.phone.trim()).map((item) => ({ ...item, phone: item.phone.trim() })),
    }

    try {
      await onSubmit(payload)
    } catch (requestError) {
      setError(requestError.message)
      setSaving(false)
    }
  }

  return (
    <form className="contact-form portal-form" onSubmit={handleSubmit}>
      {error && <div className="form-alert">{error}</div>}

      <section className="form-section form-section--panel">
        <div className="form-section-title">
          <UserRound size={20} />
          <h3>Basic Information</h3>
        </div>
        <div className="form-grid form-grid--two">
          <label className="field">
            <span>First name</span>
            <input required value={form.firstName} onChange={(event) => setField('firstName', event.target.value)} placeholder="e.g. Jane" />
          </label>
          <label className="field">
            <span>Last name</span>
            <input value={form.lastName} onChange={(event) => setField('lastName', event.target.value)} placeholder="e.g. Doe" />
          </label>
        </div>
        <label className="field">
          <span>Job title</span>
          <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. Senior Software Engineer" />
        </label>
        <label className="field">
          <span>Company</span>
          <input value={form.company} onChange={(event) => setField('company', event.target.value)} placeholder="e.g. Acme Corp" />
        </label>
      </section>

      <section className="form-section form-section--panel">
        <div className="form-section-title">
          <Mail size={20} />
          <h3>Contact Methods</h3>
        </div>
        <div className="form-section-heading">
          <span>Email addresses</span>
          <button className="text-button" type="button" onClick={() => addItem('emails')}><Plus size={14} /> Add Email</button>
        </div>
        {form.emails.map((item, index) => (
          <div className="repeat-row" key={`email-${index}`}>
            <select value={item.label} onChange={(event) => setListField('emails', index, 'label', event.target.value)}>
              <option>Work</option>
              <option>Personal</option>
              <option>Other</option>
            </select>
            <input type="email" value={item.email} onChange={(event) => setListField('emails', index, 'email', event.target.value)} placeholder="name@example.com" />
            <button className={`primary-toggle ${item.primary ? 'primary-toggle--active' : ''}`} type="button" onClick={() => setPrimary('emails', index)}>
              Primary
            </button>
            <button className="mini-icon" type="button" onClick={() => removeItem('emails', index)} aria-label="Remove email"><Minus size={15} /></button>
          </div>
        ))}

        <div className="form-section-heading">
          <span>Phone numbers</span>
          <button className="text-button" type="button" onClick={() => addItem('phones')}><Plus size={14} /> Add Phone</button>
        </div>
        {form.phones.map((item, index) => (
          <div className="repeat-row" key={`phone-${index}`}>
            <select value={item.label} onChange={(event) => setListField('phones', index, 'label', event.target.value)}>
              <option>Mobile</option>
              <option>Work</option>
              <option>Home</option>
              <option>Other</option>
            </select>
            <input value={item.phone} onChange={(event) => setListField('phones', index, 'phone', event.target.value)} placeholder="+1 555 0142" />
            <button className={`primary-toggle ${item.primary ? 'primary-toggle--active' : ''}`} type="button" onClick={() => setPrimary('phones', index)}>
              Primary
            </button>
            <button className="mini-icon" type="button" onClick={() => removeItem('phones', index)} aria-label="Remove phone"><Minus size={15} /></button>
          </div>
        ))}
      </section>

      <section className="form-section form-section--panel">
        <div className="form-section-title">
          <AlignLeft size={20} />
          <h3>Additional Details</h3>
        </div>
        <label className="field">
          <span><MapPin size={15} /> Address</span>
          <input value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, city, country" />
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea value={form.notes} onChange={(event) => setField('notes', event.target.value)} placeholder="Add context, reminders, or a short note..." rows="4" />
        </label>
      </section>

      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
