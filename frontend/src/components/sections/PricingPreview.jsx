import { Link } from 'react-router-dom'
import Button from '../Button'
import { PRICING_TIERS } from '../../constants/appConstants'

// Pricing preview — logged-out visitors all CTAs go to /signup (the upgrade
// flow only makes sense post-auth). Signed-in users get bounced to /upgrade.
export default function PricingPreview({ loggedIn }) {
  const ctaTarget = loggedIn ? '/upgrade' : '/signup'

  return (
    <section id="pricing" className="py-24 px-6 bg-surface-container-low scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="text-[0.75rem] font-label font-bold uppercase tracking-widest text-primary mb-3">
            Pricing
          </p>
          <h2 className="text-[1.75rem] md:text-4xl font-headline font-bold text-on-surface mb-4">
            Simple plans that grow with you
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Start free, upgrade only when you need more. No hidden fees, cancel any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map(tier => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 flex flex-col transition-all duration-500 ${
                tier.highlighted
                  ? 'bg-primary text-on-primary shadow-primary md:-translate-y-4 relative'
                  : 'bg-surface-container-lowest shadow-ambient-sm hover:shadow-ambient'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest">
                  Most popular
                </span>
              )}
              <h3 className={`text-2xl font-headline font-bold mb-2 ${tier.highlighted ? 'text-on-primary' : 'text-on-surface'}`}>
                {tier.name}
              </h3>
              <p className={`text-sm mb-6 ${tier.highlighted ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                {tier.description}
              </p>
              <div className="mb-8">
                <span className={`text-5xl font-headline font-black ${tier.highlighted ? 'text-on-primary' : 'text-on-surface'}`}>
                  {tier.price}
                </span>
                <span className={`text-sm ml-1 ${tier.highlighted ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                  {tier.cadence}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span
                      className={`material-symbols-outlined text-base mt-0.5 ${tier.highlighted ? 'text-primary-fixed' : 'text-primary'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className={`text-sm ${tier.highlighted ? 'text-on-primary/90' : 'text-on-surface'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to={ctaTarget}>
                <Button
                  variant={tier.highlighted ? 'secondary' : 'primary'}
                  className="w-full py-3"
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
