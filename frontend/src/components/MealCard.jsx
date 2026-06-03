const borderColors = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  muted: 'border-surface-container-highest',
}

// MealCard — displays a single meal with a toggle button to mark it as eaten.
// Props:
//   id        — meal ID for dispatching the toggle action
//   meal      — meal name string (rendered in full; wraps over multiple lines)
//   time      — meal type label (e.g. "Breakfast")
//   calories  — kcal number
//   logged    — boolean: has the user eaten this meal?
//   color     — border accent: 'primary' | 'secondary' | 'muted'
//   onToggle  — callback(id, newLoggedValue) called when toggle button is clicked
//   toggling  — boolean: true while the PUT request is in flight (shows spinner)
export default function MealCard({
  id,
  meal,
  time,
  calories,
  logged = false,
  color = 'primary',
  onToggle,
  toggling = false,
}) {
  return (
    <div className={`bg-surface-container-lowest p-4 rounded-lg shadow-ambient-sm border-l-4 ${borderColors[color]} transition-opacity duration-300 ${!logged ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest text-${color === 'muted' ? 'outline' : color}`}>
            {time}
          </span>
          <h4 className="font-bold text-base text-on-surface leading-snug break-words mt-0.5">{meal}</h4>
          <p className="text-xs text-outline mt-1">
            {calories} kcal &bull; {logged ? 'Eaten' : 'Not eaten'}
          </p>
        </div>

        {/* Toggle button — clicking flips the logged state */}
        <button
          onClick={() => onToggle?.(id, !logged)}
          disabled={toggling}
          title={logged ? 'Mark as not eaten' : 'Mark as eaten'}
          className={`shrink-0 w-8 h-8 mt-1 rounded-full flex items-center justify-center transition-all duration-200 ${
            toggling
              ? 'opacity-50 cursor-not-allowed'
              : logged
              ? 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-90'
              : 'bg-surface-container-high text-outline hover:bg-surface-container hover:text-primary active:scale-90'
          }`}
        >
          {toggling ? (
            <span className="material-symbols-outlined text-sm animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>
              progress_activity
            </span>
          ) : logged ? (
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          ) : (
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              radio_button_unchecked
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
