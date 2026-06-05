import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../store/slices/authSlice'

// Logged-in app routes — Pro replaced with Profile so the avatar dropdown
// owns upgrade/logout instead of duplicating into the bottom nav.
const APP_BOTTOM_LINKS = [
  { to: '/dashboard', icon: 'grid_view',   label: 'Home'    },
  { to: '/chat',      icon: 'forum',       label: 'Chat'    },
  { to: '/diet-plan', icon: 'description', label: 'Plan'    },
  { to: '/profile',   icon: 'person',      label: 'Profile' },
]

// Logged-out marketing items — anchors that scroll into landing sections.
const MARKETING_BOTTOM_LINKS = [
  { to: '/#features',     icon: 'apps',        label: 'Features' },
  { to: '/#how-it-works', icon: 'route',       label: 'How'      },
  { to: '/#pricing',      icon: 'sell',        label: 'Pricing'  },
  { to: '/#faq',          icon: 'help',        label: 'FAQ'      },
]

// BottomNav — mobile/tablet primary nav. Swaps contents based on auth:
//   • logged-in  → app routes (Home / Chat / Plan / Profile)
//   • logged-out → marketing anchors (Features / How / Pricing / FAQ)
// Hamburger drawer has been removed entirely — this is the only mobile nav.
export default function BottomNav() {
  const loggedIn = useSelector(selectIsLoggedIn)
  const location = useLocation()
  const navigate = useNavigate()

  const links = loggedIn ? APP_BOTTOM_LINKS : MARKETING_BOTTOM_LINKS

  // Hash anchors need the same smooth-scroll behavior as the desktop nav.
  // If we're already on the landing page, scroll without a re-navigation;
  // otherwise navigate to /#anchor and let Navbar's hash effect handle it.
  const handleClick = (to) => (e) => {
    if (!to.includes('#')) return
    e.preventDefault()
    const hash = to.split('#')[1]
    const isLanding = location.pathname === '/' || location.pathname === ''
    if (isLanding) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', '/#' + hash)
    } else {
      navigate('/#' + hash)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-2xl border-t border-surface-container-high/40 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] rounded-t-[2.5rem]">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleClick(to)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200 ${
                isActive && !to.includes('#')
                  ? 'bg-primary/10 text-primary scale-110'
                  : 'text-outline hover:text-primary'
              }`
            }
          >
            {({ isActive }) => {
              const active = isActive && !to.includes('#')
              return (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {icon}
                  </span>
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">
                    {label}
                  </span>
                </>
              )
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
