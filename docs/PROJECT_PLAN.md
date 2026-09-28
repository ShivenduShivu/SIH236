# Implementation plan and acceptance contract

## User authorization and boundaries

Build from scratch in this directory, push completed verified phases to `https://github.com/ShivenduShivu/SIH236.git` on `main`, and finish a usable local prototype within an approximately ten-hour working window. The user is working solo and may be asleep. Make reversible engineering decisions autonomously, record alternatives and limitations, and preserve working fallbacks. Do not deploy or buy services. The detailed technical PDF is deferred; retain its brief for later.

## Product outcome

A farmer or small producer can describe a shipment in everyday terms, confirm the commodity and handling conditions, account for preparation, transit and time after arrival, and inspect an explained packaging plan. An expert can inspect units, inputs, source links, equations, candidate exclusions, and uncertainty, then reproduce the result from exported JSON. A strong demo changes a real condition and visibly changes the calculated result. No chat response is passed off as a tested recommendation.

### Essential flows

1. **Bulk tomatoes:** whole produce, quantity, maturity/condition confirmation, ventilated crates, cushioning, stacking and journey conditions. Do not treat a 100 kg shipment as one sealed retail pack. Avoid unsupported gas recipes or exact shelf life.
2. **Broccoli retail pack:** mass per pack, area, temperatures, cited respiration interval and clearly identified RQ assumption. Compute required gas-transfer properties. Distinguish a teaching/verification fixture from any actual supplier grade.
3. **Dry-food budget:** entered or explicitly illustrative allowable moisture gain and oxygen budget, pack area and duration. Compute barrier requirement; require measured product tolerances for real specification. Do not equate moisture percentage with water activity.
4. **Missing or unsuitable conditions:** answer `needs_data`, `conditional`, or `infeasible_under_model` with concrete next actions, rather than always inventing a winning material.

## Architecture and feasibility

React + TypeScript + Vite frontend; Python FastAPI + Pydantic backend; versioned read-only JSON evidence and material catalogue. One origin in production-style local serving; Vite proxy during development. Deterministic engine is a pure module and is tested independently. Saved scenarios remain in this browser with explicit delete/export; no authentication or shared database in MVP. No Redis, vector database, trained-from-scratch predictor, or microservices.

Inputs use form controls first. Browser speech recognition can populate a reviewable transcript where supported; it cannot be a dependency for completing the flow. A structured JSON import is an expert convenience, not the farmer landing page. Image-based chemical measurement is out of scope; do not imply that a photo reveals pH, respiration or moisture. If camera input cannot provide reliable commodity identification without a provider, provide honest visual identification guidance and a commodity picker, rather than fake AI.

## P0 — persistent requirements and repository foundation

Deliver: this plan, progress log, deferred PDF brief, source register, decision log, ignore rules and an audit script. Initialize an empty remote safely; no force push. Gate: documentation matches user scope, remote verified empty, ignore checks pass for local exports, secrets/builds/dependencies excluded, staged diff inspected. Commit/push baseline.

## P1 — evidence catalogue and scientific engine

Deliver: schema-validated source, food and packaging entries; interval arithmetic and unit contracts; scenario normalization; mode routing; journey totals; transparent fresh-produce permeance calculations; dry-food budget equations; bulk mechanical/ventilation advice; explanations, constraints and data gaps. Use exact test conditions, no silent conversion of a resin name into a measured OTR. Keep illustrative fixtures clearly separate from sourced commercial specifications.

Gate: independent numerical tests verify broccoli 5 C demand (192–216 mL CO2/day for 0.5 kg), required O2 permeance (20,000–22,500 mL/m2/day/atm at a chosen 5% target, area 0.06 m2, RQ 1), dry WVTR allowance (1.111 g/m2/day for 2 g/30 days/0.06 m2), and oxygen allowance (23.81 mL/m2/day/atm for 9 mL ingress allowance and 0.21 atm gradient). Test missing data, nonpositive inputs, temperature outside reference range, cut-vs-whole, journey changes, clock definitions and reproducibility. Record the tests actually run. Commit/push.

