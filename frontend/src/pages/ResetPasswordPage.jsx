import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { fetchAPI } from '../utils/apiCalls.js'

// ResetPasswordPage — reads ?token=… from the URL, accepts a new password,
// posts to /auth/reset-password. On success redirects to /login.
// Backend's resetPassword endpoint matches the token against the hashed-and-
// time-bounded passwordResetToken/passwordResetExpires fields on User.
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token') || '', [params])

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)
  const [errorMsg,        setErrorMsg]        = useState(null)
  const [done,            setDone]            = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!token) {
      setErrorMsg('Reset link is missing its token. Request a new one.')
      return
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetchAPI('/auth/reset-password', 'POST', { token, password })
      if (res.status === 'success') {
        setDone(true)
        setTimeout(() => navigate('/login'), 2500)
      } else {
        const code = res.error?.code
        const msg  = code === 'INVALID_RESET_TOKEN'
          ? 'This reset link has expired or already been used. Request a new one.'
          : res.error?.message || 'Could not reset your password. Try again.'
        setErrorMsg(msg)
      }
    } catch {
      setErrorMsg('Network error — please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
          <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center shadow-primary-sm">
            <span className="material-symbols-outlined text-on-primary text-sm">eco</span>
          </div>
          <span className="text-xl font-headline font-black text-primary">NutriTalk AI</span>
        </Link>

        {done ? (
          // Success — show confirmation then auto-redirect to /login.
          <div className="text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl primary-gradient items-center justify-center shadow-primary mb-6">
              <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </div>
            <h1 className="text-3xl font-headline font-black text-on-surface mb-3">Password reset</h1>
            <p className="text-on-surface-variant mb-8">
              You can now sign in with your new password. Redirecting you to the login page…
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full py-4">Go to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-headline font-black text-on-surface mb-2">
              Choose a new password
            </h1>
            <p className="text-on-surface-variant mb-8">
              Make it at least 8 characters with a mix of letters and numbers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMsg && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-error/10 border border-error/30 text-error"
                >
                  <span className="material-symbols-outlined text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <p className="text-sm font-body leading-snug flex-1">{errorMsg}</p>
                </div>
              )}

              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => { setErrorMsg(null); setPassword(e.target.value) }}
                    placeholder="At least 8 characters"
                    className={`w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border focus:outline-none focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body ${
                      errorMsg ? 'border-error/40 focus:border-error/60' : 'border-transparent focus:border-primary/30'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => { setErrorMsg(null); setConfirmPassword(e.target.value) }}
                    placeholder="Re-enter your password"
                    className={`w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border focus:outline-none focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body ${
                      errorMsg ? 'border-error/40 focus:border-error/60' : 'border-transparent focus:border-primary/30'
                    }`}
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-4 text-base" disabled={loading}>
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Resetting...</>
                ) : (
                  'Reset password'
                )}
              </Button>
            </form>

            <p className="text-center mt-8 text-sm text-on-surface-variant">
              Remembered your password?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
