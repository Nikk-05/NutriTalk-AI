import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Privacy', to: '#' },
  { label: 'Terms', to: '#' },
  { label: 'Support', to: '#' },
  { label: 'Twitter', to: '#' },
]

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant/20 mb-20 md:mb-0">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline font-bold text-primary text-xl">NutriTalk AI</span>
          <p className="font-body text-sm text-outline mt-2 text-center md:text-left">
            © 2024 NutriTalk AI. Your Digital Health Curator.
          </p>
        </div>
        <div className="flex gap-8">
          {footerLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-outline hover:text-primary transition-colors font-body text-sm underline decoration-primary/30 underline-offset-4"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
