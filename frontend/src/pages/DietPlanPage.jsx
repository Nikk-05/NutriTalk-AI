// DietPlanPage.jsx — AI-powered diet plan generator.
//
// State lives in Redux (dietPlanSlice) so plans persist across navigation
// without refetching on every visit.
//
// Flow:
//   Mount           → fetchSavedPlans (skipped if already loaded)
//   Generate button → generatePlan thunk → POST /diet-plans/generate
//   Save button     → savePlan thunk    → POST /diet-plans/:id/save
//   Sync button     → seedTodayFromPlan → POST /diet-plans/:id/seed-today
//                     Creates MealLog entries (logged: false) so the
//                     dashboard reflects today's planned meals.

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../components/Button'
import { GOALS, DIETS, CUISINES, DEFAULTS, RANGES, DIET_PLAN } from '../constants/appConstants'
import { selectUser } from '../store/slices/authSlice'
import {
  fetchSavedPlans,
  generatePlan,
  savePlan,
  seedTodayFromPlan,
  setCurrentPlan,
  clearError,
  selectSavedPlans,
  selectCurrentPlan,
  selectCurrentPlanId,
  selectIsPlanSaved,
  selectIsSeeded,
  selectSeededCount,
  selectGenerating,
  selectSaving,
  selectSeeding,
  selectLoadingPlans,
  selectDietPlanError,
} from '../store/slices/dietPlanSlice'

