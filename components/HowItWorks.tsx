import { ClipboardList, BarChart3, FileDown } from 'lucide-react'
import type { FC } from 'react'

const STEPS = [
  {
    number: '01',
    Icon: ClipboardList,
    title: 'Complete the Assessment',
    description:
      'Answer 8 targeted questions covering critical FCC compliance domains — from documentation practices to audit readiness. Takes under 3 minutes.',
  },
  {
    number: '02',
    Icon: BarChart3,
    title: 'Receive Your Score',
    description:
      'Get an instant compliance score out of 80 points, mapped to a risk tier. AI analyzes your specific responses for industry-relevant context.',
  },
  {
    number: '03',
    Icon: FileDown,
    title: 'Download Your Report',
    description:
      "Download a professional PDF with your score, AI-identified strengths and gaps, prioritized recommendations, and a complete audit trail.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* heading */}
        <div className="max-w-xl mb-20" data-reveal>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Process
          </p>
          <h2 className="text-slate-900 text-4xl font-bold tracking-tight leading-tight mb-5">
            From question to report in three steps
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            No consultants, no lengthy forms. Get a clear picture of your compliance posture in
            the time it takes to drink a cup of coffee.
          </p>
        </div>

        {/* steps */}
        <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px bg-slate-200" />

          {STEPS.map(({ number, Icon, title, description }, i) => (
            <div
              key={number}
              data-reveal
              data-reveal-delay={String(i * 150)}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative z-10 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-slate-200 text-4xl font-bold tracking-tighter select-none">
                  {number}
                </span>
              </div>
              <h3 className="text-slate-900 text-xl font-semibold mb-3">{title}</h3>
              <p className="text-slate-500 text-base leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
