# Phase progress and evidence

## Current state
P0 pushed (`a985c4a`); P1 pushed (`1db7774`); P2 pushed (`ff648a8`). P3 interface verified; P4 integration hardening next. No food-packaging trials or deployment.

## P0 — repository foundation
- Inspected workspace: only local `output/` and `tmp/` design artifacts; no existing Git repository or application to overwrite.
- GitHub `ls-remote` with network permission returned successfully with no refs: supplied repository is empty.
- Created persistent requirements, acceptance gates, deferred PDF brief, decision log and ignore policy.
- Verified ignore rules for local PDFs, scratch files, .env, node_modules and .venv. Staged audit: 10 files passed; staged diff reviewed.
- Windows sandbox and user have different ownership; use a command-local exact safe.directory entry and authorized Git writes. No global safety exception added.
- Baseline commit/push follows this record; remote commit identifiers are available in Git history.

## P1 — scientific engine
- Added a schema-validated catalogue (4 commodity entries, 7 material families, 7 linked sources) and strict scenario/unit contracts.
- Implemented bulk handling, discrete-temperature whole-broccoli gas-transfer calculations, journey integration, and dry-food water/oxygen budgets. Candidate ordering is explicitly a design preference, not price or safety optimization.
- Rechecked the UC Davis primary page: expanded broccoli reference points from 5/20 °C to 0/5/10/15/20 °C. Missing temperatures still return a data gap.
- Verification: `.venv/Scripts/python.exe -m pytest -q` → **26 passed**. Numerical oracles, temperature/geometry changes, cut-product mismatch, unknowns, exhausted oxygen, strict input types and fingerprints passed.
- Current backend dependency releases installed in the isolated ignored environment; direct requirements and exact transitive lock captured. No dependencies or research exports included in Git.
- Scientific scope/assumptions documented in `SCIENCE.md`. No film grade is falsely qualified and no shelf-life date is predicted.

## P2 — API and reports
- Added local typed input validation, health/catalogue/examples/schema endpoints, reproducible evaluation and escaped standalone HTML reports.
- Added bounded body reading, non-echoing validation errors, loopback host restrictions, security headers, unknown-route and static path checks.
- Verification: full engine/API suite **41 tests** (final command recorded with phase commit). Tests include streaming request limits, injection escaping, numerical output, export/re-evaluation identity and built-frontend serving using a temporary fixture. Actual production frontend integration is checked in P4.
- No external model or network is required to evaluate a scenario. Reports preserve source and assumption context; they do not claim lab validation.

## P3 — responsive interface
- Implemented the approved ivory/forest visual direction with original SVG produce artwork, locally bundled fonts, no fixed desktop sidebar, and a rotating orbit menu with list/keyboard/touch alternatives.
- Implemented food/journey/fine-tune steps, visible unknown values, readable result/technical/evidence views, material catalogue, saved browser plans, JSON import/export, and printable HTML download.
- Added live what-if controls. Browser verification confirmed the broccoli peak O2 target changes from 20,000–22,500 at 5 °C to 175,000–200,000 at a 20 °C transit stage, with the material direction and checks also changing.
- Optional browser speech and a narrow English/Hindi phrase parser require input review. Photo input remains local with explicit manual identification; it is not misrepresented as automatic vision or property measurement.
- TypeScript strict check and Vite production build passed. Frontend bundle: approximately 292 KB JS / 92 KB gzip on this build; fonts are local.
- Playwright against the actual FastAPI-served build: **5 passed, 1 intentionally skipped** (desktop keyboard-only test excluded on mobile). Desktop 1440 px and iPhone-size emulation: homepage, orbit, journey, result and calculations inspected; no horizontal overflow; no page exceptions in the workspace test.
- Screenshots are local in `tmp/screenshots/`, deliberately ignored. Visual review showed readable layouts on desktop and mobile. No generated images/build/dependency files are staged.
- Dependency setup initially required explicit approval of the esbuild install script and running the bundler outside Windows child-process sandbox restrictions. `pnpm-workspace.yaml` records only esbuild as allowed. No global sandbox or Git safety setting changed.
