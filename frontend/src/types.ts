export type Stage = { name: string; hours: number; temperature_c: number | null; rh_percent: number | null }
export type Scenario = {
  schema_version: '1'; title: string; commodity: 'tomato' | 'broccoli' | 'peanuts' | 'chips'; format: 'bulk' | 'retail'; condition: 'whole' | 'cut' | 'dry'; shipment_kg: number;
  pack_mass_kg: number | null; area_m2: number | null; stages: Stage[]; priority: 'balanced' | 'less_material' | 'protection'; maturity: 'unknown' | 'mature_green' | 'ripe'; rough_handling: boolean;
  rq: number; target_o2_percent: number; target_co2_percent: number; allowable_moisture_gain_g: number | null; oxygen_budget_ml: number | null; initial_oxygen_ml: number | null; budget_basis: 'unknown' | 'illustrative' | 'measured'
}
export type Source = { id: string; title: string; url: string; kind: string; note: string; accessed: string }
export type Material = {id: string; name: string; family: string; modes: string[]; benefit: string; tradeoff: string; seal: string; mechanical: string; sustainability: string; source_ids: string[]; specification?: string; measurements: { property: string; value: number; unit: string; temperature_c: number; rh_percent: number; thickness_um: number; note: string }[]}
export type Food = { id: Scenario['commodity']; name: string; subtitle: string; category: string; default_format: Scenario['format']; source_ids: string[] }
export type Catalog = {version: string; sources: Source[]; materials: Material[]; foods: Food[]}
export type Example = { id: string; label: string; tag: string; description: string; scenario: Scenario }
export type Range = {low: number; high: number; unit: string}
export type Calculation = Range & {key: string; label: string; formula: string; basis: string}
export type Result = {schema_version: string; engine_version: string; catalog_version: string; catalog_hash: string; fingerprint: string; scenario: Scenario; mode: string; status: 'conditional' | 'needs_data' | 'infeasible_under_model'; title: string; description: string; journey_hours: number; journey_days: number; calculations: Calculation[]; stages: (Stage & {demand: Range | null; o2_permeance: Range | null; co2_permeance: Range | null})[]; candidates: Material[]; issues: {code: string; level: string; text: string; action: string}[]; assumptions: string[]; sources: Source[]; ranking_basis: string; limits: string[]}
export type Saved = {id: string; savedAt: string; result: Result}
