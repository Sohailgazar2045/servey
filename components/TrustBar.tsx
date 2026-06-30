const STATS = [
  { value: '500+',  label: 'Assessments Completed'      },
  { value: '< 3m',  label: 'Average Completion Time'    },
  { value: '8',     label: 'Compliance Domains Covered' },
  { value: '80pt',  label: 'Scoring Framework'          },
]

export default function TrustBar() {
  return (
    <section className="relative bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-8">
          Built for regulated industries
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:divide-x divide-slate-200">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center md:px-6"
              data-reveal
              data-reveal-delay={String(i * 100)}
            >
              <div className="text-4xl font-bold tracking-tight text-slate-900 mb-1.5">
                {stat.value}
              </div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
