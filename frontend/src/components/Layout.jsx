import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function Layout() {
  const { user, logout } = useAuth()
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container py-2">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <span className="brand-mark"><i className="bi bi-book-half" /></span>
            <span>evergreen<span className="brand-light"> library</span></span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
              <NavLink className="nav-link" to="/catalog">Explore books</NavLink>
              {user && <NavLink className="nav-link" to="/dashboard">My library</NavLink>}
              {user?.role === 'ADMIN' && <NavLink className="nav-link" to="/admin">Administration</NavLink>}
              {user ? (
                <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={logout}>Sign out</button>
              ) : (
                <>
                  <NavLink className="nav-link" to="/login">Sign in</NavLink>
                  <Link className="btn btn-primary rounded-pill px-4" to="/register">Join the library</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container py-5">
          <div className="row align-items-center gy-3">
            <div className="col-md-7">
              <Link className="footer-brand" to="/">evergreen library</Link>
              <p className="mb-0 mt-2 text-white-50">A little more wonder in every day.</p>
            </div>
            <div className="col-md-5 text-md-end small text-white-50">© {new Date().getFullYear()} Evergreen Library · Made for curious minds</div>
          </div>
        </div>
      </footer>
    </>
  )
}

export function PageShell({ children, title, subtitle }) {
  return <section className="container page-shell"><div className="mb-4"><h1 className="page-title">{title}</h1>{subtitle && <p className="text-secondary mb-0">{subtitle}</p>}</div>{children}</section>
}

export function Loading({ label = 'Loading your library…' }) {
  return <div className="loading-state"><span className="spinner-border spinner-border-sm text-primary" role="status" /><span>{label}</span></div>
}

export function ErrorMessage({ error }) {
  if (!error) return null
  return <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-circle me-2" />{error}</div>
}
