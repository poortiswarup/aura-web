import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Icon } from './icons'

export default function PublicNav() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('aura-theme') === 'dark')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('aura-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <nav className={`pub-nav${scrolled ? ' pub-nav--scrolled' : ''}`}>
      <div className="pub-nav__inner">
        {/* Logo */}
        <Link to="/" className="pub-nav__logo">
          <div className="pub-nav__logo-mark"><Icon.Logo /></div>
          <span className="pub-nav__logo-text">AURA</span>
        </Link>

        {/* Links */}
        <div className="pub-nav__links">
          <NavLink to="/features" className={({ isActive }) => `pub-nav__link${isActive ? ' active' : ''}`}>Features</NavLink>
          <NavLink to="/about"    className={({ isActive }) => `pub-nav__link${isActive ? ' active' : ''}`}>About</NavLink>
          <NavLink to="/pricing"  className={({ isActive }) => `pub-nav__link${isActive ? ' active' : ''}`}>Pricing</NavLink>
        </div>

        {/* Actions */}
        <div className="pub-nav__actions">
          {/* Theme toggle */}
          <button className="pub-nav__theme-btn" onClick={() => setDark(d => !d)} title="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user
            ? <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
            : <>
                <Link to="/login" className="pub-nav__link">Sign in</Link>
                <Link to="/login" className="btn btn-primary btn-sm">Get started</Link>
              </>
          }
        </div>

        {/* Mobile hamburger */}
        <button className="pub-nav__burger" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="pub-nav__mobile">
          <NavLink to="/features" className="pub-nav__mobile-link" onClick={() => setMenuOpen(false)}>Features</NavLink>
          <NavLink to="/about"    className="pub-nav__mobile-link" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/pricing"  className="pub-nav__mobile-link" onClick={() => setMenuOpen(false)}>Pricing</NavLink>
          <NavLink to="/login"    className="pub-nav__mobile-link" onClick={() => setMenuOpen(false)}>Sign in</NavLink>
        </div>
      )}
    </nav>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M17 11.5A7 7 0 0 1 8.5 3a7 7 0 1 0 8.5 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
