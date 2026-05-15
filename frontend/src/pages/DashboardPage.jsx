// DashboardPage.jsx — main user dashboard.
// On mount it fetches GET /dashboard/summary which returns calories, macros,
// today's meals, weight history, streak and activity.
// All data lives in the Redux dashboard slice; user info comes from the auth slice.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProgressRing from '../components/ProgressRing'
import ProgressBar from '../components/ProgressBar'
import MealCard from '../components/MealCard'
import {
  fetchDashboardSummary,
  fetchWeightHistory,
  toggleMealLogged,
  setPeriod,
  selectSummary,
  selectWeightHistory,
  selectDashboardLoading,
  selectDashboardError,
  selectPeriod,
} from '../store/slices/dashboardSlice'
import { selectUser } from '../store/slices/authSlice'
import { MEAL_COLOR, DASHBOARD } from '../constants/appConstants'

// Short day-of-week labels used in the weight chart
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Returns time-appropriate greeting based on current hour
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// Builds 7-slot chart data — backfills empty slots when history has fewer entries
function buildChartData(history) {
  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().slice(0, 10), kg: null }
  })
  history.forEach(entry => {
    const idx = slots.findIndex(s => s.date === entry.date)
    if (idx !== -1) slots[idx].kg = entry.kg
  })
  return slots
}

// Normalises a kg value to a bar height percentage (10 – 90 range)
function normaliseHeight(kg, minKg, rangeKg) {
  if (kg === null) return 0
  if (rangeKg === 0) return 50
  return Math.round(((kg - minKg) / rangeKg) * 80) + 10
}

