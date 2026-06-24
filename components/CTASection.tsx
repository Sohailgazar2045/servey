import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section id="assessment" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl overflow-hidden px-8 md:px-16 py-20 text-center"
          data-reveal
        >
          {/* dot texture overlay */}
          <div className="absolute inset-0 dot-pattern" />

          {/* subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto">
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
              Free Survey
            </p>
            <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              Ready to know where you stand?
            </h2>
            <p className="text-blue-100/80 text-lg leading-relaxed mb-10">
              Take the 3-minute assessment and walk away with a compliance score, risk rating,
              and a report you can act on — or hand directly to counsel.
            </p>

            <a
              href="#survey"
              className="group inline-flex items-center gap-3 bg-white text-blue-700 hover:text-blue-600 font-semibold text-[17px] px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-2xl hover:shadow-blue-900/40"
            >
              Start the Free Survey
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>

            <p className="text-blue-300/60 text-sm mt-5">
              No account required · Results delivered instantly
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
