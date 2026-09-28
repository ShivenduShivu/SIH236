# Packora

A local-first food-packaging decision-support prototype for MoFPI problem statement **26236**. It combines a cited reference catalogue, transparent engineering calculations, and journey-aware constraints with an approachable web interface.

**Status:** local prototype implemented; no deployment performed. This is decision support, not a food-safety certificate, shelf-life guarantee, or supplier approval.

Start with [the project plan](docs/PROJECT_PLAN.md), [progress and evidence](docs/PROGRESS.md), and [scientific decisions](docs/DECISIONS.md).

## Run locally on Windows

On the current prepared workspace, double-click **start-local.cmd** or run it from the repository root. Open **http://127.0.0.1:8000**. Keep the terminal open; Ctrl+C stops a foreground server. A background review server can be stopped with **stop-local.cmd**, which verifies the recorded process belongs to this project before stopping it.

For first setup on a new checkout (Python 3.12+, Node 22.12+ or 24 LTS, pnpm 11.19.0):

```powershell
.\start-local.cmd -Setup
```

To rebuild after frontend edits: `start-local.cmd -Build`. Restart the server after backend edits. Use `-Port 8001` if another application owns port 8000. The launcher supports the bundled Codex runtime on this machine as a fallback when Python/Node/pnpm are not on PATH. No key or cloud service is required for the core app.

See [API and unit contracts](docs/API.md), [scientific model](docs/SCIENCE.md), and the phase evidence before interpreting a result. The technical PDF requested earlier remains deferred.

## Try the demo

Start with **Broccoli, kept cool**, review the inputs, and build the plan. Change transit temperature from 5 °C to 20 °C on the result page to see the gas-transfer requirement and checks change. The tomato flow covers bulk handling; the snack flow demonstrates moisture/oxygen budgets. Use [the four-minute demo guide](docs/DEMO.md) for a complete walkthrough.

The system currently covers four selectable foods and seven material families. It provides calculated requirements and candidate directions, not a certified supplier specification. Browser speech is optional; photo identification is manual. Read [the precise scope and limitations](docs/LIMITATIONS.md).

## Verify and develop

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m ruff check backend tests scripts/repo_audit.py
cd frontend
pnpm run format:check
pnpm run build
pnpm run test:e2e
```

Browser tests expect the built app running at port 8000 and use installed Edge by default. For another installed browser, set `PACKORA_BROWSER_CHANNEL=chrome`; for Playwright-managed Chromium, set `PACKORA_BROWSER_CHANNEL=chromium` and run `pnpm exec playwright install chromium` first. `PACKORA_TEST_URL` can select a different local port. Mobile checks emulate an iPhone-size viewport; they do not establish physical-device Safari compatibility.

For frontend iteration run `pnpm dev` inside `frontend` while the API is running. Vite proxies `/api` to port 8000. Rebuild to update the single-origin app served by FastAPI.

Further context: [architecture](docs/ARCHITECTURE.md), [verification](docs/VERIFICATION.md), [decision log](docs/DECISIONS.md), [sources](docs/SOURCES.md), and [deferred PDF brief](docs/DEFERRED_PDF_BRIEF.md). Dependency/font notices are included in `frontend/public/THIRD_PARTY_NOTICES.txt`. The Git repository excludes environments, dependencies, builds, credentials, generated design exports, logs and browser artifacts.
