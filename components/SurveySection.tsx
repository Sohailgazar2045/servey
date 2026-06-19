import Survey from './Survey'

export default function SurveySection() {
  return (
    <section id="survey" className="py-24 bg-white border-t border-slate-200 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* heading */}
        <div className="text-center mb-12">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Free · No Account Required
          </p>
          <h2 className="text-slate-900 text-4xl font-bold tracking-tight leading-tight mb-4">
            Take the FCC Compliance Assessment
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto">
            Complete the form below. Your compliance score, risk level, and AI-generated
            recommendations appear instantly — along with a downloadable PDF report.
          </p>
        </div>

        <Survey />
      </div>
    </section>
  )
}
