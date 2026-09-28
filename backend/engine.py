"""Deterministic screening, not an expiry-date or safety prediction service."""
import hashlib
import json
from pathlib import Path
from .models import Catalog, Scenario

ENGINE_VERSION = '1.0.0'
CATALOG = Catalog.model_validate_json((Path(__file__).parent / 'data' / 'catalog.json').read_text(encoding='utf-8'))
CATALOG_HASH = hashlib.sha256(CATALOG.model_dump_json().encode()).hexdigest()[:16]


def range_value(low, high, unit):
    return {'low': round(low, 4), 'high': round(high, 4), 'unit': unit}


def evaluate(s: Scenario) -> dict:
    food = next(f for f in CATALOG.foods if f.id == s.commodity)
    mode = 'bulk' if s.format == 'bulk' and food.category == 'fresh' else ('fresh' if food.category == 'fresh' else 'dry')
    hours = sum(stage.hours for stage in s.stages)
    days = hours / 24
    active = [stage for stage in s.stages if stage.hours > 0]
    issues, assumptions, calculations, stage_results = [], [], [], []
    def issue(code, level, text, action):
        issues.append({'code': code, 'level': level, 'text': text, 'action': action})
    def calc(key, label, low, high, unit, formula, basis):
        calculations.append({'key': key, 'label': label, **range_value(low, high, unit), 'formula': formula, 'basis': basis})

    unknown_temp = [st.name for st in active if st.temperature_c is None]
    if unknown_temp:
        issue('temperature_missing', 'needs_data', 'Temperature is unknown for: ' + ', '.join(unknown_temp), 'Confirm the expected temperature, including unrefrigerated stops.')
    if any(st.rh_percent is None for st in active):
        issue('rh_missing', 'review', 'Humidity is not known for every stage.', 'Check humidity and condensation exposure before selecting the final structure.')
    if s.rough_handling:
        issue('handling', 'review', 'Rough transport increases compression and puncture exposure.', 'Use appropriate outer protection and test filled packs on the expected route.')
    if any(st.temperature_c is not None and st.temperature_c < 0 for st in active) and food.category == 'fresh':
        issue('frozen_out_of_scope', 'needs_data', 'This fresh-produce model does not cover frozen product.', 'Use a frozen-food assessment and confirm whether freezing injury is acceptable.')

    if mode == 'bulk':
        title, description = 'Let the produce breathe. Protect the load.', 'Start with a ventilated crate and a handling plan matched to this journey.'
        assumptions.append('Bulk crates are assessed for handling and ventilation. No sealed-film MAP calculation is applied to the total shipment.')
        if s.condition == 'cut':
            issue('cut_bulk', 'needs_data', 'Cut produce needs a separate hygiene and cold-chain assessment.', 'Confirm the product process and handling plan with a qualified food specialist.')
        if s.commodity == 'tomato' and s.maturity == 'unknown':
            issue('maturity_missing', 'needs_data', 'Tomato maturity is not confirmed.', 'Confirm mature-green or ripe before setting storage conditions.')
        if s.commodity == 'tomato' and any(st.temperature_c is not None and st.temperature_c < 10 for st in active):
            issue('tomato_cold_review', 'review', 'A stage is below 10 °C; tomato chilling sensitivity depends on maturity and exposure.', 'Check a commodity-specific storage reference before using this cold-chain setting.')
        if any(st.temperature_c is not None and st.temperature_c >= 25 for st in active):
            issue('warm_route', 'review', 'The journey includes a warm stage.', 'Reduce waiting in the sun; confirm appropriate cooling and shorten avoidable delays.')
        calc('journey', 'Total journey requirement', hours, hours, 'hours', 'Preparation + travel + time after arrival', 'Time from packing; not a shelf-life prediction.')
        issue('bulk_qualification', 'review', 'Crate strength and food-contact suitability are not verified for a supplier grade.', 'Obtain a suitable load/stack specification, cleaning procedure and food-contact evidence.')
    elif mode == 'fresh':
        title, description = 'Match gas exchange to the living product.', 'Calculate a transfer target first, then ask a converter for a verified breathable package.'
        assumptions += [f'RQ = {s.rq:g} (CO2 production / O2 consumption) is an explicit scenario assumption, not measured for this batch.', 'Outside atmosphere is taken as 21% O2 and 0.04% CO2 at 1 atm; gas-volume reference bases must match.', f'Target atmosphere {s.target_o2_percent:g}% O2 / {s.target_co2_percent:g}% CO2 is a design assumption, not a validated gas recipe.', 'Steady-state screening does not establish the time to equilibrium, microbial safety or shelf life. Headspace and transient validation remain necessary.']
        if s.condition != 'whole':
            issue('cut_reference_missing', 'needs_data', 'The catalogue respiration values apply to whole broccoli heads, not cut produce.', 'Obtain respiration and microbial criteria for the actual cut product.')
        if not food.respiration:
            issue('respiration_missing', 'needs_data', 'No quantitative respiration curve is curated for this commodity.', 'Use the bulk handling flow or add a reviewed, condition-specific respiration source.')
        if s.pack_mass_kg is None or s.area_m2 is None:
            issue('geometry_missing', 'needs_data', 'Mass per retail pack and exposed film area are needed.', 'Measure the mass in one pack and the effective gas-transfer film area.')
        for st in active:
            entry = {'name': st.name, 'hours': st.hours, 'temperature_c': st.temperature_c, 'rh_percent': st.rh_percent, 'demand': None, 'o2_permeance': None, 'co2_permeance': None}
            ref = next((r for r in food.respiration if r.temperature_c == st.temperature_c), None)
            if ref and s.condition == 'whole' and s.pack_mass_kg is not None and s.area_m2 is not None:
                lo, hi = 24 * s.pack_mass_kg * ref.low, 24 * s.pack_mass_kg * ref.high
                entry['demand'] = range_value(lo, hi, 'mL CO2/pack/day')
                o2den = s.area_m2 * (0.21 - s.target_o2_percent / 100)
                co2den = s.area_m2 * (s.target_co2_percent / 100 - 0.0004)
                entry['o2_permeance'] = range_value(lo / s.rq / o2den, hi / s.rq / o2den, 'mL/m²/day/atm')
                entry['co2_permeance'] = range_value(lo / co2den, hi / co2den, 'mL/m²/day/atm')
                entry['basis'] = 'UCD-BROCCOLI; reference interval at the stated temperature'
            elif ref is None and st.temperature_c is not None and food.respiration and s.condition == 'whole':
                issue('temperature_reference_' + st.name, 'needs_data', f'No curated respiration value at {st.temperature_c:g} °C for {st.name}.', 'The reference has values at 0, 5, 10, 15 and 20 °C. Obtain data at the actual temperature; do not change real conditions just to fit the model.')
            stage_results.append(entry)
        valid = [e for e in stage_results if e['demand']]
        if valid:
            peak = max(valid, key=lambda e: e['demand']['high'])
            for key, label in [('demand', 'Peak CO2 production'), ('o2_permeance', 'O2 permeance at peak stage'), ('co2_permeance', 'CO2 permeance at peak stage')]:
                value = peak[key]
                formula = '24 × pack mass × respiration rate' if key == 'demand' else ('CO2/day ÷ RQ ÷ area ÷ (0.21 − target O2) ÷ 1 atm' if key == 'o2_permeance' else 'CO2/day ÷ area ÷ (target CO2 − 0.0004) ÷ 1 atm')
                calc(key, label, value['low'], value['high'], value['unit'], formula, f"At {peak['temperature_c']:g} °C; inspect all stage targets separately. No film temperature correction assumed.")
        if valid and len(valid) == len(active):
            calc('co2_journey', 'CO2 produced over this journey', sum(e['demand']['low'] * e['hours'] / 24 for e in valid), sum(e['demand']['high'] * e['hours'] / 24 for e in valid), 'mL CO2/pack', 'Sum of each stage: daily CO2 production × hours ÷ 24', 'Constant reference respiration within each stage; not trapped headspace gas or a spoilage prediction.')
        if any(st.temperature_c is not None and st.temperature_c > 5 for st in active):
            issue('fresh_warm', 'review', 'A stage exceeds the cold scenario used for the broccoli example.', 'Review refrigeration first. A breathable film alone does not establish that this warm route is suitable.')
        issue('film_match_missing', 'review', 'No catalogue film has complete O2 and CO2 transfer data matched to this package and all stage conditions.', 'Send the calculated target ranges to a converter; validate the complete pack, perforations and cold chain.')
    else:
        title, description = 'Keep moisture and oxygen within a budget.', 'Turn a tested product tolerance into a measurable barrier requirement.'
        assumptions += ['This is a constant-flux budget screen. A measured product failure threshold and real pack testing are needed for shelf-life validation.', 'OTR, oxygen permeance and polymer permeability are different quantities. Test temperature, humidity, gradient and structure must be retained.', 'Oxygen ingress is screened at a 0.21 atm gradient with negligible internal oxygen; seals and leaks require separate allowance.']
        if s.format == 'bulk':
            issue('dry_bulk', 'needs_data', 'The dry-food budget flow describes a sealed retail pack.', 'Specify the actual bulk-container geometry and validate a separate container model.')
        if s.budget_basis != 'measured':
            issue('budget_unvalidated', 'needs_data' if s.budget_basis == 'unknown' else 'review', 'Product tolerance values are ' + ('illustrative examples, not measured thresholds.' if s.budget_basis == 'illustrative' else 'not supported by a declared measurement.'), 'Obtain acceptable moisture gain and oxygen exposure from product testing; keep example values labelled.')
        if s.area_m2 is None:
            issue('area_missing', 'needs_data', 'Exposed pack area is missing.', 'Measure the total effective barrier area in square metres.')
        if s.allowable_moisture_gain_g is None:
            issue('moisture_budget_missing', 'needs_data', 'Allowable moisture gain has not been supplied.', 'Determine the moisture gain at which texture or quality becomes unacceptable.')
        elif s.area_m2:
            v = s.allowable_moisture_gain_g / (s.area_m2 * days)
            calc('wvtr_max', 'Maximum WVTR budget', v, v, 'g/m²/day', 'Allowable moisture gain ÷ exposed area ÷ total days', 'At matching use/test conditions; constant net ingress, no seal allowance yet.')
        if s.oxygen_budget_ml is None or s.initial_oxygen_ml is None:
            issue('oxygen_budget_missing', 'needs_data', 'Total oxygen allowance or initial oxygen is missing.', 'Include residual headspace and dissolved oxygen on the same reference-volume basis.')
        elif s.initial_oxygen_ml >= s.oxygen_budget_ml:
            issue('oxygen_exhausted', 'infeasible', 'Initial oxygen already equals or exceeds the full exposure allowance.', 'Reduce initial oxygen through a validated process or revise the measured product specification. A film alone cannot undo initial exposure.')
        elif s.area_m2:
            v = (s.oxygen_budget_ml - s.initial_oxygen_ml) / (s.area_m2 * days * 0.21)
            calc('oxygen_permeance_max', 'Maximum O2 permeance budget', v, v, 'mL/m²/day/atm', '(Oxygen allowance − initial oxygen) ÷ area ÷ total days ÷ 0.21 atm', 'Conservative fixed-gradient screen; no leak or scavenger credit assumed.')
        issue('dry_match_missing', 'review', 'No complete pouch specification has matching condition and seal data in this catalogue.', 'Request finished-pack barrier, sealing, mechanical and food-contact evidence. Historical substrate data is not a qualified match.')

    for st in active if not stage_results else []:
        stage_results.append({'name': st.name, 'hours': st.hours, 'temperature_c': st.temperature_c, 'rh_percent': st.rh_percent, 'demand': None, 'o2_permeance': None, 'co2_permeance': None})
    candidates = [m.model_dump() for m in CATALOG.materials if mode in m.modes]
    # Ordinal design preference only: not a cost, safety or suitability score.
    preference = {'bulk': ['crate', 'corrugated'], 'fresh': ['breathable', 'vented-produce'], 'dry': ['metallized', 'mono-pe', 'foil']}[mode]
    if s.priority == 'less_material' and mode == 'dry':
        preference = ['mono-pe', 'metallized', 'foil']
    if mode == 'fresh' and any(st.temperature_c is None or st.temperature_c > 5 for st in active):
        preference = ['vented-produce', 'breathable']
    if s.priority == 'protection' and mode == 'dry':
        preference = ['foil', 'metallized', 'mono-pe']
    candidates.sort(key=lambda m: preference.index(m['id']))
    for m in candidates:
        m['status'] = 'candidate_requires_validation'
        m['specification'] = 'Geometry and grade require supplier confirmation' if mode == 'bulk' else 'Thickness and complete structure require converter data; no universal thickness is assigned'
    levels = {i['level'] for i in issues}
    status = 'infeasible_under_model' if 'infeasible' in levels else ('needs_data' if 'needs_data' in levels else 'conditional')
    normalized = s.model_dump()
    fingerprint = hashlib.sha256(json.dumps({'scenario': normalized, 'engine': ENGINE_VERSION, 'catalog': CATALOG_HASH}, sort_keys=True, separators=(',', ':')).encode()).hexdigest()[:16]
    ids = set(food.source_ids + ['MODEL', 'FSSAI'])
    for m in candidates:
        ids.update(m['source_ids'])
    return {'schema_version': '1', 'engine_version': ENGINE_VERSION, 'catalog_version': CATALOG.version, 'catalog_hash': CATALOG_HASH, 'fingerprint': fingerprint, 'scenario': normalized, 'mode': mode, 'status': status, 'title': title, 'description': description, 'journey_hours': round(hours, 4), 'journey_days': round(days, 4), 'calculations': calculations, 'stages': stage_results, 'candidates': candidates, 'issues': issues, 'assumptions': assumptions, 'sources': [x.model_dump() for x in CATALOG.sources if x.id in ids], 'ranking_basis': 'Ordinal design preferences after mode filtering; not measured price, an optimality proof or a probability of safety.', 'limits': ['No predicted expiry date or guarantee of safety.', 'No validated supplier match; catalogue families are options to investigate.', 'No measured cost, life-cycle footprint or local recycling availability.', 'Changing inputs changes a screening calculation, not the underlying empirical evidence.']}
