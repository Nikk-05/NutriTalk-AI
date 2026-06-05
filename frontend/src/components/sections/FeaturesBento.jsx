import { Link } from 'react-router-dom'
import Badge from '../Badge'

// Features bento grid — anchor target #features. The "Explore Planning" link
// scrolls to How-it-Works for logged-out visitors instead of forcing signup.
export default function FeaturesBento({ planPath, exploreScrollTarget = '#how-it-works', loggedIn }) {
  const handleExploreClick = (e) => {
    if (!loggedIn) {
      e.preventDefault()
      const el = document.getElementById(exploreScrollTarget.replace(/^#/, ''))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="features" className="py-24 px-6 bg-surface-container-low scroll-mt-24">
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
            <Link
              to={loggedIn ? planPath : exploreScrollTarget}
              onClick={handleExploreClick}
              className="mt-12 flex items-center gap-2 text-primary font-headline font-bold group/link"
            >
              <span>{loggedIn ? 'Explore Planning' : 'See How It Works'}</span>
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
                src="https://images.unsplash.com/photo-1668665771757-4d42737d295a?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Meal prep"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
