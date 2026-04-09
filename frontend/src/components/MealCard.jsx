const borderColors = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  muted: 'border-surface-container-highest',
}

export default function MealCard({ meal, time, calories, image, status = 'upcoming', color = 'primary' }) {
  const isLogged = status === 'logged'
  return (
    <div className={`bg-surface-container-lowest p-4 rounded-lg shadow-ambient-sm border-l-4 ${borderColors[color]} ${!isLogged ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 ${!isLogged ? 'grayscale' : ''}`}>
          <img src={image} alt={meal} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest text-${color === 'muted' ? 'outline' : color}`}>
            {time}
          </span>
          <h4 className="font-bold text-sm text-on-surface truncate">{meal}</h4>
          <p className="text-xs text-outline">
            {calories} kcal • {isLogged ? 'Logged' : 'Up Next'}
          </p>
        </div>
        {isLogged && (
          <span className="material-symbols-outlined text-primary text-sm shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        )}
      </div>
    </div>
  )
}
