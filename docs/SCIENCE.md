# Model contract, units and limits

This is a screening engine. It does not solve microbial growth, expiry dates, transient gas dynamics or supplier qualification. Results are `conditional`, `needs_data`, or `infeasible_under_model`; there is deliberately no overall `safe` status.

## Fresh whole broccoli

Let M be product mass in **one pack** (kg), A the effective film area (m²), r the cited CO2 production rate (mL/kg/hour), RQ the CO2/O2 respiratory quotient, and P the outside total pressure (assumed 1 atm). All gas volumes must use a consistent reference basis.

`q_CO2 = 24 M r` in mL/pack/day. `q_O2 = q_CO2 / RQ`.

At a chosen steady internal gas target, `K_O2 = q_O2 / [A P (0.21 - y_O2)]` and `K_CO2 = q_CO2 / [A P (y_CO2 - 0.0004)]`. K is **permeance** in mL/m²/day/atm. This is not an OTR reported without a pressure gradient, and not a polymer permeability coefficient. No universal thickness conversion or temperature correction is applied.

For 0.5 kg at 5 °C, 0.06 m², RQ 1 and target 5% O2 / 8% CO2, the literature respiration interval gives 192–216 mL CO2/day; O2 permeance 20,000–22,500; CO2 permeance approximately 40,201–45,226. These are calculated requirements, not measured film properties. Independent unit tests verify the arithmetic.

The curated source provides discrete temperatures 0, 5, 10, 15 and 20 °C. Other temperatures return missing reference data. No implicit interpolation/extrapolation or doubling for cut produce is used. The whole-product respiration rate measured under reference conditions may change in a modified atmosphere; the simple constant-rate balance is a screening approximation. Mixed-stage results show each stage separately. The highest demand is displayed for convenience, not used to assert that a single film meets all temperatures. Summed CO2 production is metabolic throughput, not accumulated trapped gas or a remaining-life indicator.

RQ 1 and gas targets are scenario assumptions. The application does not prescribe an active gas-flush recipe. Headspace volume, selectivity, nitrogen balance, time to equilibrium, temperature-dependent film behavior, leaks, cultivar and batch state remain unmodelled. A complete transient mass-balance model and experiments are required before treating the atmosphere as a prediction.

## Dry-food budget

For duration t in days and allowable water gain B_w in grams, `WVTR_max = B_w / (A t)` in g/m²/day. This assumes constant net flux at matching conditions; it is not a kinetic moisture-sorption model. Moisture content cannot be substituted for water activity or for a measured quality-loss threshold.

For a total oxygen allowance B_o and initial headspace/dissolved oxygen O_0 on the same mL reference basis, `K_O2,max = (B_o - O_0) / (A t × 0.21 atm)`. Taking negligible internal oxygen gives a conservative fixed-gradient ingress budget. No scavenger credit or seal-leak allowance is invented. If initial oxygen already consumes the allowance, return infeasible under this budget.

Example fixtures: 2 g allowance, 0.06 m² and 30 days gives 1.1111 g/m²/day; 12 mL total minus 3 mL initial oxygen gives 23.8095 mL/m²/day/atm. These are illustrative tolerances, not measured limits for all peanuts or chips. User-declared measured thresholds are still not independently certified by the software.

## Journey, selection and catalogue

The clock starts at packing. Preparation, travel and destination duration are summed once. Pre-pack harvest history and existing quality require separate assessment; no freshness reset is implied. Both organic and conventional produce can be perishable.

Bulk fresh produce receives handling/ventilation options; no respiration balance is applied to total shipment mass. Material families are filtered by mode and ordered by a transparent design preference. There is no fabricated cost optimization, calibrated safety score or Pareto frontier without measured objectives. The historical Jindal substrate sheet retains unknown pressure basis and test conditions; it does not qualify a finished pouch at different conditions. Film thickness remains a supplier-data request rather than an invented universal value.

See [source register](SOURCES.md) for research and licensing notes. Catalogue records are original compact annotations and selected numerical facts for this educational prototype, not copied articles/photos. Reassess permissions and commercial use before broader distribution.
