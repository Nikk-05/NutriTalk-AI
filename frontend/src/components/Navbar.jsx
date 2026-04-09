import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat', label: 'AI Chat' },
  { to: '/diet-plan', label: 'Diet Plan' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="glass-nav max-w-7xl mx-auto flex items-center justify-between px-6 py-4 shadow-ambient-sm">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black font-headline tracking-tight text-primary">
          NutriTalk AI
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
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
          <button className="p-2 hover:bg-surface-container rounded-full transition-all duration-200 active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-surface-container rounded-full transition-all duration-200 active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="hidden lg:block primary-gradient text-on-primary px-6 py-2 rounded-full font-headline font-bold shadow-primary-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            Get Started
          </button>

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
            {navLinks.map(({ to, label }) => (
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
            <Link
              to="/upgrade"
              onClick={() => setMenuOpen(false)}
              className="primary-gradient text-on-primary px-6 py-3 rounded-full font-headline font-bold text-center shadow-primary-sm"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
