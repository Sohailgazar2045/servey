import { CheckCircle2, XCircle, AlertCircle, FileText, Shield } from 'lucide-react'

export default function ScoreCard() {
  return (
    <div className="relative w-full max-w-[400px]">
      {/* ambient glow */}
      <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-3xl scale-90" />

      <div className="relative float bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl shadow-slate-900/10">
        {/* card header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-1">
              Compliance Score
            </p>
            <p className="text-slate-500 text-xs">Broadview Communications · Telecom</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-2.5">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* score */}
        <div className="flex items-end gap-1.5 mb-1">
          <span className="text-slate-900 text-[72px] font-bold leading-none tracking-tight">72</span>
          <span className="text-slate-400 text-2xl font-semibold mb-3">/ 80</span>
        </div>

        {/* risk badge */}
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Moderate Risk
        </div>

        {/* score bar */}
        <div className="w-full bg-slate-100 rounded-full h-1 mb-6">
          <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-1 rounded-full w-[90%]" />
        </div>

        {/* findings */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-900 text-[11px] font-semibold mb-0.5">Strength</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Deadline tracking &amp; personnel assignment are fully documented
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-900 text-[11px] font-semibold mb-0.5">Gap Identified</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                No centralized document storage system in place
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-3">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-900 text-[11px] font-semibold mb-0.5">Recommendation</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Establish a centralized compliance repository within 30 days
              </p>
            </div>
          </div>
        </div>

        {/* report row */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-500 text-xs font-medium">Compliance_Report_June2026.pdf</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-emerald-600 text-[10px] font-semibold">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