export default function DashboardPage() {
  const dispatch = useDispatch()

  // ── Redux selectors ─────────────────────────────────────
  const user = useSelector(selectUser)
  const summary = useSelector(selectSummary)
  const weightHistory = useSelector(selectWeightHistory)
  const loading = useSelector(selectDashboardLoading)
  const error = useSelector(selectDashboardError)
  const period = useSelector(selectPeriod)
  const togglingMealIds = useSelector(state => state.dashboard.togglingMealIds)

  // ── Fetch dashboard data on mount ───────────────────────
  useEffect(() => {
    dispatch(fetchDashboardSummary())
  }, [dispatch])

  // ── Re-fetch weight history whenever the period selector changes ──
  useEffect(() => {
    dispatch(fetchWeightHistory(period))
  }, [dispatch, period])

  // ── Derived calorie values (safe defaults while loading) ─
  const consumed = summary?.calories?.consumed ?? 0
  const target = summary?.calories?.target ?? 2000
  const remaining = summary?.calories?.remaining ?? target

  // ── Derived macro values ─────────────────────────────────
  const protein = summary?.macros?.protein ?? { consumed: 0, target: 180 }
  const carbs = summary?.macros?.carbs ?? { consumed: 0, target: 250 }
  const fats = summary?.macros?.fats ?? { consumed: 0, target: 70 }
  const fiber = summary?.macros?.fiber ?? { consumed: 0, target: 30 }

  // ── Streak ───────────────────────────────────────────────
  const streakDays = summary?.streak?.current ?? 0

  // ── Activity ─────────────────────────────────────────────
  const steps = summary?.activity?.steps ?? 0
  const stepGoal = summary?.activity?.stepGoal ?? DASHBOARD.stepGoal

  // ── Hydration (shown in subtitle) ────────────────────────
  const hydration = summary?.hydration ?? { consumedMl: 0, targetMl: DASHBOARD.hydrationTargetMl }
  const hydrationPct = Math.round((hydration.consumedMl / hydration.targetMl) * 100)

  // ── Weight chart data ─────────────────────────────────────
  const chartSlots = buildChartData(weightHistory)
  const validKgs = chartSlots.map(s => s.kg).filter(Boolean)
  const minKg = validKgs.length ? Math.min(...validKgs) : 0
  const maxKg = validKgs.length ? Math.max(...validKgs) : 0
  const rangeKg = maxKg - minKg
  const barHeights = chartSlots.map(s => normaliseHeight(s.kg, minKg, rangeKg))
  const chartLabels = chartSlots.map(s => DAY_LABELS[new Date(s.date).getDay()])
  // Index of today in the chart
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayIdx = chartSlots.findIndex(s => s.date === todayStr)

  // ── Today's meals mapped to MealCard props ────────────────
  const todaysMeals = (summary?.todaysMeals ?? []).map((m, i) => ({
    id: m.id,
    meal: m.name,
    time: m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : 'Meal',
    calories: m.calories,
    logged: m.logged,
    color: MEAL_COLOR[m.type?.toLowerCase()] ?? (i % 2 === 0 ? 'primary' : 'secondary'),
    image: m.imageUrl || '',
  }))

  // ── Meal toggle handler — dispatches optimistic update ────
  const handleMealToggle = (mealId, newLogged) => {
    dispatch(toggleMealLogged({ mealId, logged: newLogged }))
  }

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto pb-32 md:pb-16">

      {/* ── Greeting ── personalised with user's first name and hydration progress */}
      <section className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-on-surface-variant text-lg">
          {hydration.consumedMl > 0
            ? `You're ${hydrationPct}% closer to your daily hydration goal today.`
            : 'Track your meals and stay on top of your daily goals.'}
        </p>
      </section>

      {/* ── Loading skeleton — shown while the first fetch is in flight ── */}
      {loading && !summary && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
          <div className="md:col-span-3 space-y-4">
            <div className="h-52 bg-surface-container rounded-lg" />
            <div className="h-32 bg-surface-container rounded-lg" />
          </div>
          <div className="md:col-span-6 space-y-6">
            <div className="h-64 bg-surface-container rounded-lg" />
            <div className="h-52 bg-surface-container rounded-lg" />
          </div>
          <div className="md:col-span-3 space-y-4">
            <div className="h-32 bg-surface-container rounded-lg" />
            <div className="h-28 bg-surface-container rounded-lg" />
            <div className="h-28 bg-surface-container rounded-lg" />
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <div className="rounded-lg bg-error/10 border border-error/30 text-error px-6 py-4 mb-6 font-body text-sm">
          <span className="material-symbols-outlined text-sm align-middle mr-2">error</span>
          {error} — <button onClick={() => dispatch(fetchDashboardSummary())} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* ── 12-col Bento Grid — rendered once summary is available ── */}
      {(!loading || summary) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ── Left col (3): Quick Actions + Streak ── */}
          <div className="md:col-span-3 space-y-4">

            {/* Quick actions — links to key flows */}
            <div className="bg-surface-container-lowest rounded-lg p-6 shadow-ambient">
              <h3 className="font-headline font-bold text-lg mb-6 tracking-tight">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <Link to="/diet-plan">
                  <button className="flex items-center gap-3 w-full bg-primary text-on-primary p-4 rounded-full font-bold transition-all hover:shadow-primary active:scale-95">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    <span>Log Meal</span>
                  </button>
                </Link>
                <Link to="/chat">
                  <button className="flex items-center gap-3 w-full bg-surface-container-highest text-primary p-4 rounded-full font-bold transition-all hover:bg-surface-container-high active:scale-95">
                    <span className="material-symbols-outlined">smart_toy</span>
                    <span>Ask AI</span>
                  </button>
                </Link>
                <Link to ="/profile">
                <button className="flex items-center gap-3 w-full bg-surface-container-highest text-on-surface-variant p-4 rounded-full font-bold transition-all hover:bg-surface-container-high active:scale-95">
                  <span className="material-symbols-outlined">edit_square</span>
                  <span>Update Goal</span>
                </button>
                </Link>
              </div>
            </div>

            {/* Streak card — shows consecutive days with at least one logged meal */}
            <div className="bg-secondary-container/10 rounded-lg p-6 relative overflow-hidden group">
              <div className="relative z-10">
                <span className="text-secondary font-black font-headline text-xs tracking-[0.2em] uppercase mb-2 block">
                  Weekly Streak
                </span>
                <div className="text-3xl font-black text-on-secondary-container">
                  {streakDays} {streakDays === 1 ? 'Day' : 'Days'} 🔥
                </div>
                <p className="text-sm text-on-secondary-container/70 mt-2">
                  {streakDays >= 7
                    ? 'Incredible — full week streak!'
                    : streakDays >= 3
                      ? 'Keep the momentum going!'
                      : 'Log a meal today to start your streak.'}
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl text-secondary">local_fire_department</span>
              </div>
            </div>
          </div>

          {/* ── Center col (6): Calorie summary + Weight chart ── */}
          <div className="md:col-span-6 space-y-6">

            {/* Calorie summary — ring + macro progress bars */}
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-headline text-2xl font-bold tracking-tight">Calorie Summary</h2>
                  <p className="text-on-surface-variant opacity-70">
                    Today&apos;s target: {target.toLocaleString()} kcal
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-primary font-headline">
                    {consumed.toLocaleString()}
                  </span>
                  <span className="block text-xs uppercase tracking-widest text-outline font-bold">Consumed</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Progress ring shows consumed vs target, label shows remaining */}
                <ProgressRing
                  value={consumed}
                  max={target}
                  size={180}
                  label={remaining.toLocaleString()}
                  sublabel="Remaining"
                />
                <div className="flex-1 w-full space-y-5">
                  {/* Macro breakdown — protein, carbs, fats, fiber */}
                  <ProgressBar
                    value={protein.consumed}
                    max={protein.target}
                    color="primary"
                    label="Protein"
                    sublabel={`${protein.consumed}g / ${protein.target}g`}
                  />
                  <ProgressBar
                    value={carbs.consumed}
                    max={carbs.target}
                    color="secondary"
                    label="Carbs"
                    sublabel={`${carbs.consumed}g / ${carbs.target}g`}
                  />
                  <ProgressBar
                    value={fats.consumed}
                    max={fats.target}
                    color="tertiary"
                    label="Fats"
                    sublabel={`${fats.consumed}g / ${fats.target}g`}
                  />
                  <ProgressBar
                    value={fiber.consumed}
                    max={fiber.target}
                    color="secondary"
                    label="Fiber"
                    sublabel={`${fiber.consumed}g / ${fiber.target}g`}
                  />
                </div>
              </div>
            </div>

            {/* Weight progress chart — bar chart from weight history entries */}
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline text-2xl font-bold tracking-tight">Weight Progress</h2>
                {/* Period toggle — triggers a new fetchWeightHistory dispatch */}
                <div className="flex gap-2">
                  {['7d', '30d'].map(p => (
                    <button
                      key={p}
                      onClick={() => dispatch(setPeriod(p))}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${period === p
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                      {p === '7d' ? '7 Days' : '30 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {validKgs.length === 0 ? (
                // Empty state — shown when no weight entries have been logged
                <div className="h-44 flex flex-col items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-40">monitor_weight</span>
                  <p className="text-sm font-body opacity-60">No weight entries yet.</p>
                  <p className="text-xs font-body opacity-40 mt-1">Log your weight to track progress.</p>
                </div>
              ) : (
                <>
                  <div className="h-44 w-full flex items-end gap-2">
                    {chartSlots.map((slot, i) => (
                      <div
                        key={slot.date}
                        className={`flex-1 rounded-t-lg relative transition-all duration-500 ${i === todayIdx
                            ? 'bg-primary-container'
                            : slot.kg !== null
                              ? 'bg-primary'
                              : 'bg-surface-container-high'
                          }`}
                        style={{ height: `${barHeights[i] || 4}%` }}
                      >
                        {/* Tooltip with actual kg value for today's bar */}
                        {i === todayIdx && slot.kg !== null && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap">
                            {slot.kg}kg
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                    {chartLabels.map((d, i) => <span key={i}>{d}</span>)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Right col (3): Today's Meal Plan + Activity ── */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="font-headline font-bold text-xl tracking-tight">Today&apos;s Meal Plan</h3>

            {/* Meal cards — built from todaysMeals returned by the summary endpoint */}
            {todaysMeals.length > 0 ? (
              todaysMeals.map(m => (
                <MealCard
                  key={m.id ?? (m.meal + m.time)}
                  {...m}
                  onToggle={handleMealToggle}
                  toggling={togglingMealIds.includes(m.id)}
                />
              ))
            ) : (
              // Empty state — shown when no meals have been logged today
              <div className="bg-surface-container-lowest rounded-lg p-6 text-center shadow-ambient-sm">
                <span className="material-symbols-outlined text-3xl text-outline opacity-50 mb-2">restaurant</span>
                <p className="text-sm font-body text-on-surface-variant">No meals logged today.</p>
                <Link to="/diet-plan" className="text-xs text-primary font-bold mt-2 inline-block hover:underline">
                  Log your first meal →
                </Link>
              </div>
            )}

            {/* Activity card — shows step count vs daily goal from activity data */}
            <div className="bg-primary-container rounded-lg p-6 relative overflow-hidden mt-4">
              <div className="relative z-10">
                <h4 className="font-headline font-bold text-on-primary-container text-lg mb-1">Daily Activity</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-on-primary-container">
                    {steps.toLocaleString()}
                  </span>
                  <span className="text-sm text-on-primary-container/80">steps</span>
                </div>
                {/* Progress bar — proportion of steps completed toward goal */}
                <div className="mt-4 h-1 w-full bg-on-primary-container/20 rounded-full">
                  <div
                    className="h-full bg-on-primary-container rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((steps / stepGoal) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] mt-2 font-bold uppercase tracking-widest text-on-primary-container/80">
                  Goal: {stepGoal.toLocaleString()}
                </p>
              </div>
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-on-primary-container/20 rotate-12">
                directions_walk
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}