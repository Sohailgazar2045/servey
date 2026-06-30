import { ArrowRight, CheckCircle } from 'lucide-react'
import ScoreCard from './ScoreCard'

const PROOF_POINTS = [
  'Under 3 minutes to complete',
  'AI-powered analysis',
  'Instant PDF report',
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* quiet background grid, faded out at the edges */}
      <div className="absolute inset-0 hero-grid grid-mask pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-center">

          {/* ── Left column ── */}
          <div>
            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold mb-6">
              <span className="w-6 h-px bg-blue-600" />
              FCC Compliance Assessment Platform
            </div>

            <h1 className="text-slate-900 font-bold text-5xl xl:text-[58px] leading-[1.05] tracking-tight mb-6">
              Know exactly where<br />
              you stand on<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500">
                FCC compliance
              </span>
            </h1>

            <p className="text-slate-600 text-lg leading-relaxed mb-9 max-w-[540px]">
              Answer 8 questions and receive an instant compliance score, risk rating, and
              AI-generated recommendations — documented and ready to share with counsel.
            </p>

            {/* proof points */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 mb-9">
              {PROOF_POINTS.map((point) => (
                <div key={point} className="flex items-center gap-2 text-slate-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {point}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#assessment"
                className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] px-6 py-3 rounded-lg transition-colors"
              >
                Take the Free Survey
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center text-slate-700 hover:text-slate-900 font-semibold text-[15px] px-5 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* ── Right column — Score card ── */}
          <div className="hidden lg:flex justify-end">
            <ScoreCard />
          </div>
        </div>
      </div>
    </section>
  )
}
