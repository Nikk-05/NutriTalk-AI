import { Link } from 'react-router-dom'
import ProgressRing from '../components/ProgressRing'
import ProgressBar from '../components/ProgressBar'
import MealCard from '../components/MealCard'
import Button from '../components/Button'

const meals = [
  {
    meal: 'Oatmeal & Berries', time: 'Breakfast', calories: 340, status: 'logged', color: 'primary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpR6vg0lz-Awq0BWlaf7iaMaOr9hiiCBh57N2vQCIzBGRM00NS7zgqWsuaNZdU2fjibjLHRWOaGMufA2C84IVR8u5QPYwX7lxfc-9xE1kGD4fm3sFBwgM-SIuISrKqAcHXHh45m9g7T26CijYqtURe97L0frvHV0o_jAS8usHqGNHlz0m41MsyX2SdcCzoPZWIWnd1No0A-lH4d8Vt6puiUvS7VD-DlpG3hVdsUHlsJbHeeeoKipE97f8s75woVh23xKzQ97TgW_U',
  },
  {
    meal: 'Salmon Salad', time: 'Lunch', calories: 520, status: 'logged', color: 'secondary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm9vLJYMFiy24qLqxb77l7uuo3Hixlzw2lX475wVZ9Twg1uFRxIkoFm5RxyUuqgUuWXzDx6cgu1PsUSeF_cVVTckcCkNAZd0INdfdWLGo1P8ze-TIPcfJZstwvk2re65WnXBM1SEekqawLiPKI6ASVCmj0IrOxE5OZipAUDpxGPxf0o7B9OPjFNWfMbko-E83WH9PLUx1NlqpIoamljDUl3JUC19Juw0wxfdNP1p3zJTxPi83a34T17KFQPsYk5LGgwEr07eqBQtI',
  },
  {
    meal: 'Grilled Chicken', time: 'Dinner', calories: 680, status: 'upcoming', color: 'muted',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPGTz4JstOOiGd1vKYyTObWTTwvkg22q1_Ff836Kkd6wCzh64snauQJKrEwRDu26ESpqcUiVxqF_os4ZFJdB22i1xmxjRy9RoYLWGtpvnIbDu7PwZDOeEw4VAw9vsg38oGiS6NLeeCUn7981POm6JUONFJMewozF5F3HYYpaMueTIZF_NRRkdISkPYOsYp2Ajd7FdL90RomcZ69verqXcQLML62PRvQdG6jJAKulbiz29-rj-5JzzZG9KmIioU9Gr4QTK-0mzdzIc',
  },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weightBars = [70, 65, 68, 60, 58, 55, 52]

export default function DashboardPage() {
  return (
    <div className="py-12 px-6 max-w-7xl mx-auto pb-32 md:pb-16">
      {/* Greeting */}
      <section className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">
          Good Morning, Alex 👋
        </h1>
        <p className="text-on-surface-variant text-lg">You&apos;re 65% closer to your daily hydration goal today.</p>
      </section>

      {/* 12-col Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ── Left col: Quick Actions ── */}
        <div className="md:col-span-3 space-y-4">
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
              <button className="flex items-center gap-3 w-full bg-surface-container-highest text-on-surface-variant p-4 rounded-full font-bold transition-all hover:bg-surface-container-high active:scale-95">
                <span className="material-symbols-outlined">edit_square</span>
                <span>Update Goal</span>
              </button>
            </div>
          </div>
          {/* Streak card */}
          <div className="bg-secondary-container/10 rounded-lg p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-secondary font-black font-headline text-xs tracking-[0.2em] uppercase mb-2 block">
                Weekly Streak
              </span>
              <div className="text-3xl font-black text-on-secondary-container">5 Days 🔥</div>
              <p className="text-sm text-on-secondary-container/70 mt-2">Almost at a full week! Keep pushing.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-8xl text-secondary">local_fire_department</span>
            </div>
          </div>
        </div>

        {/* ── Center col: Calorie summary + Weight chart ── */}
        <div className="md:col-span-6 space-y-6">
          {/* Calorie Summary */}
          <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Calorie Summary</h2>
                <p className="text-on-surface-variant opacity-70">Today&apos;s target: 2,400 kcal</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-primary font-headline">1,540</span>
                <span className="block text-xs uppercase tracking-widest text-outline font-bold">Consumed</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <ProgressRing value={1540} max={2400} size={180} label="860" sublabel="Remaining" />
              <div className="flex-1 w-full space-y-5">
                <ProgressBar value={120} max={180} color="primary" label="Protein" sublabel="120g / 180g" />
                <ProgressBar value={210} max={250} color="secondary" label="Carbs" sublabel="210g / 250g" />
                <ProgressBar value={45} max={70} color="tertiary" label="Fats" sublabel="45g / 70g" />
              </div>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-2xl font-bold tracking-tight">Weight Progress</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer">7 Days</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer">30 Days</span>
              </div>
            </div>
            <div className="h-44 w-full flex items-end gap-2">
              {weightBars.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-lg relative transition-all duration-500 ${i >= 3 ? 'bg-primary' : 'bg-surface-container-high'} ${i === 6 ? 'bg-primary-container' : ''}`}
                  style={{ height: `${h}%` }}
                >
                  {i === 6 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap">
                      78.2kg
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-outline uppercase tracking-widest">
              {weekDays.map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* ── Right col: Meal Plan + Activity ── */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="font-headline font-bold text-xl tracking-tight">Today&apos;s Meal Plan</h3>
          {meals.map(m => <MealCard key={m.meal} {...m} />)}

          {/* Activity Card */}
          <div className="bg-primary-container rounded-lg p-6 relative overflow-hidden mt-4">
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-on-primary-container text-lg mb-1">Afternoon Walk</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-on-primary-container">4,230</span>
                <span className="text-sm text-on-primary-container/80">steps</span>
              </div>
              <div className="mt-4 h-1 w-full bg-on-primary-container/20 rounded-full">
                <div className="h-full bg-on-primary-container w-[42%] rounded-full" />
              </div>
              <p className="text-[10px] mt-2 font-bold uppercase tracking-widest text-on-primary-container/80">Goal: 10,000</p>
            </div>
            <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-on-primary-container/20 rotate-12">
              directions_walk
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
