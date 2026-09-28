# Phase progress and evidence

## Current state
P0 pushed (`a985c4a`); P1 pushed (`1db7774`). P2 API complete; P3 interface next. No food-packaging trials or deployment.

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
