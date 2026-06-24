import { ArrowRight, CheckCircle } from 'lucide-react'
import ScoreCard from './ScoreCard'

const PROOF_POINTS = [
  'Under 3 minutes to complete',
  'AI-powered analysis',
  'Instant PDF report',
]

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-brand-navy hero-grid flex items-center overflow-hidden">
      {/* radial glow — top left */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
      {/* radial glow — bottom right */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-center">

          {/* ── Left column ── */}
          <div>
            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              FCC Compliance Assessment Platform
            </div>

            <h1 className="text-white font-bold text-5xl xl:text-[58px] leading-[1.08] tracking-tight mb-6">
              Know Exactly Where{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                You Stand on FCC Compliance
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-9 max-w-[520px]">
              Answer 8 questions. Receive an instant compliance score, risk rating, and
              AI-generated recommendations — documented and ready to share with counsel.
            </p>

            {/* proof points */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 mb-10">
              {PROOF_POINTS.map((point) => (
                <div key={point} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {point}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#assessment"
                className="group inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30"
              >
                Take the Free Survey
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center text-slate-400 hover:text-white font-medium text-[15px] px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors duration-200"
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
