import { Bell, CircleHelp, ContactRound, Grid2x2, LogOut, Menu, Search, Settings, UserRound, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { initials } from '../lib/format'
import { BrandMark } from './BrandMark'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Grid2x2 },
  { to: '/contacts', label: 'Contacts', icon: ContactRound },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)
  const { session, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const title = location.pathname.startsWith('/contacts')
    ? 'CMS'
    : location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings')
      ? 'CMS'
      : 'Dashboard'

  return (
    <div className="app-frame">
      <header className="mobile-header">
        <BrandMark />
        <button className="icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-top">
          <BrandMark />
          <button className="sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <Link className="sidebar-new" to="/contacts?new=1" onClick={() => setMenuOpen(false)}>
          <span aria-hidden="true">+</span>
          <span>New Contact</span>
        </Link>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="sidebar-caption">Candidate Portal</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          >
            <UserRound size={18} />
            <span>Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <button className="sidebar-link sidebar-link--button sidebar-link--danger" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button topbar-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <h1>{title}</h1>
          </div>
          <form className="portal-search" role="search">
            <Search size={18} />
            <input type="search" placeholder="Search across portal..." aria-label="Search across portal" />
          </form>
          <div className="topbar-actions">
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="icon-button icon-button--flat notification-button"
                type="button"
                aria-label="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={19} />
                <span />
              </button>
              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h3>Notifications</h3>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="notification-dropdown-content">
                    <div className="notification-item">
                      <div className="notification-item-dot" />
                      <div className="notification-item-text">
                        <strong>Welcome to CMS</strong>
                        <p>Your contact database is ready and connected successfully.</p>
                        <small>Just now</small>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-item-dot" />
                      <div className="notification-item-text">
                        <strong>Security Update</strong>
                        <p>Database connection has been secured with credentials.</p>
                        <small>10 mins ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="icon-button icon-button--flat" type="button" aria-label="Help">
              <CircleHelp size={19} />
            </button>
            <Link to="/profile" className="topbar-user">
              <span className="avatar avatar--small">{initials(session?.firstName, session?.lastName)}</span>
              <span>
                <strong>{session?.firstName || 'CMS user'}</strong>
                <small>{session?.email || 'Signed in'}</small>
              </span>
            </Link>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
