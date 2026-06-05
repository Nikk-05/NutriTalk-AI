import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Button from '../components/Button'
import { fetchAPI, auth } from '../utils/apiCalls.js'
import { setCredentials } from '../store/slices/authSlice'
import { clearDashboard } from '../store/slices/dashboardSlice'
import { clearDietPlan } from '../store/slices/dietPlanSlice'

// Maps backend error codes to friendly inline messages. Anything not listed
// falls back to the server's `message` so generic errors still surface.
const LOGIN_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'That email and password combination doesn\'t match our records. Please try again.',
  USER_NOT_FOUND:      'No account found with this email. Want to sign up instead?',
  EMAIL_NOT_VERIFIED:  'Please verify your email before signing in.',
  RATE_LIMITED:        'Too many attempts. Please wait a minute before trying again.',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  // Inline error banner shown at the top of the form. Cleared when the user
  // edits either field so stale errors don't linger after they correct input.
  const [errorMsg, setErrorMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await fetchAPI('/auth/login', 'POST', form)
      if (response.status === 'success') {
        // Persist token + user to sessionStorage (Axios interceptor reads from here)
        auth.setToken(response.data.accessToken)
        auth.setUser(response.data.user)
        // Wipe any stale per-user slices left over from a previous session
        // before the new user's data starts loading in.
        dispatch(clearDashboard())
        dispatch(clearDietPlan())
        // Store user data in Redux so all components can access it reactively
        dispatch(setCredentials({ user: response.data.user, token: response.data.accessToken }))
        setTimeout(() => { navigate('/dashboard') }, 1000)
        return
      }
      // Backend returned { status: 'error', error: { code, message, field? } }
      const code = response.error?.code
      const msg  = LOGIN_ERROR_MESSAGES[code] || response.error?.message || 'Something went wrong. Please try again.'
      setErrorMsg(msg)
    } catch {
      setErrorMsg('Network error — please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Clear stale errors as soon as the user starts fixing their input.
  const updateField = (key) => (e) => {
    setErrorMsg(null)
    setForm(p => ({ ...p, [key]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 relative primary-gradient items-center justify-center overflow-hidden">
        {/* Blobs */}
        <div className="floating-blob absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="floating-blob absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <span className="material-symbols-outlined text-white text-3xl">eco</span>
          </div>
          <h2 className="text-4xl font-headline font-black text-on-primary mb-6 leading-tight">
            Your AI Nutritionist<br />is waiting for you.
          </h2>
          <p className="text-on-primary/80 text-lg max-w-sm mx-auto leading-relaxed">
            Personalized meal plans, real-time calorie tracking, and AI health insights — all in one place.
          </p>
          {/* Floating stat cards */}
          <div className="mt-12 flex flex-col gap-4 max-w-xs mx-auto">
            {[
              { icon: 'restaurant_menu', label: 'AI Plans Generated', val: '2.1M+' },
              { icon: 'people', label: 'Active Members', val: '12,400+' },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 text-left">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-sm">{icon}</span>
                </div>
                <div>
                  <p className="text-on-primary font-headline font-black text-xl leading-none">{val}</p>
                  <p className="text-on-primary/70 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center shadow-primary-sm">
              <span className="material-symbols-outlined text-on-primary text-sm">eco</span>
            </div>
            <span className="text-xl font-headline font-black text-primary">NutriTalk AI</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-headline font-black text-on-surface mb-2">
            Welcome back 👋
          </h1>
          <p className="text-on-surface-variant mb-8">
            Sign in to continue your wellness journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Inline error banner — shown when the backend returns an error
                envelope (bad credentials, rate limit, etc.) so the user sees
                what went wrong instead of a silent no-op. */}
            {errorMsg && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-error/10 border border-error/30 text-error"
              >
                <span className="material-symbols-outlined text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="text-sm font-body leading-snug flex-1">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  aria-label="Dismiss error"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="hello@nutritalk.ai"
                  className={`w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border focus:outline-none focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body ${
                    errorMsg ? 'border-error/40 focus:border-error/60' : 'border-transparent focus:border-primary/30'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder="Your password"
                  className={`w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border focus:outline-none focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body ${
                    errorMsg ? 'border-error/40 focus:border-error/60' : 'border-transparent focus:border-primary/30'
                  }`}
                />
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-xs text-primary font-bold hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-4 text-base" disabled={loading}>
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Signing in...</>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant/40" />
            <span className="text-xs text-outline font-bold uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-outline-variant/40" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'G', label: 'Google' },
              { icon: '⬛', label: 'Apple' },
            ].map(({ label }) => (
              <button
                key={label}
                className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-full font-headline font-bold text-sm text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shadow-ambient-sm"
              >
                <span className="material-symbols-outlined text-sm">{label === 'Google' ? 'language' : 'phone_iphone'}</span>
                {label}
              </button>
            ))}
          </div>

          <p className="text-center mt-8 text-sm text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
