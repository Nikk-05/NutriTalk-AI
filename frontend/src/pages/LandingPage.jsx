import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Yoga Instructor',
    quote: '"The AI diet planner felt like it actually knew my cravings but kept me on track. I lost 15lbs in 2 months without feeling restricted."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVgUbtLdqlSoIz3zPNvzNE7Wlm3WbEGWlhjdaIoKHWtaqp_AW8L7gESWZ6ALIiN-CrucSkq8d05KRy9bCfHo7Jo2g_LsaYmF5g3Je9NIRRfTF1BgPjHrX09y-SfQPGB3BrNPPiYCILdnpQ4LZHAUOK4pwc98cp6W_6MHpivqjnwKmuz0LcMKB22IW44TsSEJdnhiHQt1rylaj_TC5bjTqnW3VTY_wHw1K9QDoTn7pJM9EQu5fA17VJzZTC3NuRbwTLvM11XxHZM-E',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    quote: '"The smart insights connected to my Oura ring were a game changer. Now I know exactly which foods help me sleep better."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn4jwf348TLRDyJcA8fTaONYMy930rFpaGi5d7VtZoJNNS4AYMQzRBIAP70XnpE5jC4m6qofkGiTBODbLcOIGefoVTHs1Sn7YqY0WqyeVWGOp-7LhjRTXFx--n94gmeCoY37zf919MyfBWxxEBLt7i2PzP_JuzNGP3VyahV6FMhoKxhx4kWJGNydRzX8xXJbpn4W4uPoJbIjihrk_ovGu_1VImXCC_ki7uJxc9344IXoYQ_5pnOxCcstxFqSrwr4uNIKUFzmK2f8U',
  },
  {
    name: 'Marcus Thorne',
    role: 'Creative Director',
    quote: '"I love the editorial feel. It doesn\'t look like a boring spreadsheet. NutriTalk makes health feel like a lifestyle, not a chore."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcM6dmBz8Rz3n1g0jDKk3J-TCH_mVWMlHPIDDwKyL1dahcCG-XQ35AXAtKWYmJteQyNTIOrXX820J0mUSurVJqy0KXoA9j7TorbvDEWsGBl501eY0qo1_0apptrJzKFIHg656XdSMg0Y9Vpcdj5XMmHRGD7prGgCl4Xe82VWK73Aofbc0ogUGVEVNfHzr9YF1n1-mNWIYtuzY7PZpJ5Z66kZchcmGfOkkrN88spOCytm6JcZvvY2vpOlsCIOUF1NYLHoDsO_-2Bj0',
  },
]