## P2 — API and reproducible reports

Deliver: typed endpoints for health, reference catalogue, examples and scenario evaluation; schema errors with helpful messages; immutable scenario and engine/data versions; request limits; JSON export and printable report data; source provenance. Backend cannot require an LLM key or internet for evaluation. No supplier purchasing or external actions.

Gate: API tests cover valid and invalid requests, unknown commodity, malformed/oversized JSON, numerical payloads, stable output fingerprint, unsupported route handling and serving the built frontend. Tests must assert domain behavior, not only HTTP 200. Commit/push.

## P3 — distinctive, accessible web and mobile interface

Deliver: spacious ivory/forest/lime design, no permanent sidebar; visible edge Menu trigger opens an orbit navigator on desktop, with click/keyboard/list equivalents; mobile tap navigation. Clear entry choices, voice/manual/import paths; staged shipment questions; journey timeline; explained result, alternatives and source drawer; saved scenarios and JSON/report export. Simple words precede technical details. Sliders or controls must cause actual recalculation and never display canned scientific numbers as a live result.

Gate: frontend typecheck and build; inspect at desktop and 390 px mobile, avoid overflow and clipped actions; keyboard focus, Escape/dismiss behavior, reduced-motion and accessible labels. A complete manual user path works. If orbit behavior costs accessibility, simplify the animation while keeping the visual design. Commit/push.

## P4 — integrated demo, browser verification and local run workflow

Deliver: live frontend/backend integration, loading/error/empty states, explicit stale-result protection, editable example scenarios, source links, local saved history and portable exports. A single documented local start command or launcher should work. Add automated browser checks and actual screenshots kept outside Git.

Gate: complete all three example paths, edit transit duration and thermal conditions, observe changed calculations/gaps, import/export round trip, history deletion, offline-provider fallback and API failure display. Verify mobile/desktop and an actual print/report export. No invented success notifications. Commit/push.

## P5 — review, regression, documentation and handoff

Deliver: regression suite, known limitations, technical architecture/units/data contract, demonstration script, run instructions, final evidence log and consolidated decision changes. Remove dead controls and placeholders. Verify no credential/dependency/output files are tracked. Inspect final remote SHA and clean tracked working tree. Leave the local app running where possible, with exact restart instructions.

Gate: all required engine, API, build and browser checks pass against the final code; all unimplemented optional features are disclosed. Do not claim food/pack lab validation. Commit/push and report exact local URL and remaining constraints. Deployment awaits user review.

## Time allocation and fallback rules

Indicative sequence: P0 0.5 h; P1 2 h; P2 1 h; P3 3 h; P4 1.5 h; P5 1 h; 1 h contingency. Estimates are not fabricated elapsed-time records. Finish earlier if all gates pass; do not wait merely to fill ten hours.

- If a dependency fails, retry a bounded number of times and use a stable supported alternative. Record the reason and update subsequent contracts before relying on it.
- If GitHub becomes unavailable, retain clean local phase commits and retry after independent work; never force push or erase remote changes. Report unsent commits honestly.
- If speech is unavailable, retain transcript/picker/manual flow. Never block the core app on a provider.
- If a material lacks condition-matched transmission data, show the target requirement and the data request. Do not silently fill missing permeability or recommend a fabricated grade.
- If the fresh-produce model cannot support a requested storage condition, return a gap/conditional result; do not fake a shelf-life curve to satisfy the demo.
- Test failures are phase failures until corrected or the requirement is explicitly revised with rationale. Update `PROGRESS.md` and `DECISIONS.md` together for scope changes.

## Change-control record format

For each phase: scope delivered; files/behavior; commands/checks; actual results; unresolved issues; commit and push state. For each design change: trigger, evidence, chosen alternative, downstream effects, tests changed. Keep final document claims traceable to these records.
