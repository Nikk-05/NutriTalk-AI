import { Link } from 'react-router-dom'

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'How it Works', to: '/#how-it-works' },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '#' },
      { label: 'Blog', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Press', to: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Cookies', to: '#' },
    ],
  },
]

const socials = [
  { icon: 'alternate_email', href: '#' },
  { icon: 'public', href: '#' },
  { icon: 'photo_camera', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 px-6 pt-16 pb-8 mb-20 md:mb-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand block */}
          <div className="col-span-2">
            <Link to="/" className="text-2xl font-black font-headline tracking-tight text-primary">
              NutriTalk AI
            </Link>
            <p className="mt-4 text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Your personal AI nutritionist. Smarter meal plans, real-time tracking, and answers that actually fit you.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant flex items-center justify-center transition-colors"
                  aria-label="social link"
                >
                  <span className="material-symbols-outlined text-base">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {linkGroups.map(group => (
            <div key={group.title}>
              <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                {group.title}
              </p>
              <ul className="space-y-3">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-body text-on-surface hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-outline-variant/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} NutriTalk AI. All rights reserved.
          </p>
          <p className="text-xs text-on-surface-variant">
            Built with Gemini 2.5 · Made for humans who eat.
          </p>
        </div>
      </div>
    </footer>
  )
}
