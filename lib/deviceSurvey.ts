/**
 * AethyrLex Pre-Survey — device / RF compliance readiness.
 *
 * Device / RF modules of the homepage survey, shared by the client (Survey)
 * and the API route (/api/submit).
 * Risk flags are produced by fixed rules so the same answers always yield the
 * same findings; AI is only used afterwards to write the narrative report.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Option { value: string; label: string }

export interface DeviceAnswers {
  // Module 1 — Device Identification
  deviceType:          string
  deviceTypeOther:     string
  primaryFunction:     string
  intentionalTransmit: string
  market:              string
  // Module 2 — RF Technology
  technologies:        string[]
  antennaType:         string
  frequencyBand:       string
  maxTxPower:          string
  // Module 3 — Module Integration
  preCertifiedModule:  string
  moduleManufacturer:  string
  integrationType:     string
  antennaModified:     string
  // Module 4 — Host Device Environment
  hostCategory:        string
  networkConnected:    string
  powerSources:        string[]
  // Module 5 — Testing Readiness
  preComplianceTested: string
  documentation:       string[]
  rfFirmware:          string
}

export type Severity = 'high' | 'medium' | 'low'

export type RiskCategory =
  | 'Missing RF Data'
  | 'Non-Certified Module'
  | 'Multiple Radios'
  | 'Unclear Frequency Band'
  | 'Antenna Modification'
  | 'Testing Readiness'

export interface RiskFlag {
  id:       string
  category: RiskCategory
  severity: Severity
  title:    string
  detail:   string
}

export interface Readiness {
  level: string
  badge: 'low' | 'moderate' | 'high'
}

// ─── Options ──────────────────────────────────────────────────────────────────

export const DEVICE_TYPES: Option[] = [
  { value: 'wifi',          label: 'Wi-Fi Device' },
  { value: 'bluetooth',     label: 'Bluetooth Device' },
  { value: 'zigbee_iot',    label: 'Zigbee / IoT Device' },
  { value: 'intentional',   label: 'Intentional Radiator' },
  { value: 'unintentional', label: 'Unintentional Radiator' },
  { value: 'other',         label: 'Other' },
]

export const YES_NO_NOTSURE: Option[] = [
  { value: 'yes',      label: 'Yes' },
  { value: 'no',       label: 'No' },
  { value: 'not_sure', label: 'Not Sure' },
]

export const YES_NO_UNSURE: Option[] = [
  { value: 'yes',    label: 'Yes' },
  { value: 'no',     label: 'No' },
  { value: 'unsure', label: 'Unsure' },
]

export const YES_NO: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No' },
]

export const MARKETS: Option[] = [
  { value: 'consumer',   label: 'Consumer' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'both',       label: 'Both' },
]

export const TECHNOLOGIES: Option[] = [
  { value: 'wifi',        label: 'Wi-Fi' },
  { value: 'bluetooth',   label: 'Bluetooth' },
  { value: 'cellular',    label: 'Cellular' },
  { value: 'nfc',         label: 'NFC' },
  { value: 'proprietary', label: 'Proprietary RF' },
]

export const ANTENNA_TYPES: Option[] = [
  { value: 'integrated', label: 'Integrated' },
  { value: 'external',   label: 'External' },
  { value: 'modular',    label: 'Modular Antenna' },
]

export const INTEGRATION_TYPES: Option[] = [
  { value: 'soldered', label: 'Soldered / Surface-Mount' },
  { value: 'plug_in',  label: 'Plug-in / Socketed' },
  { value: 'other',    label: 'Other / Not Sure' },
]

export const HOST_CATEGORIES: Option[] = [
  { value: 'smart_home',  label: 'Smart Home Device' },
  { value: 'consumer',    label: 'Consumer Electronics' },
  { value: 'industrial',  label: 'Industrial Equipment' },
  { value: 'medical',     label: 'Medical Device' },
  { value: 'other',       label: 'Other' },
]

export const POWER_SOURCES: Option[] = [
  { value: 'battery', label: 'Battery' },
  { value: 'ac',      label: 'AC Powered' },
  { value: 'usb',     label: 'USB Powered' },
]

export const DOCUMENTATION: Option[] = [
  { value: 'schematics',  label: 'Schematics' },
  { value: 'block',       label: 'Block Diagram' },
  { value: 'operational', label: 'Operational Description' },
]

export const MODULES = [
  'Device Identification',
  'RF Technology',
  'Module Integration',
  'Host Device Environment',
  'Testing Readiness',
] as const

export const EMPTY_ANSWERS: DeviceAnswers = {
  deviceType: '', deviceTypeOther: '', primaryFunction: '',
  intentionalTransmit: '', market: '',
  technologies: [], antennaType: '', frequencyBand: '', maxTxPower: '',
  preCertifiedModule: '', moduleManufacturer: '', integrationType: '', antennaModified: '',
  hostCategory: '', networkConnected: '', powerSources: [],
  preComplianceTested: '', documentation: [], rfFirmware: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function labelOf(options: Option[], value: string): string {
  return options.find(o => o.value === value)?.label ?? value
}

export function labelsOf(options: Option[], values: string[]): string {
  return values.length ? values.map(v => labelOf(options, v)).join(', ') : 'None'
}

const UNKNOWN_RE = /^(unknown|not sure|unsure|n\/?a|tbd|tbc|\?+|-+|none|idk|don'?t know)$/i

function isBlankOrUnknown(s: string): boolean {
  const t = s.trim()
  return !t || UNKNOWN_RE.test(t)
}

const TRANSMITTING_TYPES = ['wifi', 'bluetooth', 'zigbee_iot', 'intentional']

/** True when the answers indicate the device has (or may have) a radio transmitter. */
export function hasTransmitter(a: DeviceAnswers): boolean {
  return a.intentionalTransmit !== 'no'
    || a.technologies.length > 0
    || TRANSMITTING_TYPES.includes(a.deviceType)
}