const avatarUrls = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnUSRFNhKlBrws8L8Ob1CZPle7vpljORRIpVxIG-uVLpQ126WpX79HWBV5Q1ivjAtSGl2gWPRnSpLaRkTPDesrl3HsFSqB2PClIf0zgbYqQPYoBhgtXb5YkuRGhXVDuddbQDxTSxiiR0UaPnn0pNuOgcDgXWs-h3lAw6Fjs8tbJ6XVm_V8HWSPeoT0ik093UJR8oo8lIL1YwViY78BukIeYuw2XVJTPQmUbA2vQyg7mpq4J2ZJ4s4iWl4Kj8eP7ciRtHAbfz-lI94',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCgolJHdJ15R59c13A6qamw3L6UUBQBah8A_ceH0bSidJKRy417khUgcalHpR--dsPbNTQp6A2hbMSmXFzPEjw_t6AipjQd7dx352J51fqQlkj9WLFALqaGelj6vAoJ3Q_e7tIeDmJK4fr4cQ9vWweK4inqF61RkZ5q7MxNJaRFeSm6xqL08YH6IPe-iNBoJ-wcffQXqGCVntNVT28_X6v1XR9I3pZV6Gm1Js1o1m06ls2ZxR0wZHr2UiaTK6vPsEylX15bHtv5VNo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-HUDPWVCQzlrbbN3vGY9sULPUK-2Tlrl9JgLKfrzvcWkHSUiupGao6D3kbd-rJiOkC7-cT-LpctY0G46Kpye9S7_QWqQkEpSH8wA7qrmT-c5IdG3OSC3JyQXRYbYGRuMt_UqhtMPC6gL9bhTe1H-foug8fVcA0Q5JYQuyq_WqJdtvZ80_OhodEOMGK5eYyd0whE4qG-hY1Ntr-AAmhputVAU6BpdLlOfT3sc4TDBJ9qRTwSw_Tlei387IGOk4k-_8o9PV_rKH4Oc',
]

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ────────────────────────────────────────── */}
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
                New: GPT-4o Powered Nutrition
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
              <Link to="/signup">
                <Button variant="primary" className="px-8 py-4 text-lg shadow-primary">
                  Start Your Plan
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="secondary" className="px-8 py-4 text-lg">
                  Chat with AI
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
              {/* Food image */}
              <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVGJ6blpJu2YGwCgxdbyLFSX8qfzbbfdbVYUg9hVQJAEnTslUH_wZ-G8QzPtYnSj5JE8yasGcEJXs0_3P_XtU0haMDDu4oWq9AFCApcxn_e5b_E-XDJrhxd0-gF3DaJWSmIYPheIRCfIrKwH7J-K6W0yxWlNrUhdi4kfxB68ia_rMddEHNn5WBfxOUy5LI1w-TDIGmfurC966AuFm5iqGcV6Iu6odf6zKWn1P53CdFnzm7Qa6ZcmVHsegCDJKsXTymndah1Ym8qYs"
                  alt="Vibrant healthy bowl"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>
              {/* Glass card: AI chat */}
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
              {/* Glass card: Stats */}
              <GlassCard className="absolute bottom-10 -right-6 z-20 p-6 w-52">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Daily Progress</p>
                <div className="flex justify-between items-end gap-1.5 h-10">
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

      {/* ── Bento Grid Features ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-[1.75rem] font-headline font-bold text-on-surface mb-4">Precision Intelligence</h2>
            <div className="w-20 h-1.5 primary-gradient rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large bento */}
            <div className="md:col-span-2 bg-surface-container-lowest rounded-lg p-10 flex flex-col justify-between group hover:shadow-ambient transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed-dim/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">restaurant_menu</span>
                <h3 className="text-3xl font-headline font-bold text-on-surface mb-4">AI Diet Planner</h3>
                <p className="text-on-surface-variant max-w-md text-lg">
                  Hyper-personalized meal sequences that adapt to your pantry, allergies, and metabolic goals in real-time.
                </p>
              </div>
              <Link to="/diet-plan" className="mt-12 flex items-center gap-2 text-primary font-headline font-bold group/link">
                <span>Explore Planning</span>
                <span className="material-symbols-outlined group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            {/* Small bento 1 */}
            <div className="bg-surface-container-lowest rounded-lg p-10 group hover:shadow-ambient transition-all duration-500">
              <span className="material-symbols-outlined text-secondary text-4xl mb-6 block">monitoring</span>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Calorie Tracker</h3>
              <p className="text-on-surface-variant">Log meals via photo or text. Our vision AI breaks down macros in seconds.</p>
            </div>
            {/* Small bento 2 */}
            <div className="bg-primary text-on-primary rounded-lg p-10 group hover:shadow-primary transition-all duration-500">
              <span className="material-symbols-outlined text-primary-fixed text-4xl mb-6 block">psychology</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Smart Insights</h3>
              <p className="text-white/80">Connect your wearable data for biological correlations between food and energy.</p>
            </div>
            {/* Wide bento bottom */}
            <div className="md:col-span-2 bg-surface-container-lowest rounded-lg p-10 flex flex-col md:flex-row gap-8 items-center group hover:shadow-ambient transition-all duration-500">
              <div className="flex-1">
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Global Recipe Database</h3>
                <p className="text-on-surface-variant mb-6">
                  Access over 50,000+ nutritionally validated recipes from world-renowned chefs and dietitians.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['Keto', 'Vegan', 'Paleo'].map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </div>
              <div className="w-full md:w-64 aspect-video rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Au8Y0gNURmKi-WbdTKjzR5GCmdj6WsOw5iYUgal8ca9SzTfWVsFgIIDFm4pPOUC8OuYkGzsrCHTR-lrzmwAjx0a-a_lQ4FTznPX6M8TEDMl4ZNMYRO0YoDQnASkF4TLFkrsi-B0xkcd1xAUHAjuFXZvW51hlBu3CaGSLHHspEJgGxlpSPpM14yLzhLY-6K-AN2z1GZGOOQmutO1RpY1cYa6Hf_dNzK0bkISfXPKRXq3qqLsvpt3wgF14H5-o4"
                  alt="Meal prep"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[1.75rem] font-headline font-bold text-on-surface mb-16 text-center">
            Loved by Wellness Seekers
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {testimonials.map(({ name, role, quote, avatar }, i) => (
              <GlassCard
                key={name}
                className={`p-8 ${i === 1 ? 'lg:-translate-y-8' : ''}`}
              >
                <div className="flex gap-1 text-secondary mb-6">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-on-surface mb-8 italic leading-relaxed">{quote}</p>
                <div className="flex items-center gap-4">
                  <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-headline font-bold">{name}</p>
                    <p className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">{role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-6">
            Start your health journey today
          </h2>
          <p className="text-lg text-on-surface-variant mb-10">
            Join thousands who've transformed their relationship with food using AI.
          </p>
          <Link to="/signup">
            <Button variant="primary" className="px-12 py-4 text-lg shadow-primary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
