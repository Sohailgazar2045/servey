import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section id="assessment" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative bg-blue-700 rounded-2xl overflow-hidden px-8 md:px-16 py-20 text-center"
          data-reveal
        >
          {/* dot texture overlay */}
          <div className="absolute inset-0 dot-pattern opacity-60" />

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-blue-200 text-sm font-semibold mb-5">
              <span className="w-6 h-px bg-blue-300" />
              Free Survey
            </div>
            <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6 text-balance">
              Ready to know where you stand?
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-10 text-pretty">
              Take the 3-minute assessment and walk away with a compliance score, risk rating,
              and a report you can act on — or hand directly to counsel.
            </p>

            <a
              href="#survey"
              className="group inline-flex items-center gap-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-[16px] px-7 py-3.5 rounded-lg transition-colors"
            >
              Start the Free Survey
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>

            <p className="text-blue-200 text-sm mt-5">
              No account required · Results delivered instantly
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
