export default function ProgressRing({ value = 0, max = 100, size = 192, stroke = 12, label, sublabel }) {
  const r = (size / 2) - stroke
  const circumference = 2 * Math.PI * r
  const pct = Math.min(1, value / max)
  const offset = circumference * (1 - pct)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx} cy={cy} r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-surface-container-high"
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="transparent"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006b5f" />
            <stop offset="100%" stopColor="#00a896" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        {label && <span className="text-3xl font-black font-headline text-on-surface block">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase font-bold tracking-tighter text-outline block mt-0.5">{sublabel}</span>}
      </div>
    </div>
  )
}
