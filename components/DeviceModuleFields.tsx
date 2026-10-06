'use client'

import { AlertTriangle, AlertCircle, Info, ChevronDown } from 'lucide-react'
import {
  DEVICE_TYPES, YES_NO_NOTSURE, YES_NO_UNSURE, YES_NO, MARKETS, TECHNOLOGIES,
  ANTENNA_TYPES, INTEGRATION_TYPES, HOST_CATEGORIES, POWER_SOURCES, DOCUMENTATION,
  hasTransmitter,
  type DeviceAnswers, type Option, type RiskFlag, type Severity,
} from '@/lib/deviceSurvey'

// ─── Field components ─────────────────────────────────────────────────────────

export const inputCls = (err?: string) =>
  `w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors duration-150 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 ${
    err ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'
  }`

export function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-slate-400 text-xs mb-2">{hint}</p>}
      <div className={hint ? '' : 'mt-1.5'}>{children}</div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  )
}

function Choice({ options, value, onChange }: {
  options: Option[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {options.map(o => {
        const selected = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={selected}
            className={`py-2.5 px-3 rounded-lg border font-semibold text-sm transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-1 ${
              selected
                ? 'bg-brand-teal border-brand-teal text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function MultiChoice({ options, values, onChange }: {
  options: Option[]; values: string[]; onChange: (v: string[]) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {options.map(o => {
        const checked = values.includes(o.value)
        return (
          <label
            key={o.value}
            className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg border text-sm font-semibold cursor-pointer select-none transition-colors ${
              checked
                ? 'bg-brand-teal/10 border-brand-teal text-brand-teal-dark'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(checked ? values.filter(v => v !== o.value) : [...values, o.value])}
              className="h-4 w-4 shrink-0 accent-brand-teal"
            />
            {o.label}
          </label>
        )
      })}
    </div>
  )
}

// ─── Device module questions ──────────────────────────────────────────────────

/** Renders the questions of one device module (0-based, see MODULES). */
export function DeviceModuleFields({ module, answers, set, errors }: {
  module:  number
  answers: DeviceAnswers
  set:     <K extends keyof DeviceAnswers>(key: K, value: DeviceAnswers[K]) => void
  errors:  Record<string, string>
}) {
  const tx = hasTransmitter(answers)
  const optionalNote = !tx && (module === 1 || module === 2) && (
    <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
      <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      You indicated the device does not transmit RF, so this module is optional.
    </div>
  )

  if (module === 0) return (
    <>
      <Field label="What type of device is being evaluated?" error={errors.deviceType}>
        <div className="relative">
          <select
            value={answers.deviceType}
            onChange={e => set('deviceType', e.target.value)}
            className={`${inputCls(errors.deviceType)} appearance-none pr-9 cursor-pointer ${answers.deviceType ? '' : 'text-slate-400'}`}
          >
            <option value="" disabled>Select a device type</option>
            {DEVICE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </Field>
      {answers.deviceType === 'other' && (
        <Field label="Describe the device type" error={errors.deviceTypeOther}>
          <input
            value={answers.deviceTypeOther}
            onChange={e => set('deviceTypeOther', e.target.value)}
            placeholder="e.g. LoRa gateway"
            className={inputCls(errors.deviceTypeOther)}
          />
        </Field>
      )}
      <Field label="What is the device's primary function?" error={errors.primaryFunction}>
        <textarea
          rows={3}
          value={answers.primaryFunction}
          onChange={e => set('primaryFunction', e.target.value)}
          placeholder="e.g. Battery-powered smart thermostat that reports temperature over Wi-Fi"
          className={`${inputCls(errors.primaryFunction)} resize-y`}
        />
      </Field>
      <Field label="Does the device intentionally transmit RF signals?" error={errors.intentionalTransmit}>
        <Choice options={YES_NO_NOTSURE} value={answers.intentionalTransmit} onChange={v => set('intentionalTransmit', v)} />
      </Field>
      <Field label="Is the device consumer or industrial?" error={errors.market}>
        <Choice options={MARKETS} value={answers.market} onChange={v => set('market', v)} />
      </Field>
    </>
  )

  if (module === 1) return (
    <>
      {optionalNote}
      <Field label="Which wireless technologies are used?" hint="Select all that apply." error={errors.technologies}>
        <MultiChoice options={TECHNOLOGIES} values={answers.technologies} onChange={v => set('technologies', v)} />
      </Field>
      <Field label="Antenna type" error={errors.antennaType}>
        <Choice options={ANTENNA_TYPES} value={answers.antennaType} onChange={v => set('antennaType', v)} />
      </Field>
      <Field label="Operating frequency band (MHz or GHz)" hint="List every band the device uses. Leave blank if unknown.">
        <input
          value={answers.frequencyBand}
          onChange={e => set('frequencyBand', e.target.value)}
          placeholder="e.g. 2400–2483.5 MHz, 5150–5850 MHz"
          className={inputCls()}
        />
      </Field>
      <Field label="Maximum transmit power" hint="If known, e.g. 20 dBm or 100 mW.">
        <input
          value={answers.maxTxPower}
          onChange={e => set('maxTxPower', e.target.value)}
          placeholder="e.g. 20 dBm"
          className={inputCls()}
        />
      </Field>
    </>
  )

  if (module === 2) return (
    <>
      {optionalNote}
      <Field label="Is the device using a pre-certified RF module?" error={errors.preCertifiedModule}>
        <Choice options={YES_NO_UNSURE} value={answers.preCertifiedModule} onChange={v => set('preCertifiedModule', v)} />
      </Field>
      {answers.preCertifiedModule === 'yes' && (
        <div className="grid gap-6 rounded-lg border border-slate-200 bg-slate-50/70 p-5">
          <Field label="Module manufacturer" hint="Include the part number or FCC ID if you have it.">
            <input
              value={answers.moduleManufacturer}
              onChange={e => set('moduleManufacturer', e.target.value)}
              placeholder="e.g. Espressif ESP32-WROOM-32E (FCC ID 2AC7Z-ESP32WROOME)"
              className={inputCls()}
            />
          </Field>
          <Field label="Integration type">
            <Choice options={INTEGRATION_TYPES} value={answers.integrationType} onChange={v => set('integrationType', v)} />
          </Field>
        </div>
      )}
      <Field label="Has the module antenna been modified?" error={errors.antennaModified}>
        <Choice options={YES_NO} value={answers.antennaModified} onChange={v => set('antennaModified', v)} />
      </Field>
    </>
  )

  if (module === 3) return (
    <>
      <Field label="What product category is the host device?" error={errors.hostCategory}>
        <Choice options={HOST_CATEGORIES} value={answers.hostCategory} onChange={v => set('hostCategory', v)} />
      </Field>
      <Field label="Does the device connect to a computer network?" error={errors.networkConnected}>
        <Choice options={YES_NO_NOTSURE} value={answers.networkConnected} onChange={v => set('networkConnected', v)} />
      </Field>
      <Field label="Power source" hint="Select all that apply." error={errors.powerSources}>
        <MultiChoice options={POWER_SOURCES} values={answers.powerSources} onChange={v => set('powerSources', v)} />
      </Field>
    </>
  )

  return (
    <>
      <Field label="Has pre-compliance testing been conducted?" error={errors.preComplianceTested}>
        <Choice options={YES_NO} value={answers.preComplianceTested} onChange={v => set('preComplianceTested', v)} />
      </Field>
      <Field label="Does the product have:" hint="Select all documents that are available.">
        <MultiChoice options={DOCUMENTATION} values={answers.documentation} onChange={v => set('documentation', v)} />
      </Field>
      <Field label="Is there firmware controlling RF behavior?" error={errors.rfFirmware}>
        <Choice options={YES_NO_NOTSURE} value={answers.rfFirmware} onChange={v => set('rfFirmware', v)} />
      </Field>
    </>
  )
}

// ─── Result pieces ────────────────────────────────────────────────────────────

export const SEVERITY_STYLE: Record<Severity, { pill: string; Icon: typeof AlertTriangle; icon: string; label: string }> = {
  high:   { pill: 'bg-red-100 text-red-700 border-red-200',          Icon: AlertTriangle, icon: 'text-brand-high',     label: 'High' },
  medium: { pill: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: AlertCircle,   icon: 'text-brand-moderate', label: 'Medium' },
  low:    { pill: 'bg-slate-100 text-slate-600 border-slate-200',    Icon: Info,          icon: 'text-slate-400',      label: 'Low' },
}

export function FlagRow({ flag }: { flag: RiskFlag }) {
  const s = SEVERITY_STYLE[flag.severity]
  return (
    <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <s.Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.icon}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-slate-900 font-semibold text-sm">{flag.title}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${s.pill}`}>{s.label}</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{flag.category}</p>
        <p className="text-slate-600 text-[14px] leading-relaxed">{flag.detail}</p>
      </div>
    </div>
  )
}
