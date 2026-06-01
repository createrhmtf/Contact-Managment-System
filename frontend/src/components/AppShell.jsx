import { ContactRound, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { initials } from '../lib/format'
import { BrandMark } from './BrandMark'

const navItems = [
  { to: '/contacts', label: 'Contacts', icon: ContactRound },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="sidebar-caption">Workspace</p>
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
          <div className="sidebar-profile">
            <span className="avatar avatar--small">{initials(session?.firstName, '')}</span>
            <span>
              <strong>{session?.firstName || 'Nexa user'}</strong>
              <small>{session?.email}</small>
            </span>
          </div>
          <button className="sidebar-link sidebar-link--button" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
