import { useSelector } from 'react-redux'
import HeroSection from '../components/sections/HeroSection'
import FeaturesBento from '../components/sections/FeaturesBento'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import PricingPreview from '../components/sections/PricingPreview'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import FAQSection from '../components/sections/FAQSection'
import CTABanner from '../components/sections/CTABanner'
import { selectIsLoggedIn } from '../store/slices/authSlice'

// LandingPage is now a thin composition of section components. Each section
// lives in components/sections/ so it can be reordered or reused without
// editing this file. CTA destinations branch on `loggedIn` so the marketing
// page stays useful as a "home" for signed-in users.
export default function LandingPage() {
  const loggedIn = useSelector(selectIsLoggedIn)

  // CTA destinations — visitors funnel into auth, signed-in users go into the app.
  const primaryPath   = loggedIn ? '/dashboard' : '/signup'
  const secondaryPath = loggedIn ? '/chat'      : '/login'
  const planPath      = loggedIn ? '/diet-plan' : '/signup'
  const ctaPath       = loggedIn ? '/dashboard' : '/signup'

  return (
    <div className="overflow-x-hidden">
      <HeroSection
        loggedIn={loggedIn}
        primaryPath={primaryPath}
        secondaryPath={secondaryPath}
        primaryLabel={loggedIn ? 'Go to Dashboard' : 'Start Your Plan'}
        secondaryLabel={loggedIn ? 'Chat with AI' : 'Sign In'}
      />
      <FeaturesBento loggedIn={loggedIn} planPath={planPath} />
      <HowItWorksSection />
      <PricingPreview loggedIn={loggedIn} />
      <TestimonialsSection />
      <FAQSection />
      <CTABanner to={ctaPath} label={loggedIn ? 'Go to Dashboard' : 'Get Started Free'} />
    </div>
  )
}
