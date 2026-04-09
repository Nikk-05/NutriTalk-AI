import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { fetchAPI } from '../utils/apiCalls.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async(e) => {
    try{
      e.preventDefault()
      setLoading(true)
      const response = await fetchAPI("/auth/login","POST", form)
      if(response.status === 'success'){
        sessionStorage.setItem('token', response.data.token)
        setTimeout(() => { navigate('/dashboard') }, 1000)
      }
    }catch(error){
      console.log(error)
    }finally{
      setLoading(false)
    }
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="hello@nutritalk.ai"
                  className="w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body"
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
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Your password"
                  className="w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body"
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
