import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import GlassCard from '../components/GlassCard'
import Stepper from '../components/Stepper'
import { auth, fetchAPI } from '../utils/apiCalls.js'
import { GOALS, DIETS, GENDERS, ACTIVITY_LEVELS, DEFAULTS, RANGES } from '../constants/appConstants'
import { calculateTDEE, getGoalCalories } from '../utils/tdee'

// Pulls the shape ProfilePage's `form` expects out of a server user object.
// Used by both loadProfile() and handleSave() so the local form stays in sync
// with whatever the server says — no stale values after a save.
function userToForm(u) {
  return {
    name:  u.name  || '',
    email: u.email || '',
    age:   u.age  ?? '',
    gender: u.gender || 'prefer_not_to_say',
    heightCm:           u.metrics?.heightCm          ?? DEFAULTS.heightCm,
    currentWeightKg:    u.metrics?.currentWeightKg   ?? DEFAULTS.currentWeightKg,
    targetWeightKg:     u.metrics?.targetWeightKg    ?? DEFAULTS.targetWeightKg,
    activityLevel:      u.metrics?.activityLevel     || DEFAULTS.activityLevel,
    primaryGoal:        u.preferences?.primaryGoal   || 'Maintenance',
    dailyCalorieTarget: u.preferences?.dailyCalorieTarget ?? DEFAULTS.dailyCalorieTarget,
    dietaryRestriction: u.preferences?.dietaryRestriction || DEFAULTS.dietaryRestriction,
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState('')
  const [form, setForm] = useState({
    name: '', email: '',
    age: '', gender: 'prefer_not_to_say',
    heightCm:           DEFAULTS.heightCm,
    currentWeightKg:    DEFAULTS.currentWeightKg,
    targetWeightKg:     DEFAULTS.targetWeightKg,
    activityLevel:      DEFAULTS.activityLevel,
    primaryGoal:        'Maintenance',
    dailyCalorieTarget: DEFAULTS.dailyCalorieTarget,
    dietaryRestriction: DEFAULTS.dietaryRestriction,
  })

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate('/login')
      return
    }
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res = await fetchAPI('/auth/me', 'GET')
      if (res?.status === 'success') {
        const u = res.data.user
        auth.setUser(u)
        setForm(userToForm(u))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSavedFlash('')
    try {
      const profilePayload = {
        name: form.name,
        metrics: {
          heightCm: Number(form.heightCm),
          currentWeightKg: Number(form.currentWeightKg),
          targetWeightKg: Number(form.targetWeightKg),
          activityLevel: form.activityLevel,
        },
      }
      const prefsPayload = {
        primaryGoal: form.primaryGoal,
        dietaryRestriction: form.dietaryRestriction,
        // dailyCalorieTarget is recomputed server-side from metrics + goal
      }

      const [profileRes, prefsRes] = await Promise.all([
        fetchAPI('/users', 'PUT', profilePayload),
        fetchAPI('/users/preferences', 'PUT', prefsPayload),
      ])

      // Both calls write to the same User document. The second response is
      // the authoritative latest snapshot — sync local form + session from it
      // so the recomputed dailyCalorieTarget shows up immediately without a
      // page reload. Fall back to whichever response succeeded.
      const latest = prefsRes?.status === 'success' ? prefsRes.data.user
                   : profileRes?.status === 'success' ? profileRes.data.user
                   : null
      if (latest) {
        auth.setUser(latest)
        setForm(userToForm(latest))
      }

      setSavedFlash('Profile updated successfully.')
      setTimeout(() => setSavedFlash(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    try { await fetchAPI('/auth/logout', 'POST', {}) } catch { /* ignore */ }
    auth.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-on-surface-variant">Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline font-black text-on-surface">Your Profile</h1>
          <p className="text-on-surface-variant mt-1">Update your details so we can personalize your plan.</p>
        </div>
      </div>

      {savedFlash && (
        <div className="mb-6 px-4 py-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary font-headline font-bold text-sm">
          {savedFlash}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account info */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-headline font-black text-on-surface mb-4">Account</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Email (read-only)">
              <input type="email" value={form.email} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
            </Field>
            <Field label="Age">
              <input
                type="number" min={RANGES.age.min} max={RANGES.age.max}
                value={form.age}
                onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                className={inputCls}
              >
                {GENDERS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </Field>
          </div>
        </GlassCard>

        {/* Body metrics */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-headline font-black text-on-surface mb-4">Body Metrics</h2>
          <div className="space-y-5">
            <Stepper
              label="Height" unit="cm"
              min={RANGES.height.min} max={RANGES.height.max} step={RANGES.height.step}
              value={form.heightCm}
              onChange={v => setForm(p => ({ ...p, heightCm: v }))}
            />
            <Stepper
              label="Current Weight" unit="kg"
              min={RANGES.weight.min} max={RANGES.weight.max} step={RANGES.weight.step}
              value={form.currentWeightKg}
              onChange={v => setForm(p => ({ ...p, currentWeightKg: v }))}
            />
            <Stepper
              label="Target Weight" unit="kg"
              min={RANGES.weight.min} max={RANGES.weight.max} step={RANGES.weight.step}
              value={form.targetWeightKg}
              onChange={v => setForm(p => ({ ...p, targetWeightKg: v }))}
            />
            <Field label="Activity Level">
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
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </GlassCard>

        {/* Goals & diet */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-headline font-black text-on-surface mb-4">Goals & Diet</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Primary Goal">
              <select
                value={form.primaryGoal}
                onChange={e => setForm(p => ({ ...p, primaryGoal: e.target.value }))}
                className={inputCls}
              >
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Dietary Restriction">
              <select
                value={form.dietaryRestriction}
                onChange={e => setForm(p => ({ ...p, dietaryRestriction: e.target.value }))}
                className={inputCls}
              >
                {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          {/* TDEE breakdown — shows BMR (Maintenance) → activity → goal adjustment
              → final target so the user understands where the number comes from.
              Reads live from `form` state (re-keyed after handleSave merges the
              server response) so the value updates immediately on save. */}
          <TdeeBreakdownCard form={form} />
        </GlassCard>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            className="py-4"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="py-4">
            {saving ? (
              <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Saving…</>
            ) : (
              <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

const inputCls = "w-full px-4 py-3 bg-surface-container-high rounded-2xl border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest transition-all text-on-surface font-body"

function Field({ label, children }) {
  return (
    <div>
      <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">{label}</label>
      {children}
    </div>
  )
}

// TDEE breakdown — same visual pattern used on SignupPage step 2. Lives here
// instead of being shared because the wider style differs slightly (sits inside
// a GlassCard) and the inputs come straight from the form rather than a
// previewTDEE memo. If we ever need a third location, lift this to a shared
// component.
function TdeeBreakdownCard({ form }) {
  const tdee = useMemo(() => calculateTDEE({
    age:    form.age,
    gender: form.gender,
    metrics: {
      heightCm:        form.heightCm,
      currentWeightKg: form.currentWeightKg,
      activityLevel:   form.activityLevel,
    },
  }), [form.age, form.gender, form.heightCm, form.currentWeightKg, form.activityLevel])

  const recommendedTarget = useMemo(() => getGoalCalories(tdee, form.primaryGoal), [tdee, form.primaryGoal])

  // What's currently stored on the user (recomputed server-side on save).
  const storedTarget = Number(form.dailyCalorieTarget) || null

  // If the profile is incomplete, show a hint instead of empty math.
  if (!tdee) {
    return (
      <div className="mt-5 flex items-center gap-3 p-4 rounded-2xl bg-surface-container-high">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>info</span>
        <p className="text-xs text-outline">
          Fill in your age, height, and current weight to see your daily calorie target breakdown.
        </p>
      </div>
    )
  }

  const adjustment = (recommendedTarget ?? 0) - tdee
  const isDeficit  = adjustment < 0
  const isSurplus  = adjustment > 0

  return (
    <div className="mt-5 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
        >
          calculate
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-primary">
          Your daily calorie target
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {/* Row 1 — Maintenance (BMR × activity multiplier) */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="font-medium">Maintenance (TDEE)</span>
          </div>
          <span className="font-bold text-on-surface">{tdee.toLocaleString()} kcal</span>
        </div>

        {/* Row 2 — Goal adjustment (only when non-zero) */}
        {(isDeficit || isSurplus) && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                {isDeficit ? 'remove' : 'add'}
              </span>
              <span className="font-medium">Goal adjustment ({form.primaryGoal})</span>
            </div>
            <span className={`font-bold ${isDeficit ? 'text-error' : 'text-primary'}`}>
              {isDeficit ? '−' : '+'}{Math.abs(adjustment).toLocaleString()} kcal
            </span>
          </div>
        )}

        {/* Row 3 — Recommended target */}
        <div className="border-t border-primary/15 pt-2 flex items-center justify-between">
          <span className="text-sm font-black text-on-surface">Recommended target</span>
          <span className="text-xl font-black text-primary font-headline">
            {recommendedTarget?.toLocaleString()} kcal
          </span>
        </div>

        {/* Row 4 — Currently stored target (if different from the recommended) */}
        {storedTarget && storedTarget !== recommendedTarget && (
          <div className="flex items-center justify-between text-xs text-outline pt-1">
            <span>Current stored target</span>
            <span className="font-bold">{storedTarget.toLocaleString()} kcal</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-outline leading-relaxed">
        Calculated using the Mifflin-St Jeor formula × your activity multiplier, then adjusted for your goal.
        Save changes to lock in the new target — it&apos;ll update across the dashboard and diet planner.
      </p>
    </div>
  )
}

