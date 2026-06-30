import Survey from './Survey'
import SectionHeading from './SectionHeading'

export default function SurveySection() {
  return (
    <section id="survey" className="relative py-24 bg-slate-50 border-t border-slate-200/80 scroll-mt-16">
      <div className="absolute inset-0 hero-grid grid-mask opacity-60 pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-6">

        {/* heading */}
        <SectionHeading
          className="mb-12"
          eyebrow="Free · No Account Required"
          title="Take the FCC Compliance Assessment"
          subtitle="Complete the form below. Your compliance score, risk level, and AI-generated recommendations appear instantly — along with a downloadable PDF report."
        />

        <Survey />
      </div>
    </section>
  )
}
