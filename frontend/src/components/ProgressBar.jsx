const colorMap = {
  primary: 'bg-primary',
  secondary: 'bg-secondary-container',
  tertiary: 'bg-tertiary',
}

export default function ProgressBar({ value = 0, max = 100, color = 'primary', label, sublabel }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1.5">
      {(label || sublabel) && (
        <div className="flex justify-between text-sm font-bold">
          {label && <span className="text-on-surface">{label}</span>}
          {sublabel && <span className={`text-${color === 'secondary' ? 'secondary' : color === 'tertiary' ? 'tertiary' : 'primary'}`}>{sublabel}</span>}
        </div>
      )}
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorMap[color] || colorMap.primary}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
