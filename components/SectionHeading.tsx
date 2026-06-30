import type { ReactNode } from 'react'

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: {
  eyebrow:   string
  title:     ReactNode
  subtitle?: ReactNode
  align?:    'center' | 'left'
  className?: string
}) {
  const isCenter = align === 'center'

  return (
    <div className={`${isCenter ? 'text-center mx-auto max-w-2xl' : 'max-w-xl'} ${className}`} data-reveal>
      <div className={`flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4 ${isCenter ? 'justify-center' : ''}`}>
        <span className="w-6 h-px bg-blue-600" />
        {eyebrow}
      </div>

      <h2 className="text-slate-900 text-[32px] sm:text-[38px] font-bold tracking-tight leading-[1.12] mb-4 text-balance">
        {title}
      </h2>

      {subtitle && (
        <p className="text-slate-600 text-lg leading-relaxed text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}
