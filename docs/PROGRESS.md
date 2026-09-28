# Phase progress and evidence

## Current state
P0 pushed (`a985c4a`); P1 pushed (`1db7774`); P2 pushed (`ff648a8`); P3 pushed (`c2a1023`); P4 pushed (`c15a5c2`). P5 release verification complete; this record is included in the final phase commit. The local prototype is complete for user review. No food-packaging trials or deployment.

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

## P4 — integrated flows and launcher
- Added a Windows start/setup/build launcher, portable local run instructions and a narrowly verified background-process stop helper. Local URL: `http://127.0.0.1:8000`; never bound to a public interface.
- Integration review caught and fixed a stale what-if response that could otherwise return the user to results after editing, a meaningless transit action for a one-stage imported scenario, and a misleading missing-temperature message when pack geometry was actually absent.
- Added deeply nested JSON handling. The new test initially expected only HTTP 400; actual parsing legitimately produced a schema-level 422. The test now accepts either documented rejection path while disallowing an internal server error.
- Verification: backend **42 passed**; browser suite **29 passed, 1 intentionally skipped** across desktop and mobile. Cases cover all three flows, changed journey budgets, exhausted oxygen, manual unknowns, reviewed Hindi extraction, valid/invalid imports, deterministic JSON round trip, save/reload/delete, printable report, service failure/retry and stale-response protection.
- Successfully executed `scripts/start.ps1 -Build`; it built the app and detected the existing local service without starting a duplicate. Rendered report inspected in print media; downloaded files and screenshots retained only in ignored `tmp/`.
- Runtime note: test runner emits a dependency deprecation notice recommending httpx2. It does not affect the 42 passing API/engine tests; it is tracked for dependency maintenance rather than suppressed.

## P5 — release review and handoff
- Reformatted the Python/TypeScript/CSS source for maintainability, added checked formatter/linter configuration, and bundled third-party font/runtime-library notices. Fonts are served locally; unused font subsets were removed from the build.
- Accessibility checks found real low-contrast text on the original pale surfaces. Darkened labels/notes while retaining the design. Final Axe checks on workspace, orbit, planner and results passed on desktop and mobile with **no serious/critical findings** under the selected WCAG tags. Added arrow-key result tabs and retained keyboard/Escape/list alternatives.
- Hardened saved snapshots against malformed data, tested unavailable browser storage, explicit photo confirmation and no-speech fallback, and verified a 320 px reduced-motion viewport.
- Bumped the engine to **1.0.1** after the reviewed behavior fixes. Report export now rejects an old fingerprint rather than silently recomputing a saved snapshot under new versions.
- Final backend verification: **43 passed**; Ruff lint and format checks passed; `pip check` passed. The visible test-client deprecation notice remains documented.
- Full browser release suite: **42 passed, 2 intentionally skipped**. Skips are mobile duplicates of desktop keyboard-menu and additional 320 px/reduced-motion checks. A subsequent tightening of snapshot guards passed all **6 affected storage/persistence browser checks** on the final rebuilt app.
- Strict TypeScript check and production build passed. Final bundle approximately **295 KB JS / 93 KB gzip**, with locally served fonts. Frontend production dependency advisory audit: **no known vulnerabilities found** at the time checked. This does not claim a complete backend security audit.
- Windows start/build, existing-server detection and narrowly verified stop/restart helper exercised successfully. Health endpoint reports engine 1.0.1 at `http://127.0.0.1:8000`; background process remains local for review. Third-party notices return HTTP 200 from the built app.
- Latest desktop/mobile screenshots and print-report layout reviewed; artifacts remain ignored. Added architecture, exact limitations, reproducible verification commands and a four-minute demo guide. Technical PDF is still deferred and its brief preserved.
- Final repository review found a generated `.pnpm-store/` from an earlier sandboxed dependency command. Added both `.pnpm-store/` and `.pnpm/` to ignore/audit rules; no cache content was committed. Rechecked ignore behavior for credentials, dependencies, builds, screenshots and old design PDFs.
- The final phase commit includes this release record. Git history identifies its revision; remote alignment is verified after the push before handoff. No force push or deployment.
