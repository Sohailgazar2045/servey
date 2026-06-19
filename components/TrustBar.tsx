const STATS = [
  { value: '500+',  label: 'Assessments Completed'      },
  { value: '< 3m',  label: 'Average Completion Time'    },
  { value: '8',     label: 'Compliance Domains Covered' },
  { value: '80pts', label: 'Scoring Framework'          },
]

export default function TrustBar() {
  return (
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-200">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center md:px-6 first:pl-0 last:pr-0"
              data-reveal
              data-reveal-delay={String(i * 100)}
            >
              <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
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
