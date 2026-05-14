import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Button from '../components/Button'
import { fetchAPI, auth } from '../utils/apiCalls.js'
import { setCredentials } from '../store/slices/authSlice'
import { GOALS, DIETS, GENDERS, ACTIVITY_LEVELS, DEFAULTS, RANGES } from '../constants/appConstants'

const steps = ['Your Info', 'Your Body', 'Your Goals', 'Your Diet']

export default function SignupPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age:             DEFAULTS.age,
    gender:          DEFAULTS.gender,
    heightCm:        DEFAULTS.heightCm,
    currentWeightKg: DEFAULTS.currentWeightKg,
    targetWeightKg:  DEFAULTS.targetWeightKg,
    activityLevel:   DEFAULTS.activityLevel,
    goal:            DEFAULTS.primaryGoal,
    calories:        DEFAULTS.dailyCalorieTarget,
    diet:            DEFAULTS.dietaryRestriction,
  })

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1)
    else {
      setLoading(true)
      handleSignup()
    }
  }

  async function handleSignup() {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        metrics: {
          heightCm: Number(form.heightCm),
          currentWeightKg: Number(form.currentWeightKg),
          targetWeightKg: Number(form.targetWeightKg),
          activityLevel: form.activityLevel,
        },
        preferences: {
          primaryGoal: form.goal,
          dailyCalorieTarget: Number(form.calories),
          dietaryRestriction: form.diet,
        },
      }
      const response = await fetchAPI('/auth/signup', 'POST', payload)
      if (response.status === 'success') {
        // Persist token + user to sessionStorage (Axios interceptor reads from here)
        auth.setToken(response.data.accessToken)
        auth.setUser(response.data.user)
        // Store user data in Redux so all components can access it reactively
        dispatch(setCredentials({ user: response.data.user, token: response.data.accessToken }))
        navigate('/dashboard')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative bg-surface-container-low items-center justify-center overflow-hidden">
        <div className="floating-blob absolute -top-20 right-0 w-72 h-72 bg-primary-fixed/20 rounded-full" />
        <div className="floating-blob absolute bottom-0 left-10 w-64 h-64 bg-secondary-fixed/20 rounded-full" />
        <div className="relative z-10 px-12 max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center shadow-primary-sm">
              <span className="material-symbols-outlined text-on-primary text-sm">eco</span>
            </div>
            <span className="text-xl font-headline font-black text-primary">NutriTalk AI</span>
          </Link>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-6 leading-tight">
            Your health transformation starts here.
          </h2>
          {/* Progress steps indicator */}
          <div className="space-y-4 mt-12">
            {steps.map((s, i) => (
              <div key={s} className={`flex items-center gap-4 transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline font-bold text-sm flex-shrink-0 transition-all ${i < step ? 'primary-gradient text-on-primary' : i === step ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                  }`}>
                  {i < step ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : i + 1}
                </div>
                <span className={`font-headline font-bold ${i === step ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — multi-step form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 primary-gradient rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-sm">eco</span>
            </div>
            <span className="text-lg font-headline font-black text-primary">NutriTalk AI</span>
          </Link>

          {/* Mobile step indicator */}
          <div className="lg:hidden flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'primary-gradient' : 'bg-surface-container-high'}`} />
            ))}
          </div>

          <div className="mb-8">
            <p className="text-sm font-label font-bold text-outline uppercase tracking-widest mb-2">
              Step {step + 1} of {steps.length}
            </p>
            <h1 className="text-3xl font-headline font-black text-on-surface">
              {step === 0 ? 'Create your account' :
               step === 1 ? 'Tell us about you' :
               step === 2 ? 'What is your goal?' :
                            'Dietary preferences'}
            </h1>
          </div>

          {/* Step 0 — Account info */}
          {step === 0 && (
            <div className="space-y-5">
              {[
                { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Johnson', icon: 'person' },
                { field: 'email', label: 'Email Address', type: 'email', placeholder: 'hello@nutritalk.ai', icon: 'mail' },
                { field: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', icon: 'lock' },
              ].map(({ field, label, type, placeholder, icon }) => (
                <div key={field}>
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">{label}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">{icon}</span>
                    <input
                      type={type}
                      required
                      value={form[field]}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest focus:shadow-ambient transition-all text-on-surface placeholder:text-outline/50 font-body"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 1 — Body metrics */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Age + Gender row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">Age</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">cake</span>
                    <input
                      type="number" min={RANGES.age.min} max={RANGES.age.max}
                      value={form.age}
                      onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                      className="w-full pl-11 pr-4 py-4 bg-surface-container-high rounded-full border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest transition-all text-on-surface font-body"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-4 py-4 bg-surface-container-high rounded-full border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest transition-all text-on-surface font-body"
                  >
                    {GENDERS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                  Height: <span className="text-primary">{form.heightCm} cm</span>
                </label>
                <input
                  type="range" min={RANGES.height.min} max={RANGES.height.max} step={RANGES.height.step}
                  value={form.heightCm}
                  onChange={e => setForm(p => ({ ...p, heightCm: +e.target.value }))}
                  className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Current weight */}
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                  Current Weight: <span className="text-primary">{form.currentWeightKg} kg</span>
                </label>
                <input
                  type="range" min={RANGES.weight.min} max={RANGES.weight.max} step={RANGES.weight.step}
                  value={form.currentWeightKg}
                  onChange={e => setForm(p => ({ ...p, currentWeightKg: +e.target.value }))}
                  className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Target weight */}
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                  Target Weight: <span className="text-primary">{form.targetWeightKg} kg</span>
                </label>
                <input
                  type="range" min={RANGES.weight.min} max={RANGES.weight.max} step={RANGES.weight.step}
                  value={form.targetWeightKg}
                  onChange={e => setForm(p => ({ ...p, targetWeightKg: +e.target.value }))}
                  className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Activity level */}
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">Activity Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_LEVELS.map(a => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, activityLevel: a.key }))}
                      className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${form.activityLevel === a.key
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30'
                        }`}
                    >
                      <p className={`font-headline font-bold text-sm ${form.activityLevel === a.key ? 'text-primary' : 'text-on-surface'}`}>{a.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Goals */}
          {step === 2 && (
            <div className="space-y-3">
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => setForm(p => ({ ...p, goal: g }))}
                  className={`w-full flex items-center gap-4 p-5 rounded-lg border-2 transition-all active:scale-[0.98] ${form.goal === g
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.goal === g ? 'border-primary bg-primary' : 'border-outline'
                    }`}>
                    {form.goal === g && <span className="w-2 h-2 bg-on-primary rounded-full" />}
                  </div>
                  <span className={`font-headline font-bold ${form.goal === g ? 'text-primary' : 'text-on-surface'}`}>{g}</span>
                </button>
              ))}
              <div className="mt-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
                  Daily Calorie Target: <span className="text-primary">{form.calories} kcal</span>
                </label>
                <input
                  type="range" min={RANGES.calories.min} max={RANGES.calories.max} step={RANGES.calories.step}
                  value={form.calories}
                  onChange={e => setForm(p => ({ ...p, calories: +e.target.value }))}
                  className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          )}

          {/* Step 3 — Diet */}
          {step === 3 && (
            <div className="space-y-3">
              {DIETS.map(d => (
                <button
                  key={d}
                  onClick={() => setForm(p => ({ ...p, diet: d }))}
                  className={`w-full flex items-center gap-4 p-5 rounded-lg border-2 transition-all active:scale-[0.98] ${form.diet === d
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.diet === d ? 'border-primary bg-primary' : 'border-outline'
                    }`}>
                    {form.diet === d && <span className="w-2 h-2 bg-on-primary rounded-full" />}
                  </div>
                  <span className={`font-headline font-bold ${form.diet === d ? 'text-primary' : 'text-on-surface'}`}>{d}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)} className="flex-1 py-4">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
              className={`py-4 ${step === 0 ? 'w-full' : 'flex-1'}`}
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Creating account...</>
              ) : step === steps.length - 1 ? (
                <><span className="material-symbols-outlined text-sm">auto_awesome</span> Create My Plan</>
              ) : (
                <>Continue <span className="material-symbols-outlined text-sm">arrow_forward</span></>
              )}
            </Button>
          </div>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
