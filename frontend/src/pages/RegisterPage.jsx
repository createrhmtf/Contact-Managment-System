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
    return <Navigate to="/dashboard" replace />
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
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.details?.length ? requestError.details.join(' ') : requestError.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-form-panel">
        <form className="auth-form auth-form--wide" onSubmit={handleSubmit}>
          <div className="auth-form-heading auth-form-heading--brand">
            <BrandMark />
            <p>Create your CMS candidate portal account.</p>
          </div>

          {error && <div className="form-alert">{error}</div>}

          <div className="form-grid form-grid--two">
            <label className="field field--icon">
              <span>First Name</span>
              <div>
                <UserRound size={17} />
                <input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Jane" />
              </div>
            </label>
            <label className="field">
              <span>Last Name</span>
              <input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Doe" />
            </label>
          </div>

          <label className="field field--icon">
            <span>Email</span>
            <div>
              <Mail size={17} />
              <input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="jane.doe@example.com" />
            </div>
          </label>

          <label className="field field--icon">
            <span>Phone number <small>Optional</small></span>
            <div>
              <Phone size={17} />
              <input autoComplete="tel" value={form.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
          </label>

          <div className="form-grid form-grid--two">
            <label className="field field--icon">
              <span>Password</span>
              <div>
                <LockKeyhole size={17} />
                <input
                  required
                  minLength="6"
                  autoComplete="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  placeholder="At least 6 characters"
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label className="field">
              <span>Confirm Password</span>
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
