import GlassCard from '../GlassCard'

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

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-6 overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[1.75rem] font-headline font-bold text-on-surface mb-16 text-center">
          Loved by Wellness Seekers
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {testimonials.map(({ name, role, quote, avatar }, i) => (
            <GlassCard key={name} className={`p-8 ${i === 1 ? 'lg:-translate-y-8' : ''}`}>
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
  )
}
