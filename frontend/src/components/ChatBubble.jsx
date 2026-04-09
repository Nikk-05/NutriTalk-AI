export function AiMessage({ children }) {
  return (
    <div className="flex gap-4 max-w-3xl">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mt-1">
        <span className="material-symbols-outlined text-sm">robot_2</span>
      </div>
      <div className="bg-surface-container-low px-6 py-4 rounded-2xl rounded-tl-none text-on-surface-variant leading-relaxed text-sm">
        {children}
      </div>
    </div>
  )
}

export function UserMessage({ children }) {
  return (
    <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary mt-1">
        <span className="material-symbols-outlined text-sm">person</span>
      </div>
      <div className="bg-primary text-on-primary px-6 py-4 rounded-2xl rounded-tr-none shadow-primary-sm leading-relaxed text-sm">
        {children}
      </div>
    </div>
  )
}

export function RecipeCard({ title, prep, image, protein, calories, fiber, description }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant/20 rounded-lg p-6 shadow-ambient-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <img src={image} alt={title} className="w-full md:w-40 h-40 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-headline font-bold text-lg text-primary leading-tight">{title}</h3>
            <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter whitespace-nowrap flex-shrink-0">
              {prep}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">{description}</p>
          <div className="flex gap-6">
            {[
              { label: 'Protein', val: `${protein}g`, color: 'text-primary' },
              { label: 'Calories', val: calories, color: 'text-on-surface' },
              { label: 'Fiber', val: `${fiber}g`, color: 'text-secondary' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] font-bold text-outline uppercase">{label}</p>
                <p className={`font-headline font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
