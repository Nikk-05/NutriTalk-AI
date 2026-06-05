import { useState } from 'react'
import { FAQ_ITEMS } from '../../constants/appConstants'

// Accordion FAQ — single-open behavior so the section stays compact. State is
// the index of the currently open item (null = all closed).
export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section id="faq" className="py-24 px-6 scroll-mt-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-[0.75rem] font-label font-bold uppercase tracking-widest text-primary mb-3">
            FAQ
          </p>
          <h2 className="text-[1.75rem] md:text-4xl font-headline font-bold text-on-surface mb-4">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIdx === i
            return (
              <div
                key={item.q}
                className={`bg-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'shadow-ambient' : 'shadow-ambient-sm'}`}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-surface-container/50 transition-colors"
                  aria-expanded={open}
                >
                  <span className="font-headline font-bold text-on-surface">{item.q}</span>
                  <span
                    className={`material-symbols-outlined text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-on-surface-variant leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
