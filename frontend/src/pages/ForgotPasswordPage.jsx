import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { fetchAPI } from '../utils/apiCalls.js'

// ForgotPasswordPage — collects an email, posts to /auth/forgot-password,
// then shows the same "if that email exists…" success message regardless of
// outcome (matches the backend's anti-enumeration response). Email delivery
// itself is a backend TODO — see auth.controller.js forgotPassword.
export default function ForgotPasswordPage() {
  const [email,      setEmail]      = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [errorMsg,   setErrorMsg]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetchAPI('/auth/forgot-password', 'POST', { email })
      if (res.status === 'success') {
        setSubmitted(true)
      } else {
        setErrorMsg(res.error?.message || 'Something went wrong. Please try again.')
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

        {submitted ? (
          // Success state — generic message regardless of whether the email
          // existed, to avoid leaking which addresses have accounts.
          <div className="text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl primary-gradient items-center justify-center shadow-primary mb-6">
              <span className="material-symbols-outlined text-on-primary text-3xl">mark_email_read</span>
            </div>
            <h1 className="text-3xl font-headline font-black text-on-surface mb-3">Check your inbox</h1>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              If an account exists for <span className="font-bold text-on-surface">{email}</span>, you&apos;ll receive a password reset link in the next few minutes.
            </p>
            <p className="text-xs text-outline mb-8">
              Didn&apos;t receive it? Check your spam folder, or try again with a different email.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full py-4">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-headline font-black text-on-surface mb-2">
              Forgot password?
            </h1>
            <p className="text-on-surface-variant mb-8">
              Enter the email tied to your account and we&apos;ll send you a link to reset your password.
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
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setErrorMsg(null); setEmail(e.target.value) }}
                    placeholder="hello@nutritalk.ai"
                    className={`w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border focus:outline-none focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body ${
                      errorMsg ? 'border-error/40 focus:border-error/60' : 'border-transparent focus:border-primary/30'
                    }`}
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-4 text-base" disabled={loading}>
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Sending...</>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <p className="text-center mt-8 text-sm text-on-surface-variant">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
