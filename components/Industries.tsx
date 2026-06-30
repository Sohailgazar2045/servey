import { Radio, Cpu, Wifi, Briefcase, Scale, Building2 } from 'lucide-react'
import SectionHeading from './SectionHeading'

const INDUSTRIES = [
  {
    Icon: Radio,
    name: 'Broadcasters',
    description:
      'TV and radio licensees managing license renewals, EAS obligations, online public file requirements, and political advertising rules.',
  },
  {
    Icon: Cpu,
    name: 'Manufacturers',
    description:
      'Equipment manufacturers navigating Part 15 authorization, SAR limits, labeling requirements, and FCC equipment certification.',
  },
  {
    Icon: Wifi,
    name: 'Telecom Providers',
    description:
      'Carriers and ISPs managing CPNI rules, 911 service obligations, USF contributions, and interconnection compliance.',
  },
  {
    Icon: Briefcase,
    name: 'Consultants',
    description:
      "Compliance professionals conducting readiness assessments and gap analyses for clients subject to FCC jurisdiction.",
  },
  {
    Icon: Scale,
    name: 'Law Firms',
    description:
      'Attorneys advising clients on FCC regulatory exposure, preparing for enforcement proceedings, and responding to inquiries.',
  },
  {
    Icon: Building2,
    name: 'Other Organizations',
    description:
      'Any entity operating under FCC jurisdiction that needs a clear, documented picture of their current compliance standing.',
  },
]

export default function Industries() {
  return (
    <section id="industries" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* heading */}
        <SectionHeading
          className="mb-16"
          eyebrow="Who It's For"
          title="Built for every regulated entity"
          subtitle="The assessment adapts its AI analysis to your industry — so recommendations are specific to your regulatory context, not generic boilerplate."
        />

        {/* cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES.map(({ Icon, name, description }, i) => (
            <div
              key={name}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200"
              data-reveal
              data-reveal-delay={String((i % 3) * 100)}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-slate-900 font-semibold text-[17px] mb-2">{name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