export default function DietPlanPage() {
  const dispatch = useDispatch()
  const user     = useSelector(selectUser)

  // ── Redux state ────────────────────────────────────────────
  const savedPlans    = useSelector(selectSavedPlans)
  const currentPlan   = useSelector(selectCurrentPlan)
  const currentPlanId = useSelector(selectCurrentPlanId)
  const isSaved       = useSelector(selectIsPlanSaved)
  const isSeeded      = useSelector(selectIsSeeded)
  const seededCount   = useSelector(selectSeededCount)
  const generating    = useSelector(selectGenerating)
  const saving        = useSelector(selectSaving)
  const seeding       = useSelector(selectSeeding)
  const loadingPlans  = useSelector(selectLoadingPlans)
  const error         = useSelector(selectDietPlanError)

  // ── Form state (local — not worth putting in Redux) ────────
  const [selectedGoal,     setSelectedGoal]     = useState(user?.preferences?.primaryGoal        || DEFAULTS.primaryGoal)
  const [selectedDiet,     setSelectedDiet]     = useState(user?.preferences?.dietaryRestriction || DEFAULTS.dietaryRestriction)
  const [calories,         setCalories]         = useState(user?.preferences?.dailyCalorieTarget || DEFAULTS.dailyCalorieTarget)
  const [selectedCuisines, setSelectedCuisines] = useState(user?.preferences?.cuisinePreferences || [])

  // ── Sync form when a saved plan is auto-loaded on mount ────
  useEffect(() => {
    if (currentPlan) {
      setSelectedGoal(currentPlan.goal                || DEFAULTS.primaryGoal)
      setSelectedDiet(currentPlan.dietaryRestriction  || DEFAULTS.dietaryRestriction)
      setCalories(currentPlan.dailyCalorieTarget      || DEFAULTS.dailyCalorieTarget)
      setSelectedCuisines(currentPlan.cuisinePreferences || [])
    }
  }, [currentPlan])

  // ── Fetch saved plans on mount — skips if already in Redux ─
  useEffect(() => {
    if (savedPlans.length === 0 && !loadingPlans) {
      dispatch(fetchSavedPlans())
    }
  }, [])

  // ── Clear error when form changes ──────────────────────────
  useEffect(() => {
    if (error) dispatch(clearError())
  }, [selectedGoal, selectedDiet, calories])

  const toggleCuisine = (c) =>
    setSelectedCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  // ── Generate — dispatches thunk with current form values ───
  const handleGenerate = () => {
    dispatch(generatePlan({
      goal:               selectedGoal,
      dietaryRestriction: selectedDiet,
      dailyCalorieTarget: calories,
      cuisinePreferences: selectedCuisines,
      days:               DIET_PLAN.planDays,
    }))
  }

  // ── Save plan ──────────────────────────────────────────────
  const handleSave = () => {
    if (!currentPlanId || isSaved) return
    dispatch(savePlan({ planId: currentPlanId, title: `${selectedGoal} Plan` }))
  }

  // ── Seed today's meals into MealLog from this plan ─────────
  const handleSeedToday = () => {
    if (!currentPlanId) return
    dispatch(seedTodayFromPlan(currentPlanId))
  }

  // ── Load a previous plan into the right panel ──────────────
  const handleLoadSaved = (plan) => {
    dispatch(setCurrentPlan(plan))
    setSelectedGoal(plan.goal               || DEFAULTS.primaryGoal)
    setSelectedDiet(plan.dietaryRestriction || DEFAULTS.dietaryRestriction)
    setCalories(plan.dailyCalorieTarget     || DEFAULTS.dailyCalorieTarget)
    setSelectedCuisines(plan.cuisinePreferences || [])
  }

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto pb-32 md:pb-16">
      <div className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">
          AI Diet Planner
        </h1>
        <p className="text-on-surface-variant text-lg">
          Hyper-personalized meal plans crafted by your AI nutritionist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Preferences form ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
            <h2 className="font-headline text-xl font-bold mb-6">Your Preferences</h2>

            {/* Primary goal */}
            <div className="mb-6">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Primary Goal
              </label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGoal(g)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                      selectedGoal === g
                        ? 'primary-gradient text-on-primary shadow-primary-sm'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary restriction */}
            <div className="mb-6">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Dietary Restriction
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETS.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDiet(d)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                      selectedDiet === d
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie target slider */}
            <div className="mb-6">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Daily Calorie Target: <span className="text-primary">{calories} kcal</span>
              </label>
              <input
                type="range"
                min={RANGES.calories.min} max={RANGES.calories.max} step={RANGES.calories.step}
                value={calories}
                onChange={e => setCalories(+e.target.value)}
                className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-outline mt-1.5 font-bold">
                <span>{RANGES.calories.min}</span><span>{RANGES.calories.max}</span>
              </div>
            </div>

            {/* Cuisine preferences */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Cuisine Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      selectedCuisines.includes(c)
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full py-4 text-base"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Generating...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">auto_awesome</span> Generate My Plan</>
              )}
            </Button>

            {error && (
              <p className="mt-4 text-xs text-error font-body flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </p>
            )}
          </div>

          {/* Saved plans list — persists in Redux, no extra fetch needed */}
          {(loadingPlans || savedPlans.length > 0) && (
            <div className="bg-surface-container-lowest rounded-lg p-6 shadow-ambient">
              <h3 className="font-headline font-bold text-base mb-4">Saved Plans</h3>
              {loadingPlans ? (
                <div className="space-y-2 animate-pulse">
                  {[1,2].map(i => <div key={i} className="h-12 bg-surface-container rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {savedPlans.map(p => (
                    <button
                      key={p._id}
                      onClick={() => handleLoadSaved(p)}
                      className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                        currentPlanId === p._id
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <p className="font-bold truncate">{p.title || `${p.goal} Plan`}</p>
                      <p className="text-xs opacity-60 mt-0.5">
                        {p.dailyCalorieTarget} kcal · {p.dietaryRestriction}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Plan panel ── */}
        <div className="lg:col-span-2">

          {/* Generating spinner */}
          {generating && (
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient flex items-center justify-center h-64">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin block mb-4">refresh</span>
                <p className="font-headline font-bold text-on-surface">Crafting your plan...</p>
                <p className="text-outline text-sm mt-1">The AI is analyzing your preferences</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!generating && !currentPlan && (
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient flex flex-col items-center justify-center h-64 text-center">
              <span className="material-symbols-outlined text-5xl text-outline opacity-40 mb-4">restaurant_menu</span>
              <p className="font-headline font-bold text-on-surface text-lg">No plan generated yet</p>
              <p className="text-outline text-sm mt-1 max-w-xs">
                Configure your preferences and hit <strong>Generate My Plan</strong>.
              </p>
            </div>
          )}

          {/* Plan view — rendered from Redux state */}
          {!generating && currentPlan && (
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-headline text-2xl font-bold">
                    {currentPlan.title || `${currentPlan.goal || selectedGoal} Plan`}
                  </h2>
                  <p className="text-outline text-sm mt-1">
                    {currentPlan.goal || selectedGoal} ·{' '}
                    {(currentPlan.dietaryRestriction || selectedDiet) !== 'None'
                      ? currentPlan.dietaryRestriction || selectedDiet
                      : 'No restrictions'}{' '}
                    · ~{currentPlan.dailyCalorieTarget || calories} kcal/day
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 text-primary font-headline font-bold text-sm hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Regenerate
                </button>
              </div>

              {/* Day cards — each day from currentPlan.days */}
              <div className="space-y-4">
                {(currentPlan.days || []).map((dayObj, index) => (
                  <div key={index} className="bg-surface-container-low rounded-lg p-5 hover:shadow-ambient-sm transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline font-black text-primary text-lg">
                        {typeof dayObj.day === 'string' ? dayObj.day.slice(0, 3) : `Day ${index + 1}`}
                      </span>
                      {dayObj.totalCalories && (
                        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                          {dayObj.totalCalories} kcal
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DIET_PLAN.MEAL_SLOTS.map(({ key, label, icon, color }) => {
                        const meal = dayObj.meals?.[key]
                        if (!meal?.name) return null
                        return (
                          <div key={key} className="bg-surface-container-lowest rounded-lg p-3">
                            <div className={`flex items-center gap-1.5 mb-1.5 ${color}`}>
                              <span className="material-symbols-outlined text-sm">{icon}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                            </div>
                            <p className="text-sm font-semibold text-on-surface leading-tight">{meal.name}</p>
                            {meal.calories && (
                              <p className="text-[10px] text-outline mt-1">{meal.calories} kcal</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-8 space-y-3">
                <div className="flex gap-4">
                  {/* Save plan */}
                  <Button
                    variant="primary"
                    className="flex-1 py-3"
                    onClick={handleSave}
                    disabled={saving || isSaved}
                  >
                    {saving ? (
                      <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Saving...</>
                    ) : isSaved ? (
                      <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Saved</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">download</span> Save Plan</>
                    )}
                  </Button>
                  <Button variant="secondary" className="flex-1 py-3">
                    <span className="material-symbols-outlined text-sm">share</span> Share
                  </Button>
                </div>

                {/* Sync today's meals — only shown after plan is saved */}
                {isSaved && (
                  <button
                    onClick={handleSeedToday}
                    disabled={seeding || isSeeded}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-headline font-bold text-sm transition-all active:scale-95 ${
                      isSeeded
                        ? 'bg-primary/10 text-primary cursor-default'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-60'
                    }`}
                  >
                    {seeding ? (
                      <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Syncing...</>
                    ) : isSeeded ? (
                      <>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {seededCount > 0
                          ? `${seededCount} meal${seededCount !== 1 ? 's' : ''} synced to Dashboard`
                          : "Today's meals already synced"}
                      </>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">sync</span> Sync Today's Meals to Dashboard</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
