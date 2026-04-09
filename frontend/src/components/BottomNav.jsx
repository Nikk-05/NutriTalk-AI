import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: 'grid_view', label: 'Home' },
  { to: '/chat',      icon: 'forum',     label: 'Chat' },
  { to: '/diet-plan', icon: 'description', label: 'Plan' },
  { to: '/upgrade',   icon: 'star',      label: 'Pro' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-2xl border-t border-surface-container-high/40 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] rounded-t-[2.5rem]">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary scale-110'
                  : 'text-outline hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
