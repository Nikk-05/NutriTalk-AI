import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { auth, fetchAPI } from '../utils/apiCalls.js'
import { clearCredentials, selectIsLoggedIn, selectUser } from '../store/slices/authSlice'
import { clearDashboard } from '../store/slices/dashboardSlice'
import { clearDietPlan } from '../store/slices/dietPlanSlice'
import { APP_NAV_LINKS, MARKETING_NAV_LINKS } from '../constants/appConstants'

// Smooth-scrolls to a hash anchor on the current page. If we're not on the
// landing page yet, navigate there first and the hash effect below handles
// the scroll once the page mounts.
function scrollToHash(hash) {
  const id = hash.replace(/^#/, '')
  const el = id ? document.getElementById(id) : null
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false)
  // Auto-hide on mobile when the user scrolls down — reappears on scroll-up.
  // Desktop ignores this state via the `md:translate-y-0` class on <header>.
  // Toggle once user crosses a small dead-zone (~80 px) to avoid flicker.
  const [hideOnScroll, setHideOnScroll] = useState(false)
  const lastScrollY = useRef(0)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Read auth state from Redux — updates automatically when login/logout actions are dispatched
  const loggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)

  // Nav links are chosen by route, not just auth. Visitors and signed-in users
  // both get the marketing nav while *on* the landing page so all sections
  // (Features, How it Works, Pricing, FAQ) stay reachable post-login. On any
  // app route, signed-in users get the app nav (Dashboard / Chat / Diet Plan).
  const onLanding = location.pathname === '/' || location.pathname === ''
  const showMarketingNav = !loggedIn || onLanding
  const navLinks = showMarketingNav ? MARKETING_NAV_LINKS : APP_NAV_LINKS

  // Close profile dropdown on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Auto-hide on scroll-down (mobile only — class gate on <header> ensures the
  // desktop nav stays put). Always visible above 80 px so the top of the page
  // never feels truncated. Small delta filters jitter from momentum scroll.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY.current
      if (y < 80) {
        setHideOnScroll(false)
      } else if (delta > 8) {
        setHideOnScroll(true)   // scrolled down → hide
      } else if (delta < -8) {
        setHideOnScroll(false)  // scrolled up → show
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // When the URL contains a hash (e.g. /#features) scroll to that section
  // once the page mounts. Handles deep-links into landing sections.
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace(/^#/, '')
      // Defer until after the route's content has painted.
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [location.pathname, location.hash])

  // Handles marketing nav clicks: if already on the landing page just scroll,
  // otherwise navigate to "/" with the hash so the effect above does the work.
  const handleMarketingNav = (to) => (e) => {
    const hash = to.split('#')[1]
    const isLanding = location.pathname === '/' || location.pathname === ''
    if (isLanding && hash) {
      e.preventDefault()
      scrollToHash('#' + hash)
      // Update the URL without triggering a navigation reload.
      window.history.replaceState(null, '', '/#' + hash)
    } else if (!isLanding && hash) {
      e.preventDefault()
      navigate('/#' + hash)
    }
  }

  const handleLogout = async () => {
    try { await fetchAPI('/auth/logout', 'POST', {}) } catch { /* ignore */ }
    // Clear sessionStorage and wipe all per-user Redux slices. Without this
    // the next user to sign in would briefly see the previous user's data.
    auth.logout()
    dispatch(clearCredentials())
    dispatch(clearDashboard())
    dispatch(clearDietPlan())
    setProfileOpen(false)
    navigate('/login')
  }

  const initials = (user?.name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out md:translate-y-0 ${
        hideOnScroll ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <nav className="glass-nav max-w-7xl mx-auto flex items-center justify-between px-6 py-4 shadow-ambient-sm">
        {/* Logo — always points at the marketing landing page so signed-in
            users can browse Features/Pricing/FAQ. The right-side actions give
            them a clear path back to the dashboard. */}
        <Link to="/" className="text-2xl font-black font-headline tracking-tight text-primary">
          NutriTalk AI
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={showMarketingNav ? handleMarketingNav(to) : undefined}
              className={({ isActive }) =>
                `font-headline font-bold transition-colors ${
                  isActive && !showMarketingNav
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
              {/* Quick "back to app" pill — only on the landing page so signed-in
                  users browsing marketing can jump straight to their dashboard. */}
              {onLanding && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden lg:flex items-center gap-2 primary-gradient text-on-primary px-5 py-2 rounded-full font-headline font-bold text-sm shadow-primary-sm hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base">dashboard</span>
                  Dashboard
                </button>
              )}

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

        </div>
      </nav>
    </header>
  )
}
