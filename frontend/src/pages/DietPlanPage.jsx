import { useState } from 'react'
import Button from '../components/Button'
import Badge from '../components/Badge'

const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Improved Energy', 'Better Sleep']
const diets = ['None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean']
const cuisines = ['Indian', 'Mediterranean', 'Asian', 'Mexican', 'American', 'Italian']

const weeklyPlan = [
  { day: 'Mon', breakfast: 'Oatmeal & Berries', lunch: 'Grilled Salmon Salad', dinner: 'Chicken Stir Fry', cal: 1820 },
  { day: 'Tue', breakfast: 'Greek Yogurt Parfait', lunch: 'Quinoa Buddha Bowl', dinner: 'Baked Cod & Veggies', cal: 1750 },
  { day: 'Wed', breakfast: 'Avocado Toast', lunch: 'Turkey Wrap', dinner: 'Lentil Curry', cal: 1890 },
  { day: 'Thu', breakfast: 'Smoothie Bowl', lunch: 'Chickpea Salad', dinner: 'Salmon with Asparagus', cal: 1680 },
  { day: 'Fri', breakfast: 'Eggs & Whole Grain', lunch: 'Veggie Soup', dinner: 'Tofu Fried Rice', cal: 1720 },
]

export default function DietPlanPage() {
  const [selectedGoal, setSelectedGoal] = useState('Weight Loss')
  const [selectedDiet, setSelectedDiet] = useState('None')
  const [calories, setCalories] = useState(1800)
  const [generated, setGenerated] = useState(true)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setGenerated(false)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1500)
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
        {/* ── Form ── */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
            <h2 className="font-headline text-xl font-bold mb-6">Your Preferences</h2>

            {/* Goal */}
            <div className="mb-6">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Primary Goal
              </label>
              <div className="flex flex-wrap gap-2">
                {goals.map(g => (
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

            {/* Diet type */}
            <div className="mb-6">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Dietary Restriction
              </label>
              <div className="flex flex-wrap gap-2">
                {diets.map(d => (
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

            {/* Calories */}
            <div className="mb-6">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Daily Calorie Target: <span className="text-primary">{calories} kcal</span>
              </label>
              <input
                type="range" min={1200} max={3200} step={50}
                value={calories}
                onChange={e => setCalories(+e.target.value)}
                className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-outline mt-1.5 font-bold">
                <span>1200</span><span>3200</span>
              </div>
            </div>

            {/* Cuisine */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-3 block">
                Cuisine Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {cuisines.map(c => (
                  <Badge key={c} color="muted" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                    {c}
                  </Badge>
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
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Generate My Plan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── Generated Plan ── */}
        <div className="lg:col-span-2">
          {generated ? (
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-headline text-2xl font-bold">Your Weekly Plan</h2>
                  <p className="text-outline text-sm mt-1">
                    {selectedGoal} · {selectedDiet !== 'None' ? selectedDiet : 'No restrictions'} · ~{calories} kcal/day
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 text-primary font-headline font-bold text-sm hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Regenerate
                </button>
              </div>

              <div className="space-y-4">
                {weeklyPlan.map(({ day, breakfast, lunch, dinner, cal }) => (
                  <div key={day} className="bg-surface-container-low rounded-lg p-5 hover:shadow-ambient-sm transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline font-black text-primary text-lg">{day}</span>
                      <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{cal} kcal</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Breakfast', meal: breakfast, icon: 'wb_sunny', color: 'text-secondary' },
                        { label: 'Lunch', meal: lunch, icon: 'lunch_dining', color: 'text-primary' },
                        { label: 'Dinner', meal: dinner, icon: 'nights_stay', color: 'text-tertiary' },
                      ].map(({ label, meal, icon, color }) => (
                        <div key={label} className="bg-surface-container-lowest rounded-lg p-3">
                          <div className={`flex items-center gap-1.5 mb-1.5 ${color}`}>
                            <span className="material-symbols-outlined text-sm">{icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                          </div>
                          <p className="text-sm font-semibold text-on-surface leading-tight">{meal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <Button variant="primary" className="flex-1 py-3">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Save Plan
                </Button>
                <Button variant="secondary" className="flex-1 py-3">
                  <span className="material-symbols-outlined text-sm">share</span>
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient flex items-center justify-center h-64">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin block mb-4">refresh</span>
                <p className="font-headline font-bold text-on-surface">Crafting your plan...</p>
                <p className="text-outline text-sm mt-1">The AI is analyzing your preferences</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
