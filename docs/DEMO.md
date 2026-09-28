# Demo and local review guide

## Start here

Open `http://127.0.0.1:8000`. If unavailable, double-click `start-local.cmd` in the prepared workspace. First setup on another machine uses `start-local.cmd -Setup`; see README prerequisites. The service is deliberately local. A phone on a different device will not connect through its own 127.0.0.1; use the browser's responsive device mode for this review. A real mobile-device/LAN or public deployment is a later explicit decision.

## A four-minute demonstration

1. **Set the problem (20 seconds).** "Packaging depends on the food and the journey. Packora makes the requirement and missing evidence inspectable." Show the spacious workspace and orbit/list menu briefly. Do not spend the whole demo on animation.
2. **Fresh-produce consequence (70 seconds).** Open *Broccoli, kept cool*. Review 0.5 kg per pack, 0.06 m², and all stages at 5 °C. Continue to the result. Show O2 permeance 20,000–22,500 mL/m²/day/atm. Click *Travel at 20 °C*. It becomes 175,000–200,000 at the warm transit stage, the candidate direction changes, and cooling checks appear. Explain that these are calculated targets from a reference range, not measured film behavior.
3. **The practical farmer path (45 seconds).** Return to workspace and open the microphone/text input. Type "100 kg tomatoes, 12 hours travel at 25 degrees" or the supported Hindi equivalent. Show the review step: maturity, preparation and destination conditions stay unknown. Alternatively use the complete *Tomatoes to the market* example to show the 38-hour route and ventilated-crate direction. Explain why a bulk shipment is not treated as one retail MAP pack.
4. **A different physical problem (45 seconds).** Open *A crisp, dry snack*. Show the 30-day fixture: WVTR limit about 1.1111 g/m²/day, O2 permeance limit about 23.8095 mL/m²/day/atm. Add twelve transit hours; both budgets tighten. Point out the visible label: the product tolerances are illustrative, not universal peanut limits.
5. **Prove inspectability (40 seconds).** Open Calculations and Evidence. Show a source link, the limitations, the version/hash, and the candidate tradeoff. Save a plan, export JSON, and download the printable report. State that supplier and product validation are the next stage, rather than claiming the prototype has certified a package.

## Deliberately show one hard failure

In the snack example's fine-tune step, change initial oxygen to 13 mL while the total allowance remains 12 mL. The app returns an infeasible budget instead of a negative permeability or a falsely confident material recommendation. This makes the distinction from a generic text answer concrete.

## Questions reviewers may ask

**Is this an AI wrapper?** No LLM is in the decision path. This build is a knowledge-based expert system plus physical screening calculations. Optional language/vision models can later reduce input effort, but measured properties and constraint logic remain explicit. Do not claim a trained predictive model that has not been implemented.

**Where is the dataset?** A small, curated, cited catalogue replaces an invented training set. It includes sparse commodity reference data and material-family annotations. The historical supplier substrate values retain their original conditions and unknown pressure basis; they do not qualify a finished pouch.

**Does it predict shelf life?** No. Journey duration is a requirement, and dry-food budgets use that requirement. Experimental thresholds, microbial criteria and independent product-package trials would be required for a validated expiry-date model.

**Why no exact thickness or cheapest rupee price?** Thickness depends on the grade/structure and conversion process; cost needs current comparable quotes. Without those, exact values would be invented. The app returns a converter brief and transparent family tradeoffs.

**Does the photo identify the food?** The current photo helper requires the user to confirm the commodity. It does not run a vision model, and it cannot infer moisture, pH or respiration from an image.

**How has it been verified?** Cite actual numerical/API/browser test evidence from `PROGRESS.md` and `VERIFICATION.md`. Distinguish software verification from laboratory or independent expert validation.

## Review checklist for the user

- Try the ordinary form without an example and see the unknown-data behavior.
- Change a journey stage and inspect the calculation, not only the headline.
- Try mobile emulation, keyboard navigation and orbit list mode.
- Import an exported scenario and verify its values.
- Review the narrow catalogue and limitations before deciding expansion priorities.
- Approve deployment separately only after this local review.