// Rough band checks for the technologies that have a well-defined band.
const BAND_PATTERNS: Record<string, { re: RegExp; expected: string }> = {
  wifi:      { re: /2[.,]4|24\d\d|\b5(?:[.,]\d+)?\s*g|\b5\d{3}\b|\b6(?:[.,]\d+)?\s*g|\b[67]\d{3}\b/i, expected: '2.4 GHz, 5 GHz or 6 GHz' },
  bluetooth: { re: /2[.,]4|24\d\d/i,  expected: '2.4 GHz' },
  nfc:       { re: /13[.,]56/i,        expected: '13.56 MHz' },
}

// ─── Questions (used for the audit record / responses table) ──────────────────

export function describeAnswers(a: DeviceAnswers): { module: string; question: string; answer: string }[] {
  const tx = hasTransmitter(a)
  const rows: { module: string; question: string; answer: string }[] = [
    { module: MODULES[0], question: 'What type of device is being evaluated?',
      answer: a.deviceType === 'other' && a.deviceTypeOther.trim()
        ? `Other: ${a.deviceTypeOther.trim()}` : labelOf(DEVICE_TYPES, a.deviceType) },
    { module: MODULES[0], question: "What is the device's primary function?", answer: a.primaryFunction.trim() || 'Not provided' },
    { module: MODULES[0], question: 'Does the device intentionally transmit RF signals?', answer: labelOf(YES_NO_NOTSURE, a.intentionalTransmit) },
    { module: MODULES[0], question: 'Is the device consumer or industrial?', answer: labelOf(MARKETS, a.market) },
    { module: MODULES[1], question: 'Which wireless technologies are used?', answer: labelsOf(TECHNOLOGIES, a.technologies) },
    { module: MODULES[1], question: 'Antenna type', answer: a.antennaType ? labelOf(ANTENNA_TYPES, a.antennaType) : 'Not provided' },
    { module: MODULES[1], question: 'Operating frequency band', answer: a.frequencyBand.trim() || 'Not provided' },
    { module: MODULES[1], question: 'Maximum transmit power', answer: a.maxTxPower.trim() || 'Not provided' },
    { module: MODULES[2], question: 'Is the device using a pre-certified RF module?', answer: a.preCertifiedModule ? labelOf(YES_NO_UNSURE, a.preCertifiedModule) : 'Not provided' },
  ]
  if (a.preCertifiedModule === 'yes') {
    rows.push(
      { module: MODULES[2], question: 'Module manufacturer', answer: a.moduleManufacturer.trim() || 'Not provided' },
      { module: MODULES[2], question: 'Integration type', answer: a.integrationType ? labelOf(INTEGRATION_TYPES, a.integrationType) : 'Not provided' },
    )
  }
  rows.push(
    { module: MODULES[2], question: 'Has the module antenna been modified?', answer: a.antennaModified ? labelOf(YES_NO, a.antennaModified) : (tx ? 'Not provided' : 'N/A') },
    { module: MODULES[3], question: 'What product category is the host device?', answer: labelOf(HOST_CATEGORIES, a.hostCategory) },
    { module: MODULES[3], question: 'Does the device connect to a computer network?', answer: labelOf(YES_NO_NOTSURE, a.networkConnected) },
    { module: MODULES[3], question: 'Power source', answer: labelsOf(POWER_SOURCES, a.powerSources) },
    { module: MODULES[4], question: 'Has pre-compliance testing been conducted?', answer: labelOf(YES_NO, a.preComplianceTested) },
    { module: MODULES[4], question: 'Available documentation', answer: labelsOf(DOCUMENTATION, a.documentation) },
    { module: MODULES[4], question: 'Is there firmware controlling RF behavior?', answer: labelOf(YES_NO_NOTSURE, a.rfFirmware) },
  )
  return rows
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Returns field → message for the given module (0-based). */
export function validateModule(step: number, a: DeviceAnswers): Record<string, string> {
  const e: Record<string, string> = {}
  const tx = hasTransmitter(a)
  if (step === 0) {
    if (!a.deviceType) e.deviceType = 'Select a device type'
    if (a.deviceType === 'other' && !a.deviceTypeOther.trim()) e.deviceTypeOther = 'Describe the device type'
    if (!a.primaryFunction.trim()) e.primaryFunction = 'Describe the primary function'
    if (!a.intentionalTransmit) e.intentionalTransmit = 'Select an answer'
    if (!a.market) e.market = 'Select an answer'
  }
  if (step === 1 && tx) {
    if (!a.technologies.length) e.technologies = 'Select at least one technology'
    if (!a.antennaType) e.antennaType = 'Select an antenna type'
  }
  if (step === 2 && tx) {
    if (!a.preCertifiedModule) e.preCertifiedModule = 'Select an answer'
    if (!a.antennaModified) e.antennaModified = 'Select an answer'
  }
  if (step === 3) {
    if (!a.hostCategory) e.hostCategory = 'Select a product category'
    if (!a.networkConnected) e.networkConnected = 'Select an answer'
    if (!a.powerSources.length) e.powerSources = 'Select at least one power source'
  }
  if (step === 4) {
    if (!a.preComplianceTested) e.preComplianceTested = 'Select an answer'
    if (!a.rfFirmware) e.rfFirmware = 'Select an answer'
  }
  return e
}

// ─── Risk engine ──────────────────────────────────────────────────────────────

export function assessRisks(a: DeviceAnswers): RiskFlag[] {
  const flags: RiskFlag[] = []
  const add = (f: RiskFlag) => flags.push(f)
  const tx = hasTransmitter(a)

  // ── Missing RF data ──────────────────────────────────────────────────────
  if (a.intentionalTransmit === 'not_sure') {
    add({ id: 'tx-unknown', category: 'Missing RF Data', severity: 'high',
      title: 'Transmitter status unknown',
      detail: 'It is not known whether the device intentionally transmits. This decides whether it is treated as an intentional radiator (Part 15 Subpart C, certification required) or an unintentional radiator (Subpart B), so it must be confirmed first.' })
  }
  if (a.intentionalTransmit === 'no' && (a.technologies.length > 0 || TRANSMITTING_TYPES.includes(a.deviceType))) {
    add({ id: 'tx-conflict', category: 'Missing RF Data', severity: 'high',
      title: 'Conflicting transmitter answers',
      detail: 'The device is described as not transmitting, but a wireless device type or wireless technology was selected. The radio configuration needs to be clarified before a test plan can be built.' })
  }
  if (tx && isBlankOrUnknown(a.maxTxPower)) {
    add({ id: 'power-missing', category: 'Missing RF Data', severity: 'medium',
      title: 'Maximum transmit power not provided',
      detail: 'Output power is needed to check the device against Part 15 power limits and to determine RF exposure (MPE/SAR) evaluation requirements.' })
  }
  if (tx && a.rfFirmware === 'not_sure') {
    add({ id: 'firmware-unknown', category: 'Missing RF Data', severity: 'low',
      title: 'Firmware control of RF unknown',
      detail: 'Confirm whether firmware sets frequency, power or channel behavior; this affects test modes and the software configuration documentation required.' })
  }

  // ── Non-certified module ─────────────────────────────────────────────────
  if (tx && a.preCertifiedModule === 'no') {
    add({ id: 'module-not-certified', category: 'Non-Certified Module', severity: 'high',
      title: 'No pre-certified RF module',
      detail: 'Without a certified module the complete radio must be certified as an intentional radiator under its own FCC ID, which means full RF testing and a larger documentation package.' })
  }
  if (tx && a.preCertifiedModule === 'unsure') {
    add({ id: 'module-unknown', category: 'Non-Certified Module', severity: 'medium',
      title: 'Module certification status unknown',
      detail: 'Find the module part number and look up its FCC ID. Whether a valid modular grant exists changes the certification path significantly.' })
  }
  if (tx && a.preCertifiedModule === 'yes' && isBlankOrUnknown(a.moduleManufacturer)) {
    add({ id: 'module-maker-missing', category: 'Non-Certified Module', severity: 'medium',
      title: 'Module manufacturer not identified',
      detail: 'The module grant (FCC ID) cannot be verified without the manufacturer and part number, so its conditions of use cannot be checked.' })
  }

  // ── Multiple radios ──────────────────────────────────────────────────────
  if (a.technologies.length >= 2) {
    const names = labelsOf(TECHNOLOGIES, a.technologies)
    add({ id: 'multi-radio', category: 'Multiple Radios', severity: a.technologies.length >= 3 ? 'high' : 'medium',
      title: `${a.technologies.length} radio technologies (${names})`,
      detail: 'Co-located transmitters may need simultaneous-transmission evaluation, combined RF exposure assessment and checks that each module grant permits co-location. This usually adds test time and cost.' })
  }

  // ── Unclear frequency band ───────────────────────────────────────────────
  if (tx) {
    if (isBlankOrUnknown(a.frequencyBand)) {
      add({ id: 'band-missing', category: 'Unclear Frequency Band', severity: 'high',
        title: 'Operating frequency band not provided',
        detail: 'The frequency band determines which FCC rule parts and limits apply. It is required before any test plan or quote can be prepared.' })
    } else if (!/\d/.test(a.frequencyBand)) {
      add({ id: 'band-vague', category: 'Unclear Frequency Band', severity: 'medium',
        title: 'Frequency band not stated numerically',
        detail: `"${a.frequencyBand.trim()}" does not give a frequency. State the band in MHz or GHz (for example 2400–2483.5 MHz).` })
    } else {
      for (const tech of a.technologies) {
        const p = BAND_PATTERNS[tech]
        if (p && !p.re.test(a.frequencyBand)) {
          add({ id: `band-mismatch-${tech}`, category: 'Unclear Frequency Band', severity: 'medium',
            title: `${labelOf(TECHNOLOGIES, tech)} selected but its band is not listed`,
            detail: `${labelOf(TECHNOLOGIES, tech)} normally operates at ${p.expected}, which does not appear in the band provided ("${a.frequencyBand.trim()}"). List every band the device uses.` })
        }
      }
    }
  }

  // ── Antenna modification ─────────────────────────────────────────────────
  if (a.antennaModified === 'yes') {
    add({ id: 'antenna-modified', category: 'Antenna Modification', severity: 'high',
      title: 'Module antenna has been modified',
      detail: 'Changing the antenna from what the module was certified with can invalidate the modular grant. It typically requires a permissive change by the module grantee or a new certification.' })
  }
  if (tx && a.antennaType === 'external') {
    add({ id: 'antenna-external', category: 'Antenna Modification', severity: 'medium',
      title: 'External antenna',
      detail: 'External antennas must use a unique coupling or be professionally installed (47 CFR 15.203), and their gain must not exceed what the grant was tested with.' })
  }

  // ── Testing readiness ────────────────────────────────────────────────────
  if (a.preComplianceTested === 'no') {
    add({ id: 'no-precompliance', category: 'Testing Readiness', severity: 'medium',
      title: 'No pre-compliance testing',
      detail: 'Without pre-scans, emissions problems are usually found during formal testing, which leads to redesign and repeat lab time.' })
  }
  const missingDocs = DOCUMENTATION.filter(d => !a.documentation.includes(d.value))
  if (missingDocs.length) {
    add({ id: 'docs-missing', category: 'Testing Readiness',
      severity: missingDocs.length === DOCUMENTATION.length ? 'medium' : 'low',
      title: `Missing documentation: ${missingDocs.map(d => d.label).join(', ')}`,
      detail: 'Schematics, a block diagram and an operational description are part of a standard certification filing and should be prepared before testing.' })
  }
  if (tx && a.rfFirmware === 'yes') {
    add({ id: 'firmware-rf', category: 'Testing Readiness', severity: 'low',
      title: 'Firmware controls RF behavior',
      detail: 'A test mode for continuous transmission on each channel will be needed, and the filing should describe how RF parameters are protected from user modification.' })
  }
  if (a.hostCategory === 'medical') {
    add({ id: 'medical', category: 'Testing Readiness', severity: 'medium',
      title: 'Medical device host',
      detail: 'Medical devices usually also need FDA-recognized EMC and wireless coexistence testing (e.g. IEC 60601-1-2) in addition to FCC requirements.' })
  }

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 }
  return flags.sort((x, y) => order[x.severity] - order[y.severity])
}

