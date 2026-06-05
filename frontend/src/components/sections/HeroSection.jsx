import { Link } from 'react-router-dom'
import GlassCard from '../GlassCard'
import Button from '../Button'

// Hero — first viewport on the landing page. Primary CTA funnels visitors to
// signup; secondary points returning users at login. Logged-in users see app
// destinations instead so the marketing page stays useful as a "home".
const avatarUrls = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnUSRFNhKlBrws8L8Ob1CZPle7vpljORRIpVxIG-uVLpQ126WpX79HWBV5Q1ivjAtSGl2gWPRnSpLaRkTPDesrl3HsFSqB2PClIf0zgbYqQPYoBhgtXb5YkuRGhXVDuddbQDxTSxiiR0UaPnn0pNuOgcDgXWs-h3lAw6Fjs8tbJ6XVm_V8HWSPeoT0ik093UJR8oo8lIL1YwViY78BukIeYuw2XVJTPQmUbA2vQyg7mpq4J2ZJ4s4iWl4Kj8eP7ciRtHAbfz-lI94',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCgolJHdJ15R59c13A6qamw3L6UUBQBah8A_ceH0bSidJKRy417khUgcalHpR--dsPbNTQp6A2hbMSmXFzPEjw_t6AipjQd7dx352J51fqQlkj9WLFALqaGelj6vAoJ3Q_e7tIeDmJK4fr4cQ9vWweK4inqF61RkZ5q7MxNJaRFeSm6xqL08YH6IPe-iNBoJ-wcffQXqGCVntNVT28_X6v1XR9I3pZV6Gm1Js1o1m06ls2ZxR0wZHr2UiaTK6vPsEylX15bHtv5VNo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-HUDPWVCQzlrbbN3vGY9sULPUK-2Tlrl9JgLKfrzvcWkHSUiupGao6D3kbd-rJiOkC7-cT-LpctY0G46Kpye9S7_QWqQkEpSH8wA7qrmT-c5IdG3OSC3JyQXRYbYGRuMt_UqhtMPC6gL9bhTe1H-foug8fVcA0Q5JYQuyq_WqJdtvZ80_OhodEOMGK5eYyd0whE4qG-hY1Ntr-AAmhputVAU6BpdLlOfT3sc4TDBJ9qRTwSw_Tlei387IGOk4k-_8o9PV_rKH4Oc',
]

export default function HeroSection({ loggedIn, primaryPath, secondaryPath, primaryLabel, secondaryLabel }) {
  return (
    <section className="relative pt-16 pb-24 px-6 overflow-hidden">
      {/* Floating blobs */}
      <div className="floating-blob absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed-dim/20 rounded-full -mr-40 -mt-20 -z-10" />
      <div className="floating-blob absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed/20 rounded-full -ml-20 mb-20 -z-10" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left copy */}
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container-high rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[0.75rem] font-label uppercase tracking-widest font-bold text-primary">
              New: Gemini-2.5 Powered Nutrition
            </span>
          </div>
          <h1 className="text-[3rem] md:text-[4rem] lg:text-[4.5rem] leading-[1.08] font-headline font-black tracking-tight text-on-surface mb-8">
            Your AI <span className="text-primary">Nutritionist</span>, Anytime
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            Stop guessing your diet. NutriTalk uses advanced curation AI to build real-time meal plans,
            track metrics, and answer your health questions instantly.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to={primaryPath}>
              <Button variant="primary" className="px-8 py-4 text-lg shadow-primary">
                {primaryLabel}
              </Button>
            </Link>
            <Link to={secondaryPath}>
              <Button variant="secondary" className="px-8 py-4 text-lg">
                {secondaryLabel}
              </Button>
            </Link>
          </div>
          {/* Social proof */}
          <div className="flex items-center gap-5">
            <div className="flex -space-x-3">
              {avatarUrls.map((src, i) => (
                <img key={i} src={src} alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider">
              Join 12k+ Active Users
            </p>
          </div>
        </div>

        {/* Right visual */}
        <div className="flex-1 relative w-full max-w-lg mx-auto">
          <div className="relative w-full aspect-square">
            <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVGJ6blpJu2YGwCgxdbyLFSX8qfzbbfdbVYUg9hVQJAEnTslUH_wZ-G8QzPtYnSj5JE8yasGcEJXs0_3P_XtU0haMDDu4oWq9AFCApcxn_e5b_E-XDJrhxd0-gF3DaJWSmIYPheIRCfIrKwH7J-K6W0yxWlNrUhdi4kfxB68ia_rMddEHNn5WBfxOUy5LI1w-TDIGmfurC966AuFm5iqGcV6Iu6odf6zKWn1P53CdFnzm7Qa6ZcmVHsegCDJKsXTymndah1Ym8qYs"
                alt="Vibrant healthy bowl"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            <GlassCard className="absolute top-8 -left-6 z-20 p-5 w-64">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                </div>
                <p className="font-headline font-bold text-sm">AI Nutritionist</p>
              </div>
              <p className="text-xs leading-relaxed text-on-surface-variant bg-surface-container-low/50 p-3 rounded-lg">
                "Based on your 5k run, I recommend a high-protein breakfast with complex carbs..."
              </p>
            </GlassCard>
            <GlassCard className="absolute bottom-7 -right-6 z-20 p-6 w-52">
              <p className="font-label text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Daily Progress</p>
              <div className="flex justify-between items-end gap-1.5 h-15">
                {[48, 64, 96, 56, 80].map((h, i) => (
                  <div
                    key={i}
                    className={`w-3 rounded-full ${i === 2 ? 'primary-gradient' : 'bg-primary-fixed'}`}
                    style={{ height: h }}
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-headline font-bold text-xl">84%</span>
                <span className="text-[10px] font-label font-bold text-secondary">+12% vs last week</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}
