export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass-card rounded-lg shadow-ambient border border-white/20 ${className}`}>
      {children}
    </div>
  )
}
