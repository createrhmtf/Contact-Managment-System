import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BrandMark } from '../components/BrandMark'

export function RegisterPage() {
  const { token, register } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/contacts" replace />
  }

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      }
      await register(payload)
      navigate('/contacts', { replace: true })
    } catch (requestError) {
      setError(requestError.details?.length ? requestError.details.join(' ') : requestError.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-panel">
        <BrandMark />
        <div className="auth-copy">
          <p className="eyebrow">Start your workspace</p>
          <h1>Make room for meaningful connections.</h1>
          <p>A focused contact directory for the people and conversations that move your work forward.</p>
        </div>
        <div className="auth-benefits">
          <span>One secure workspace</span>
          <span>Thoughtful contact profiles</span>
          <span>Fast search and updates</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-form auth-form--wide" onSubmit={handleSubmit}>
          <p className="eyebrow">Create account</p>
          <h2>Set up your contact space</h2>
          <p className="muted">A few details and your directory will be ready.</p>
          {error && <div className="form-alert">{error}</div>}
          <div className="form-grid form-grid--two">
            <label className="field field--icon">
              <span>First name</span>
              <div><UserRound size={17} /><input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Alex" /></div>
            </label>
            <label className="field">
              <span>Last name</span>
              <input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Morgan" />
            </label>
          </div>
          <label className="field field--icon">
            <span>Email</span>
            <div><Mail size={17} /><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="alex@example.com" /></div>
          </label>
          <label className="field field--icon">
            <span>Phone number <small>Optional</small></span>
            <div><Phone size={17} /><input autoComplete="tel" value={form.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} placeholder="+1 555 0142" /></div>
          </label>
          <div className="form-grid form-grid--two">
            <label className="field field--icon">
              <span>Password</span>
              <div>
                <LockKeyhole size={17} />
                <input required minLength="6" autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="At least 6 characters" />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input required minLength="6" autoComplete="new-password" type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repeat password" />
            </label>
          </div>
          <button className="button button--primary button--wide" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'} <ArrowRight size={17} />
          </button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </section>
    </main>
  )
}
