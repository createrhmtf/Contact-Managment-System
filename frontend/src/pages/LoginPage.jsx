import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BrandMark } from '../components/BrandMark'

export function LoginPage() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ emailOrPhone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/contacts" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/contacts', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <BrandMark />
        <div className="auth-copy">
          <p className="eyebrow">Your personal directory</p>
          <h1>Welcome back.</h1>
          <p>Keep every important connection within reach, beautifully organized and easy to find.</p>
        </div>
        <div className="auth-art" aria-hidden="true">
          <span className="auth-art-ring auth-art-ring--one" />
          <span className="auth-art-ring auth-art-ring--two" />
          <span className="auth-art-card auth-art-card--one">MC</span>
          <span className="auth-art-card auth-art-card--two">AL</span>
          <span className="auth-art-card auth-art-card--three">SK</span>
        </div>
        <p className="auth-quote">“A calmer way to stay connected.”</p>
      </section>

      <section className="auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Sign in</p>
          <h2>Good to see you again</h2>
          <p className="muted">Enter the credentials you used when creating your account.</p>
          {error && <div className="form-alert">{error}</div>}
          <label className="field field--icon">
            <span>Email or phone number</span>
            <div>
              <Mail size={17} />
              <input required autoFocus autoComplete="username" value={form.emailOrPhone} onChange={(event) => setForm({ ...form, emailOrPhone: event.target.value })} placeholder="you@example.com" />
            </div>
          </label>
          <label className="field field--icon">
            <span>Password</span>
            <div>
              <LockKeyhole size={17} />
              <input required autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <button className="button button--primary button--wide" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} />
          </button>
          <p className="auth-switch">New to Nexa? <Link to="/register">Create an account</Link></p>
        </form>
      </section>
    </main>
  )
}