export function getReadiness(flags: RiskFlag[]): Readiness {
  if (flags.some(f => f.severity === 'high'))   return { level: 'High Risk',       badge: 'high' }
  if (flags.some(f => f.severity === 'medium')) return { level: 'Needs Attention', badge: 'moderate' }
  return                                               { level: 'Ready for Testing', badge: 'low' }
}

/** The likely certification route, based on the answers. */
export function getPathway(a: DeviceAnswers): string {
  if (!hasTransmitter(a)) {
    return 'Unintentional radiator (Part 15 Subpart B): emissions testing under Supplier\'s Declaration of Conformity (SDoC); no FCC ID required.'
  }
  if (a.intentionalTransmit === 'not_sure') {
    return 'Undetermined: confirm whether the device transmits before a certification path can be chosen.'
  }
  if (a.preCertifiedModule === 'yes' && a.antennaModified !== 'yes') {
    return 'Modular integration: use the existing module grant, verify its conditions are met (KDB 996369), and test the host for unintentional emissions.'
  }
  if (a.preCertifiedModule === 'yes' && a.antennaModified === 'yes') {
    return 'Modular integration at risk: the antenna change likely requires a permissive change or new certification.'
  }
  if (a.preCertifiedModule === 'unsure') {
    return 'Undetermined: verify the module\'s FCC ID. If certified, modular integration; if not, full intentional-radiator certification.'
  }
  return 'Full certification: the device needs its own FCC ID as an intentional radiator (Part 15 Subpart C), plus Subpart B emissions testing.'
}

