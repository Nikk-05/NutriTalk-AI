const variants = {
  primary: 'primary-gradient text-on-primary shadow-primary-sm hover:-translate-y-0.5 hover:shadow-primary active:scale-95',
  secondary: 'bg-surface-container-highest text-primary hover:bg-surface-container-high active:scale-95',
  tertiary: 'text-secondary hover:text-primary active:scale-95',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary active:scale-95',
  ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:scale-95',
}

export default function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-full
        font-headline font-bold text-sm
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
