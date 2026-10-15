import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ErrorMessage } from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function AuthFrame({ children, title, subtitle }) {
  return <div className="auth-page"><div className="auth-card"><Link to="/" className="auth-brand"><i className="bi bi-book-half" /> evergreen library</Link><div className="mt-4"><h1>{title}</h1><p className="text-secondary">{subtitle}</p></div>{children}</div></div>
}

export function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await login(form); navigate(location.state?.from || '/dashboard', { replace: true }) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <AuthFrame title="Welcome back." subtitle="Sign in to pick up where your next chapter begins.">
    <ErrorMessage error={error} />
    <form onSubmit={submit} className="auth-form">
      <label className="form-label">Email address<input className="form-control" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="form-label">Password<input className="form-control" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn btn-primary w-100 rounded-pill py-2" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <i className="bi bi-arrow-right ms-2" /></button>
    </form>
    <p className="auth-switch">New around here? <Link to="/register">Create an account</Link></p>
  </AuthFrame>
}

export function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await register(form); navigate('/dashboard', { replace: true }) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <AuthFrame title="A library of your own." subtitle="Create a free account and make room for your next favorite.">
    <ErrorMessage error={error} />
    <form onSubmit={submit} className="auth-form">
      <label className="form-label">Your name<input className="form-control" autoComplete="name" minLength="2" maxLength="100" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="form-label">Email address<input className="form-control" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="form-label">Password<input className="form-control" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><small className="text-secondary">Use at least 8 characters.</small></label>
      <button className="btn btn-primary w-100 rounded-pill py-2" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <i className="bi bi-arrow-right ms-2" /></button>
    </form>
    <p className="auth-switch">Already a member? <Link to="/login">Sign in</Link></p>
  </AuthFrame>
}
