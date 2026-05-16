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

import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../components/Button'
import { GOALS, DIETS, CUISINES, DEFAULTS, RANGES, DIET_PLAN } from '../constants/appConstants'
import { calculateTDEE, getGoalCalories, getCalorieWarning } from '../utils/tdee'
import { selectUser } from '../store/slices/authSlice'
import {
  fetchSavedPlans,
  generatePlan,
  savePlan,
  seedTodayFromPlan,
  deletePlan,
  setActivePlan,
  setCurrentPlan,
  clearError,
  selectSavedPlans,
  selectCurrentPlan,
  selectCurrentPlanId,
  selectActivePlanId,
  selectIsPlanSaved,
  selectIsSeeded,
  selectSeededCount,
  selectGenerating,
  selectSaving,
  selectSeeding,
  selectDeleting,
  selectSettingActive,
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
  const activePlanId  = useSelector(selectActivePlanId)
  const isSaved       = useSelector(selectIsPlanSaved)
  const isSeeded      = useSelector(selectIsSeeded)
  const seededCount   = useSelector(selectSeededCount)
  const generating    = useSelector(selectGenerating)
  const saving        = useSelector(selectSaving)
  const seeding       = useSelector(selectSeeding)
  const deleting      = useSelector(selectDeleting)
  const settingActive = useSelector(selectSettingActive)
  const loadingPlans  = useSelector(selectLoadingPlans)
  const error         = useSelector(selectDietPlanError)

  // ── Form state (local — not worth putting in Redux) ────────
  const [selectedGoal,     setSelectedGoal]     = useState(user?.preferences?.primaryGoal        || DEFAULTS.primaryGoal)
  const [selectedDiet,     setSelectedDiet]     = useState(user?.preferences?.dietaryRestriction || DEFAULTS.dietaryRestriction)
  const [calories,         setCalories]         = useState(user?.preferences?.dailyCalorieTarget || DEFAULTS.dailyCalorieTarget)
  const [selectedCuisines, setSelectedCuisines] = useState(user?.preferences?.cuisinePreferences || [])

  // ── TDEE & goal-aware calorie recommendation ───────────────
  const tdee = useMemo(() => calculateTDEE(user), [user])
  const recommendedCalories = useMemo(() => getGoalCalories(tdee, selectedGoal), [tdee, selectedGoal])
  const calorieWarning = useMemo(() => getCalorieWarning(calories, tdee, selectedGoal), [calories, tdee, selectedGoal])

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

  // When user picks a goal, auto-set calories to the recommended value for that goal
  const handleGoalChange = (g) => {
    setSelectedGoal(g)
    if (tdee) {
      setCalories(getGoalCalories(tdee, g))
    }
  }

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
                    onClick={() => handleGoalChange(g)}
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
              <div className="flex items-baseline justify-between mb-3">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-outline">
                  Daily Calorie Target
                </label>
                <span className="text-lg font-black text-primary font-headline leading-none">{calories} kcal</span>
              </div>

              <input
                type="range"
                min={RANGES.calories.min} max={RANGES.calories.max} step={RANGES.calories.step}
                value={calories}
                onChange={e => setCalories(+e.target.value)}
                className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-outline mt-1 font-bold">
                <span>{RANGES.calories.min}</span><span>{RANGES.calories.max}</span>
              </div>

              {/* TDEE reference rows — clean, borderless, below the slider */}
              {tdee ? (
                <div className="mt-4 pt-3 border-t border-surface-container-high space-y-2.5">
                  {/* TDEE row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      <span className="text-xs font-semibold">Your TDEE</span>
                    </div>
                    <span className="text-xs font-black text-on-surface">{tdee.toLocaleString()} <span className="text-outline font-bold">kcal/day</span></span>
                  </div>

                  {/* Recommended row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      <span className="text-xs font-semibold">Recommended <span className="text-outline font-normal">for {selectedGoal}</span></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-primary">{recommendedCalories?.toLocaleString()} <span className="text-primary/60 font-bold">kcal</span></span>
                      {calories !== recommendedCalories && (
                        <button
                          onClick={() => setCalories(recommendedCalories)}
                          className="text-[10px] font-black text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2 transition-all"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span>
                  Complete height, weight &amp; age in Profile for a personalised recommendation.
                </p>
              )}

              {/* Inline conflict warning — no box, just coloured text */}
              {calorieWarning && (
                <div className={`mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed ${
                  calorieWarning.type === 'error'   ? 'text-error' :
                  calorieWarning.type === 'warning' ? 'text-amber-600' :
                  'text-primary'
                }`}>
                  <span className="material-symbols-outlined shrink-0 mt-px" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                    {calorieWarning.type === 'error' ? 'error' : calorieWarning.type === 'warning' ? 'warning' : 'info'}
                  </span>
                  <span>{calorieWarning.msg}</span>
                </div>
              )}
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
                  {[1,2].map(i => <div key={i} className="h-14 bg-surface-container rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPlans.map(p => {
                    const isActive   = p._id === activePlanId
                    const isCurrent  = p._id === currentPlanId
                    const isDeleting = deleting === p._id
                    const isSettingA = settingActive === p._id
                    return (
                      <div
                        key={p._id}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          isCurrent
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-surface-container-high bg-surface-container-low hover:border-surface-container-highest'
                        }`}
                      >
                        {/* Top row: name + active badge */}
                        <div className="flex items-start gap-2 mb-1">
                          <p
                            className={`font-bold text-sm leading-snug flex-1 cursor-pointer hover:underline ${
                              isCurrent ? 'text-primary' : 'text-on-surface'
                            }`}
                            onClick={() => handleLoadSaved(p)}
                          >
                            {p.title || `${p.goal} Plan`}
                          </p>
                          {isActive && (
                            <span className="shrink-0 flex items-center gap-0.5 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5">
                              <span className="material-symbols-outlined" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                              Active
                            </span>
                          )}
                        </div>

                        {/* Subtitle */}
                        <p className="text-[11px] text-outline mb-3">
                          {p.dailyCalorieTarget} kcal &bull; {p.dietaryRestriction}
                        </p>

                        {/* Action row */}
                        <div className="flex items-center gap-2 pt-2 border-t border-surface-container-high">
                          {!isActive ? (
                            <button
                              onClick={() => dispatch(setActivePlan(p._id))}
                              disabled={!!settingActive || !!deleting}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-primary/70 hover:text-primary disabled:opacity-40 transition-colors py-1 px-2 rounded-lg hover:bg-primary/8"
                            >
                              {isSettingA
                                ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>refresh</span>
                                : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bolt</span>
                              }
                              Set Active
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-primary/50 py-1 px-2">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Dashboard synced
                            </span>
                          )}

                          <div className="flex-1" />

                          <button
                            onClick={() => dispatch(deletePlan(p._id))}
                            disabled={!!deleting || !!settingActive}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-outline hover:text-error disabled:opacity-40 transition-colors py-1 px-2 rounded-lg hover:bg-error/5"
                          >
                            {isDeleting
                              ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>refresh</span>
                              : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                            }
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-headline text-2xl font-bold">
                      {currentPlan.title || `${currentPlan.goal || selectedGoal} Plan`}
                    </h2>
                    {currentPlanId === activePlanId && activePlanId && (
                      <span className="flex items-center gap-0.5 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-outline text-sm">
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
                  <div key={index} className="bg-surface-container-low rounded-xl p-5 hover:shadow-ambient-sm transition-all">
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="font-headline font-black text-primary text-lg">
                          {typeof dayObj.day === 'string' ? dayObj.day : `Day ${index + 1}`}
                        </span>
                      </div>
                      {dayObj.totalCalories && (
                        <div className="flex items-baseline gap-1 bg-primary/10 px-3 py-1 rounded-full">
                          <span className="text-sm font-black text-primary font-headline">{dayObj.totalCalories}</span>
                          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider">kcal/day</span>
                        </div>
                      )}
                    </div>

                    {/* Meal cards grid — 2 columns for readability */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DIET_PLAN.MEAL_SLOTS.map(({ key, label, icon, color }) => {
                        const meal = dayObj.meals?.[key]
                        if (!meal?.name) return null
                        const mn = meal.microNutrients || {}
                        const hasMacros = mn.protein > 0 || mn.carbs > 0 || mn.fats > 0
                        return (
                          <div key={key} className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-2 border border-surface-container-high hover:border-primary/20 transition-colors">
                            {/* Header: type label + calories */}
                            <div className="flex items-center justify-between gap-2">
                              <div className={`flex items-center gap-1.5 ${color}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                              </div>
                              {meal.calories && (
                                <div className="flex items-baseline gap-0.5 shrink-0">
                                  <span className="text-base font-black text-on-surface font-headline leading-none">{meal.calories}</span>
                                  <span className="text-[9px] text-outline font-bold ml-0.5">kcal</span>
                                </div>
                              )}
                            </div>

                            {/* Meal name */}
                            <p className="text-sm font-semibold text-on-surface leading-snug">{meal.name}</p>

                            {/* Macro nutrient chips */}
                            {hasMacros && (
                              <div className="mt-0.5 pt-2.5 border-t border-surface-container-high grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                  <span className="text-[10px] text-on-surface-variant">
                                    <span className="font-bold text-on-surface">{mn.protein}g</span> Protein
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                                  <span className="text-[10px] text-on-surface-variant">
                                    <span className="font-bold text-on-surface">{mn.carbs}g</span> Carbs
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-tertiary shrink-0" />
                                  <span className="text-[10px] text-on-surface-variant">
                                    <span className="font-bold text-on-surface">{mn.fats}g</span> Fats
                                  </span>
                                </div>
                                {mn.fiber > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-outline shrink-0" />
                                    <span className="text-[10px] text-on-surface-variant">
                                      <span className="font-bold text-on-surface">{mn.fiber}g</span> Fiber
                                    </span>
                                  </div>
                                )}
                              </div>
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
