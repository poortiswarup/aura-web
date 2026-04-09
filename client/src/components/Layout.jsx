import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from './icons'
import { useState, useEffect } from 'react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  Ic: Icon.Dashboard  },
  { to: '/news',      label: 'News Feed',  Ic: Icon.NewsFeed   },
  { to: '/companies', label: 'Companies',  Ic: Icon.Companies  },
  { to: '/sentiment', label: 'Sentiment',  Ic: Icon.Sentiment  },
  { to: '/market',    label: 'Market',     Ic: Icon.Market     },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('aura-theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('aura-theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo-mark"><Icon.Logo /></div>
          <div className="logo-text">AURA</div>
        </div>

        <div className="nav-section-label">Navigation</div>

        {NAV.map(({ to, label, Ic }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><Ic /></span>
            {label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          {/* Theme toggle */}
          <div className="theme-toggle">
            <span className="theme-toggle-label">{dark ? 'Dark mode' : 'Light mode'}</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={dark}
                onChange={e => setDark(e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>

          {user && (
            <div className="user-card">
              {user.avatar
                ? <img src={user.avatar} className="user-avatar" alt={user.name} />
                : <div className="user-avatar">{initials}</div>
              }
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">Analyst</div>
              </div>
            </div>
          )}
          <button className="sign-out-btn" onClick={handleLogout}>
            <Icon.SignOut />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
