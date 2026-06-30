import { BarChart2, Bot, FileText, Lock, ShieldCheck, Clock } from 'lucide-react'

const FEATURES = [
  {
    Icon: BarChart2,
    title: '80-Point Scoring Framework',
    description:
      'A structured model across 8 FCC compliance domains, weighted by regulatory impact and tied to documented best practices.',
  },
  {
    Icon: Bot,
    title: 'AI-Powered Analysis',
    description:
      "Gemini analyzes your specific responses to generate targeted strengths, gaps, and recommendations — not generic templates copied from a checklist.",
  },
  {
    Icon: FileText,
    title: 'Professional PDF Report',
    description:
      'A formatted report with cover page, score summary, detailed Q&A findings, AI recommendations, and full audit metadata.',
  },
  {
    Icon: Lock,
    title: 'Secure Audit Trail',
    description:
      'Every submission is logged with a timestamped record — submission date, user, survey version, all responses, and the score generated.',
  },
  {
    Icon: ShieldCheck,
    title: 'Risk Tier Classification',
    description:
      'Scores map to Low, Moderate, or High Risk tiers so you immediately know where to focus remediation efforts and communicate exposure to leadership.',
  },
  {
    Icon: Clock,
    title: 'Results in Under 3 Minutes',
    description:
      'The entire assessment — from first question to downloadable report — completes in less time than your next conference call.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-28 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">

        {/* heading */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-reveal>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Platform Capabilities
          </p>
          <h2 className="text-slate-900 text-4xl font-bold tracking-tight leading-tight mb-5">
            Everything you need to surface compliance risk
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Designed for the pace of regulatory work — fast to complete, detailed in output,
            ready to share with clients, counsel, or leadership.
          </p>
        </div>

        {/* feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <div
              key={title}
              className="group bg-white hover:bg-slate-50 p-8 transition-colors duration-300"
              data-reveal
              data-reveal-delay={String((i % 3) * 100)}
            >
              <div className="w-10 h-10 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-slate-900 font-semibold text-[15px] mb-2.5">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
