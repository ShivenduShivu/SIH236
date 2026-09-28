# Honest scope and next steps

## Working local scope

- Four selectable foods: tomatoes, broccoli, roasted peanuts and potato chips. Three prepared scenarios exercise distinct flows.
- Bulk handling/ventilation; a whole-broccoli reference calculation at discrete 0/5/10/15/20 °C; dry-food constant-flux water/oxygen budgets.
- Seven material families, qualitative tradeoffs and a historical substrate example. No complete supplier package is qualified.
- Manual input, reviewed structured JSON, optional browser speech with limited English/Hindi phrase extraction, local photo-assisted human confirmation.
- Desktop/mobile UI, keyboard/list alternatives to the orbit menu, live scenario changes, sources, saved browser plans and JSON/HTML report export.

## Scientific limits

The fresh model holds respiration constant within each stage and uses an assumed respiratory quotient. It does not model gas dependence of respiration, dynamic headspace composition, nitrogen balance, package swelling, leaks, condensation, ethylene exposure, cultivar or microbial growth. Off-reference temperatures return missing data; there is no hidden Q10 interpolation. An acceptable-looking balance is not evidence of a safe modified atmosphere.

Dry-food calculations depend on user-supplied tolerances. Example tolerances are explicitly illustrative. Moisture content, oil content, pH and water activity are not measured or predicted; adding fields without a calibrated role would not improve the model. Real moisture uptake requires sorption and gradient behavior; oxidation depends on kinetics and process history. Film test conditions cannot be converted blindly to route conditions.

Journey duration starts at packing. The application does not erase earlier harvest/storage history. It does not predict remaining shelf life or quantify waste reduction. Temperature/RH/reference uncertainty and unknown supplier evidence are exposed, not transformed into statistically calibrated confidence bands.

Material ordering is ordinal and preference-based. It is not a numerical global optimum, a cheapest supplier quote, carbon footprint, or local recycling guarantee. Exact thickness/perforations/seal settings need a measured complete structure and supplier specifications.

## Product and operational limits

No active LLM or vision service is configured. The app is not a trained machine-learning product; its present intelligence is a knowledge-based screening engine. Browser speech availability and transcription quality depend on browser/permissions/network; typed entry always remains available. The interface is English with a Hindi speech/text-input option, not a fully translated Hindi UI.

Saved data is local to the current browser and origin. It does not sync between devices and can be removed by clearing site data. Keep JSON exports. The prepared server binds to loopback only. No deployment, production authentication, multi-user permissions, analytics, background processing, QR traceability, supplier purchasing or public-mobile hosting has been implemented.

## Next iteration, in dependency order

1. Have a food-packaging specialist review the rules, specimen requirements and rejection conditions. Expand source licensing/provenance review before commercial distribution.
2. Obtain real finished-pack supplier data at the relevant temperature, RH, pressure basis and geometry; include seal and mechanical tests. Add measured quotes and locally relevant recovery paths.
3. Implement quantitative candidate feasibility checks and tradeoff optimization only where those measurements support them; retain unsupported outcomes as unknown.
4. Run designed food-package experiments and independent comparisons. Use held-out products/batches/conditions to evaluate predictions without training/test leakage.
5. Add optional bounded language/vision extraction adapters and evaluate field-level error rates. Keep user confirmation and deterministic scientific checks.
6. Consider calibrated transient MAP or shelf-life models, then compare predictions against independent trials before exposing expiry-date claims.
7. After user approval, prepare a separate deployment/security/persistence phase and the detailed technical PDF using the now-existing software evidence plus clearly labelled remaining empirical gaps.