/** Coerce untrusted input (e.g. a request body) into a well-formed DeviceAnswers object. */
export function normalizeDeviceAnswers(raw: unknown): DeviceAnswers {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const out = { ...EMPTY_ANSWERS } as Record<string, string | string[]>
  for (const [key, empty] of Object.entries(EMPTY_ANSWERS)) {
    const v = src[key]
    out[key] = Array.isArray(empty)
      ? (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
      : (typeof v === 'string' ? v.slice(0, 500) : '')
  }
  return out as unknown as DeviceAnswers
}

/** Device / RF section of a combined survey result (see /api/submit). */
export interface DeviceAssessment {
  readiness:          Readiness
  pathway:            string
  flags:              RiskFlag[]
  responses:          { module: string; question: string; answer: string }[]
  summary:            string
  missingInformation: string[]
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * The five RF risk areas from the pre-survey brief. Each is worth 8 points of
 * the 80-point framework: no flag = 8, worst flag medium/low = 4, high = 0.
 * ('Testing Readiness' flags are reported but not scored.)
 */
export const SCORED_RISK_AREAS: RiskCategory[] = [
  'Missing RF Data',
  'Non-Certified Module',
  'Multiple Radios',
  'Unclear Frequency Band',
  'Antenna Modification',
]

export const RISK_AREA_POINTS = 8

export function scoreRiskAreas(flags: RiskFlag[]) {
  return SCORED_RISK_AREAS.map(area => {
    const inArea = flags.filter(f => f.category === area)
    const worst: Severity | null =
      inArea.some(f => f.severity === 'high')   ? 'high'   :
      inArea.some(f => f.severity === 'medium') ? 'medium' :
      inArea.length                             ? 'low'    : null
    const points = worst === 'high' ? 0 : worst ? RISK_AREA_POINTS / 2 : RISK_AREA_POINTS
    const answer = worst ? `${worst[0].toUpperCase()}${worst.slice(1)} risk` : 'No risk found'
    return { question: `RF risk area: ${area}`, answer, points, maxPoints: RISK_AREA_POINTS }
  })
}
