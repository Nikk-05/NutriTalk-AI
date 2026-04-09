const colors = {
  teal: 'bg-primary-fixed/30 text-primary border-primary/10',
  orange: 'bg-secondary-container/30 text-secondary border-secondary/10',
  green: 'bg-tertiary-fixed/30 text-tertiary border-tertiary/10',
  muted: 'bg-surface-container-high text-on-surface-variant border-transparent',
}

export default function Badge({ children, color = 'muted', className = '' }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest border ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
