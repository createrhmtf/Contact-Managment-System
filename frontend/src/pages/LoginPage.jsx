import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BrandMark } from '../components/BrandMark'
import { api } from '../lib/api'

export function LoginPage() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false)
  const [form, setForm] = useState({ emailOrPhone: '', password: '' })
  const [recoveryForm, setRecoveryForm] = useState({ email: '', phoneNumber: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [recoveryStatus, setRecoveryStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [recoverySubmitting, setRecoverySubmitting] = useState(false)
  const isRecoveryMode = location.hash === '#forgot-password'

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }

  const updateRecoveryForm = (field, value) => {
    setRecoveryForm((current) => ({ ...current, [field]: value }))
  }

  const openRecovery = () => {
    setError('')
    setRecoveryStatus({ type: '', message: '' })
    navigate('/login#forgot-password')
  }

  const closeRecovery = () => {
    setRecoveryStatus({ type: '', message: '' })
    navigate('/login')
  }

  const handleRecoverySubmit = async (event) => {
    event.preventDefault()

    if (recoveryForm.newPassword !== recoveryForm.confirmPassword) {
      setRecoveryStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setRecoverySubmitting(true)
    setRecoveryStatus({ type: '', message: '' })
    try {
      await api.forgotPassword({
        email: recoveryForm.email.trim(),
        phoneNumber: recoveryForm.phoneNumber.trim(),
        newPassword: recoveryForm.newPassword,
      })
      setRecoveryStatus({
        type: 'success',
        message: 'Password reset successfully. You can sign in with your new password.',
      })
      setForm({ emailOrPhone: recoveryForm.email.trim(), password: '' })
      setRecoveryForm({ email: '', phoneNumber: '', newPassword: '', confirmPassword: '' })
    } catch (requestError) {
      setRecoveryStatus({ type: 'error', message: requestError.details?.length ? requestError.details.join(' ') : requestError.message })
    } finally {
      setRecoverySubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-page--centered">
      <header className="auth-header">
        <BrandMark />
        <a href="#help">Help</a>
      </header>

      <section className="auth-form-panel">
        {isRecoveryMode ? (
          <form className="auth-form" onSubmit={handleRecoverySubmit}>
            <div className="auth-form-heading">
              <h1>Reset Password</h1>
              <p>Enter your registered email and phone number to set a new password.</p>
            </div>

            {recoveryStatus.message && <div className={`form-alert form-alert--${recoveryStatus.type}`}>{recoveryStatus.message}</div>}

            <label className="field field--icon">
              <span>Registered Email</span>
              <div>
                <Mail size={17} />
                <input
                  required
                  autoFocus
                  type="email"
                  autoComplete="email"
                  value={recoveryForm.email}
                  onChange={(event) => updateRecoveryForm('email', event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label className="field field--icon">
              <span>Registered Phone Number</span>
              <div>
                <Phone size={17} />
                <input
                  required
                  autoComplete="tel"
                  value={recoveryForm.phoneNumber}
                  onChange={(event) => updateRecoveryForm('phoneNumber', event.target.value)}
                  placeholder="+1 555 0142"
                />
              </div>
            </label>

            <label className="field field--icon">
              <span>New Password</span>
              <div>
                <LockKeyhole size={17} />
                <input
                  required
                  minLength="6"
                  autoComplete="new-password"
                  type={showRecoveryPassword ? 'text' : 'password'}
                  value={recoveryForm.newPassword}
                  onChange={(event) => updateRecoveryForm('newPassword', event.target.value)}
                  placeholder="At least 6 characters"
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowRecoveryPassword((current) => !current)}
                  aria-label={showRecoveryPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showRecoveryPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Confirm New Password</span>
              <input
                required
                minLength="6"
                autoComplete="new-password"
                type="password"
                value={recoveryForm.confirmPassword}
                onChange={(event) => updateRecoveryForm('confirmPassword', event.target.value)}
                placeholder="Repeat new password"
              />
            </label>

            <button className="button button--primary button--wide" type="submit" disabled={recoverySubmitting}>
              {recoverySubmitting ? 'Resetting...' : 'Reset password'} <ArrowRight size={17} />
            </button>
            <button className="auth-link-button" type="button" onClick={closeRecovery}>
              <ArrowLeft size={16} /> Back to sign in
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-heading">
              <h1>Welcome Back</h1>
              <p>Sign in to manage your candidates and submissions.</p>
            </div>

            {error && <div className="form-alert">{error}</div>}

            <label className="field field--icon">
              <span>Email or Phone Number</span>
              <div>
                <Mail size={17} />
                <input
                  required
                  autoFocus
                  autoComplete="username"
                  value={form.emailOrPhone}
                  onChange={(event) => setForm({ ...form, emailOrPhone: event.target.value })}
                  placeholder="Email or phone number"
                />
              </div>
            </label>

            <label className="field field--icon">
              <span>Password</span>
              <div>
                <LockKeyhole size={17} />
                <input
                  required
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Enter your password"
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

            <div className="auth-tools">
              <label>
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <button className="auth-link-button" type="button" onClick={openRecovery}>Forgot Password?</button>
            </div>

            <button className="button button--primary button--wide" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} />
            </button>

            <p className="auth-switch">Don&apos;t have an account? <Link to="/register">Register</Link></p>
          </form>
        )}
      </section>
    </main>
  )
}
