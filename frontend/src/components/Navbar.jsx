import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { auth, fetchAPI } from '../utils/apiCalls.js'
import { clearCredentials, selectIsLoggedIn, selectUser } from '../store/slices/authSlice'
import { NAV_LINKS } from '../constants/appConstants'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Read auth state from Redux — updates automatically when login/logout actions are dispatched
  const loggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)

  // Close profile dropdown on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = async () => {
    try { await fetchAPI('/auth/logout', 'POST', {}) } catch { /* ignore */ }
    // Clear sessionStorage and wipe Redux auth state
    auth.logout()
    dispatch(clearCredentials())
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/login')
  }

  const initials = (user?.name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="glass-nav max-w-7xl mx-auto flex items-center justify-between px-6 py-4 shadow-ambient-sm">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black font-headline tracking-tight text-primary">
          NutriTalk AI
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-headline font-bold transition-colors ${
                  isActive
                    ? 'text-primary border-b-2 border-primary pb-0.5'
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <button className="p-2 hover:bg-surface-container rounded-full transition-all duration-200 active:scale-95">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-10 h-10 primary-gradient rounded-full flex items-center justify-center font-headline font-bold text-on-primary text-sm shadow-primary-sm hover:-translate-y-0.5 active:scale-95 transition-all"
                  aria-label="Profile menu"
                >
                  {initials}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-ambient overflow-hidden">
                    <div className="px-4 py-3 border-b border-outline-variant/20">
                      <p className="font-headline font-bold text-on-surface truncate">{user?.name || 'NutriTalk User'}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user?.email || ''}</p>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/profile') }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">manage_accounts</span>
                      <span className="font-body text-sm text-on-surface">Update Profile</span>
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/upgrade') }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">star</span>
                      <span className="font-body text-sm text-on-surface">Upgrade to Pro</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-error/10 border-t border-outline-variant/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-error text-sm">logout</span>
                      <span className="font-body text-sm text-error">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="p-2 hover:bg-surface-container rounded-full transition-all duration-200 active:scale-95"
                aria-label="Sign in"
              >
                <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="hidden lg:block primary-gradient text-on-primary px-6 py-2 rounded-full font-headline font-bold shadow-primary-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 hover:bg-surface-container rounded-full transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-on-surface">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden glass-nav border-t border-outline-variant/20 px-6 pb-6 pt-2 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `font-headline font-bold py-2 transition-colors ${
                    isActive ? 'text-primary' : 'text-on-surface-variant'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="font-headline font-bold py-2 text-on-surface-variant"
                >
                  Update Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-headline font-bold py-2 text-error text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="primary-gradient text-on-primary px-6 py-3 rounded-full font-headline font-bold text-center shadow-primary-sm"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
