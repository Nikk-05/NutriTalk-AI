import { HOW_IT_WORKS_STEPS } from '../../constants/appConstants'

// 3-step explainer linked from the marketing nav and the bento "See How It Works"
// CTA. Each step is data-driven from HOW_IT_WORKS_STEPS so copy lives in one place.
export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="text-[0.75rem] font-label font-bold uppercase tracking-widest text-primary mb-3">
            How it works
          </p>
          <h2 className="text-[1.75rem] md:text-4xl font-headline font-bold text-on-surface mb-4">
            From signup to your first plan in 2 minutes
          </h2>
          <div className="w-20 h-1.5 primary-gradient rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle connector line behind the steps (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-fixed-dim via-primary to-secondary-fixed -z-10" />

          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-sm hover:shadow-ambient transition-all duration-500 text-center relative"
            >
              <div className="w-16 h-16 mx-auto mb-6 primary-gradient rounded-2xl flex items-center justify-center shadow-primary-sm">
                <span className="material-symbols-outlined text-on-primary text-3xl">{step.icon}</span>
              </div>
              <span className="absolute top-4 right-5 text-[3rem] font-headline font-black text-primary-fixed-dim/30 leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-3">{step.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
