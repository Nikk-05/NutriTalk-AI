import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Button from '../components/Button'
import { selectIsLoggedIn } from '../store/slices/authSlice'

// NotFoundPage — catch-all for unknown routes. Renders inside AppLayout so it
// inherits the Navbar; the route is /* in App.jsx. Provides two clear exits:
// "Back to Home" always, plus "Go to Dashboard" for signed-in users.
export default function NotFoundPage() {
  const loggedIn = useSelector(selectIsLoggedIn)

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center relative">
        {/* Floating blobs for visual interest */}
        <div className="floating-blob absolute -top-12 -left-12 w-56 h-56 bg-primary-fixed-dim/20 rounded-full -z-10" />
        <div className="floating-blob absolute -bottom-12 -right-12 w-72 h-72 bg-secondary-fixed/20 rounded-full -z-10" />

        {/* Glyph */}
        <div className="inline-flex w-24 h-24 rounded-3xl primary-gradient items-center justify-center shadow-primary mb-8">
          <span className="material-symbols-outlined text-on-primary text-5xl">no_food</span>
        </div>

        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-3">
          Error 404
        </p>
        <h1 className="text-5xl md:text-6xl font-headline font-black text-on-surface mb-4 leading-tight">
          This page isn&apos;t on the menu.
        </h1>
        <p className="text-on-surface-variant text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The page you were looking for doesn&apos;t exist, has moved, or never made it past quality control.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" className="px-8 py-3 w-full sm:w-auto">
              <span className="material-symbols-outlined text-sm">home</span>
              Back to Home
            </Button>
          </Link>
          {loggedIn && (
            <Link to="/dashboard">
              <Button variant="secondary" className="px-8 py-3 w-full sm:w-auto">
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
