import { ClipboardList, BarChart3, FileDown } from 'lucide-react'
import SectionHeading from './SectionHeading'

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
      'Download a professional PDF with your score, AI-identified strengths and gaps, prioritized recommendations, and a complete audit trail.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* heading */}
        <SectionHeading
          className="mb-16"
          eyebrow="Process"
          title="From question to report in three steps"
          subtitle="No consultants, no lengthy forms. Get a clear picture of your compliance posture in the time it takes to drink a cup of coffee."
        />

        {/* steps */}
        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
          {STEPS.map(({ number, Icon, title, description }, i) => (
            <div
              key={number}
              data-reveal
              data-reveal-delay={String(i * 100)}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Step {number}
                </span>
              </div>
              <h3 className="text-slate-900 text-lg font-semibold mb-2">{title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
