import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logWeight } from '../store/slices/dashboardSlice'
import { selectUser } from '../store/slices/authSlice'
import { MOTIVATIONAL_QUOTES, RANGES } from '../constants/appConstants'

// localStorage key namespace — separate per user so multiple accounts on the
// same browser don't share gating state.
const STORAGE_PREFIX = 'nutritalk:lastCheckIn:'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function pickQuote() {
  // Stable per calendar day so the same quote stays during the session.
  const seed = todayStr().split('-').join('')
  const idx = Number(seed) % MOTIVATIONAL_QUOTES.length
  return MOTIVATIONAL_QUOTES[idx]
}

// DailyCheckInModal — appears once per calendar day per user. Shows a
// motivational quote and prompts the user to log today's weight. Three exits:
//   • Save        → POST /dashboard/weight then close + set localStorage flag
//   • Skip today  → close + set flag (won't reappear today)
//   • Remind later → close without setting flag (reappears next visit)
//
// Mount once near the top of DashboardPage. The modal handles its own
// open/close state via the localStorage gate.
export default function DailyCheckInModal() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const quote = useMemo(pickQuote, [])

  const [open, setOpen] = useState(false)
  const [kg, setKg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Decide whether to show the modal on mount. Reads the per-user localStorage
  // gate; only opens if it doesn't match today's date.
  useEffect(() => {
    if (!user?._id) return
    const key = STORAGE_PREFIX + user._id
    const last = localStorage.getItem(key)
    if (last !== todayStr()) {
      // Seed input with current weight if known
      if (user?.metrics?.currentWeightKg) setKg(String(user.metrics.currentWeightKg))
      setOpen(true)
    }
  }, [user?._id, user?.metrics?.currentWeightKg])

  const markShownToday = () => {
    if (!user?._id) return
    localStorage.setItem(STORAGE_PREFIX + user._id, todayStr())
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const value = parseFloat(kg)
    if (Number.isNaN(value) || value < RANGES.weight.min || value > RANGES.weight.max) {
      setError(`Enter a weight between ${RANGES.weight.min} and ${RANGES.weight.max} kg`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await dispatch(logWeight(value)).unwrap()
      markShownToday()
      setOpen(false)
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not save your weight. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    markShownToday()
    setOpen(false)
  }

  const handleRemindLater = () => {
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-scrim/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-title"
    >
      <div className="bg-surface-container-lowest rounded-3xl shadow-ambient max-w-md w-full overflow-hidden">
        {/* Decorative header band */}
        <div className="relative primary-gradient px-8 pt-8 pb-12 text-on-primary overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -left-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative">
            <p className="text-[10px] font-label font-bold uppercase tracking-widest opacity-80 mb-2">
              Daily Check-in
            </p>
            <h2 id="checkin-title" className="text-2xl font-headline font-black leading-tight">
              {user?.name ? `Hey ${user.name.split(' ')[0]},` : 'Welcome back,'}
            </h2>
            <p className="text-sm opacity-90 mt-1">Let's start your day strong.</p>
          </div>
        </div>

        {/* Quote */}
        <div className="px-8 mt-2 mb-2">
          <div className="bg-surface-container rounded-2xl px-5 py-4 shadow-ambient-sm border-l-4 border-secondary">
            <p className="text-on-surface italic leading-relaxed">"{quote.text}"</p>
            <p className="text-[11px] font-label font-bold uppercase tracking-widest text-outline mt-2">
              — {quote.author}
            </p>
          </div>
        </div>

        {/* Weight form */}
        <form onSubmit={handleSave} className="px-8 pt-6 pb-8">
          <label htmlFor="checkin-weight" className="block text-sm font-headline font-bold text-on-surface mb-2">
            What's your weight today?
          </label>
          <div className="relative">
            <input
              id="checkin-weight"
              type="number"
              inputMode="decimal"
              step={RANGES.weight.step}
              min={RANGES.weight.min}
              max={RANGES.weight.max}
              value={kg}
              onChange={(e) => { setKg(e.target.value); setError(null) }}
              placeholder="e.g. 72.4"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body text-on-surface text-lg transition-all"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-label font-bold text-sm">
              kg
            </span>
          </div>
          {error && (
            <p className="text-xs text-error mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-full primary-gradient text-on-primary font-headline font-bold shadow-primary-sm hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? 'Saving…' : 'Save my weight'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRemindLater}
                className="flex-1 px-4 py-2 rounded-full text-sm font-headline font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Remind me later
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-2 rounded-full text-sm font-headline font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Skip for today
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
