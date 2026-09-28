import type { Saved } from './types'

export const STORE = 'packora.plans.v1'
type ObjectMap = Record<string, unknown>
const object = (v: unknown): v is ObjectMap =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string')
const number = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const fields = (v: unknown, keys: string[]) =>
  object(v) && keys.every((k) => typeof v[k] === 'string')
const range = (v: unknown) =>
  v === null || (object(v) && number(v.low) && number(v.high) && typeof v.unit === 'string')

// Storage is not trusted simply because it is on this device. Reject malformed snapshots before rendering.
function validSnapshot(value: unknown): value is Saved {
  if (
    !object(value) ||
    !fields(value, ['id', 'savedAt']) ||
    !Number.isFinite(Date.parse(value.savedAt as string))
  )
    return false
  const r = value.result
  if (
    !object(r) ||
    r.schema_version !== '1' ||
    !fields(r, [
      'title',
      'description',
      'fingerprint',
      'engine_version',
      'catalog_version',
      'catalog_hash',
      'ranking_basis',
      'mode',
    ]) ||
    !['conditional', 'needs_data', 'infeasible_under_model'].includes(String(r.status)) ||
    !number(r.journey_hours) ||
    !number(r.journey_days)
  )
    return false
  const s = r.scenario
  if (
    !object(s) ||
    s.schema_version !== '1' ||
    !fields(s, ['title', 'format', 'condition', 'priority', 'maturity', 'budget_basis']) ||
    !['tomato', 'broccoli', 'peanuts', 'chips'].includes(String(s.commodity)) ||
    !['bulk', 'retail'].includes(String(s.format)) ||
    !['whole', 'cut', 'dry'].includes(String(s.condition)) ||
    !['balanced', 'less_material', 'protection'].includes(String(s.priority)) ||
    typeof s.rough_handling !== 'boolean' ||
    !['rq', 'target_o2_percent', 'target_co2_percent'].every((k) => number(s[k])) ||
    ![
      'pack_mass_kg',
      'area_m2',
      'allowable_moisture_gain_g',
      'oxygen_budget_ml',
      'initial_oxygen_ml',
    ].every((k) => s[k] === null || number(s[k])) ||
    !number(s.shipment_kg) ||
    !Array.isArray(s.stages) ||
    !s.stages.length ||
    s.stages.length > 8
  )
    return false
  if (
    !s.stages.every(
      (st) =>
        object(st) &&
        typeof st.name === 'string' &&
        number(st.hours) &&
        (st.temperature_c === null || number(st.temperature_c)) &&
        (st.rh_percent === null || number(st.rh_percent)),
    )
  )
    return false
  if (!strings(r.assumptions) || !strings(r.limits)) return false
  if (
    !Array.isArray(r.calculations) ||
    !r.calculations.every(
      (c) => range(c) && c !== null && fields(c, ['key', 'label', 'formula', 'basis']),
    )
  )
    return false
  if (
    !Array.isArray(r.stages) ||
    !r.stages.every(
      (st) =>
        object(st) &&
        fields(st, ['name']) &&
        number(st.hours) &&
        (st.temperature_c === null || number(st.temperature_c)) &&
        (st.rh_percent === null || number(st.rh_percent)) &&
        range(st.demand) &&
        range(st.o2_permeance) &&
        range(st.co2_permeance),
    )
  )
    return false
  if (
    !Array.isArray(r.issues) ||
    !r.issues.every((i) => fields(i, ['code', 'level', 'text', 'action']))
  )
    return false
  if (
    !Array.isArray(r.sources) ||
    !r.sources.every((x) => fields(x, ['id', 'title', 'url', 'kind', 'note', 'accessed']))
  )
    return false
  if (
    !Array.isArray(r.candidates) ||
    !r.candidates.length ||
    !r.candidates.every(
      (m) =>
        fields(m, [
          'id',
          'name',
          'family',
          'benefit',
          'tradeoff',
          'seal',
          'mechanical',
          'sustainability',
        ]) &&
        object(m) &&
        (m.specification === undefined || typeof m.specification === 'string') &&
        strings(m.source_ids) &&
        Array.isArray(m.measurements) &&
        m.measurements.every(
          (x) =>
            object(x) &&
            fields(x, ['property', 'unit', 'note']) &&
            number(x.value) &&
            number(x.temperature_c) &&
            number(x.rh_percent) &&
            number(x.thickness_um),
        ),
    )
  )
    return false
  return true
}

export function readPlans(): { plans: Saved[]; notice: string } {
  try {
    const raw = localStorage.getItem(STORE)
    if (!raw) return { plans: [], notice: '' }
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data))
      return {
        plans: [],
        notice:
          'Saved history could not be read. The existing browser data has not been overwritten.',
      }
    const plans = data.filter(validSnapshot).slice(0, 20)
    return {
      plans,
      notice:
        plans.length !== data.length
          ? 'Some unsupported saved snapshots could not be opened. Existing browser data has not been overwritten.'
          : '',
    }
  } catch {
    return {
      plans: [],
      notice:
        'Browser history is unavailable or unreadable. You can still build a plan and export JSON.',
    }
  }
}
