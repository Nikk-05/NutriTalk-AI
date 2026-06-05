import { Link } from 'react-router-dom'
import Button from '../Button'

export default function CTABanner({ to, label }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-6">
          Start your health journey today
        </h2>
        <p className="text-lg text-on-surface-variant mb-10">
          Join thousands who've transformed their relationship with food using AI.
        </p>
        <Link to={to}>
          <Button variant="primary" className="px-12 py-4 text-lg shadow-primary">
            {label}
          </Button>
        </Link>
      </div>
    </section>
  )
}
