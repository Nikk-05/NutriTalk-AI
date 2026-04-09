import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Get started on your wellness journey with core AI features.',
    features: ['5 AI meal plan generations/month', 'Basic calorie tracking', 'Recipe suggestions', 'Community access'],
    cta: 'Get Started Free',
    ctaVariant: 'secondary',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'Unlock the full power of your AI nutritionist.',
    features: ['Unlimited AI meal plans', 'Advanced macro tracking', 'Wearable integrations', 'Priority AI responses', 'Personalized weekly reports', 'Custom dietary profiles'],
    cta: 'Start Pro Trial',
    ctaVariant: 'primary',
    highlight: true,
  },
  {
    name: 'Elite',
    price: '$29',
    period: '/month',
    description: 'For serious health optimizers and athletes.',
    features: ['Everything in Pro', '1-on-1 dietitian consultation/month', 'Lab result analysis', 'Supplement recommendations', 'Advanced biometric tracking', 'White-glove onboarding'],
    cta: 'Go Elite',
    ctaVariant: 'outline',
    highlight: false,
  },
]

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time. You\'ll retain access until the end of your billing period.' },
  { q: 'Is my health data private?', a: 'Absolutely. We use end-to-end encryption and never sell your personal health data to third parties.' },
  { q: 'What wearables do you support?', a: 'We currently integrate with Apple Watch, Fitbit, Garmin, Oura Ring, and most WHOOP devices.' },
  { q: 'How accurate is the AI nutrition advice?', a: 'Our AI is trained on peer-reviewed nutritional science, but always consult a licensed dietitian for medical decisions.' },
]

export default function UpgradePage() {
  const [openFaq, setOpenFaq] = useState(null)
  return (
    <div className="pb-32 md:pb-16 overflow-x-hidden">
      {/* Hero */}
      <div className="relative py-24 px-6 text-center overflow-hidden">
        <div className="floating-blob absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-fixed-dim/20 rounded-full -z-10" />
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container/20 rounded-full mb-6">
            <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
            <span className="text-[0.75rem] font-label uppercase tracking-widest font-bold text-secondary">Upgrade Your Health</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-6 tracking-tight">
            Choose Your <span className="text-primary">Wellness Plan</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            Start free, upgrade when ready. Every plan includes AI-powered nutrition intelligence.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map(({ name, price, period, description, features, cta, ctaVariant, highlight }) => (
            <div
              key={name}
              className={`rounded-lg p-8 transition-all duration-300 hover:shadow-ambient ${
                highlight
                  ? 'primary-gradient text-on-primary shadow-primary md:-translate-y-4 relative'
                  : 'bg-surface-container-lowest shadow-ambient-sm'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h2 className={`font-headline font-black text-2xl mb-2 ${highlight ? 'text-on-primary' : 'text-on-surface'}`}>{name}</h2>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-5xl font-black font-headline ${highlight ? 'text-on-primary' : 'text-primary'}`}>{price}</span>
                  {period && <span className={`text-sm font-bold ${highlight ? 'text-on-primary/70' : 'text-outline'}`}>{period}</span>}
                </div>
                <p className={`text-sm leading-relaxed ${highlight ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>{description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-sm mt-0.5 flex-shrink-0 ${highlight ? 'text-primary-fixed' : 'text-primary'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className={`text-sm ${highlight ? 'text-on-primary/90' : 'text-on-surface-variant'}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block">
                <button className={`w-full py-4 rounded-full font-headline font-bold text-sm transition-all active:scale-95 ${
                  highlight
                    ? 'bg-on-primary text-primary hover:bg-primary-fixed'
                    : ctaVariant === 'outline'
                    ? 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary'
                    : 'bg-surface-container-highest text-primary hover:bg-surface-container-high'
                }`}>
                  {cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Highlights */}
      <div className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-headline font-bold text-center text-on-surface mb-12">
          Everything you need to transform your health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: 'psychology', title: 'Smart AI', desc: 'Powered by GPT-4o nutrition models trained on 10M+ data points.' },
            { icon: 'watch', title: 'Wearable Sync', desc: 'Connect Apple Watch, Fitbit, Oura and Garmin for real-time insights.' },
            { icon: 'restaurant_menu', title: '50k+ Recipes', desc: 'Validated by certified dietitians and international chefs.' },
            { icon: 'person', title: 'Expert Access', desc: 'Get live 1-on-1 consultations with registered dietitians on Elite.' },
            { icon: 'lock', title: 'Privacy First', desc: 'End-to-end encrypted health data. We never sell your information.' },
            { icon: 'phone_iphone', title: 'Cross Platform', desc: 'Seamless experience across iOS, Android, and web.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-surface-container-lowest rounded-lg p-6 shadow-ambient-sm hover:shadow-ambient transition-all">
              <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center mb-4 shadow-primary-sm">
                <span className="material-symbols-outlined text-on-primary">{icon}</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface mb-2">{title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="py-12 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-headline font-bold text-center text-on-surface mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div key={q} className="bg-surface-container-lowest rounded-lg shadow-ambient-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left font-headline font-bold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span>{q}</span>
                <span className={`material-symbols-outlined text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-on-surface-variant text-sm leading-relaxed">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

