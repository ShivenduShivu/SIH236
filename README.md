# Packora

A local-first food-packaging decision-support prototype for MoFPI problem statement **26236**. It combines a cited reference catalogue, transparent engineering calculations, and journey-aware constraints with an approachable web interface.

**Status:** local prototype implemented; no deployment performed. This is decision support, not a food-safety certificate, shelf-life guarantee, or supplier approval.

Start with [the project plan](docs/PROJECT_PLAN.md), [progress and evidence](docs/PROGRESS.md), and [scientific decisions](docs/DECISIONS.md). Local run instructions will be added as the application becomes executable.

## Run locally on Windows

On the current prepared workspace, double-click **start-local.cmd** or run it from the repository root. Open **http://127.0.0.1:8000**. Keep the terminal open; Ctrl+C stops a foreground server. A background review server can be stopped with **stop-local.cmd**, which verifies the recorded process belongs to this project before stopping it.

For first setup on a new checkout (Python 3.12+, Node 22.12+ or 24 LTS, pnpm 11.19.0):

```powershell
.\start-local.cmd -Setup
```

To rebuild after frontend edits: `start-local.cmd -Build`. Restart the server after backend edits. Use `-Port 8001` if another application owns port 8000. The launcher supports the bundled Codex runtime on this machine as a fallback when Python/Node/pnpm are not on PATH. No key or cloud service is required for the core app.

See [API and unit contracts](docs/API.md), [scientific model](docs/SCIENCE.md), and the phase evidence before interpreting a result. The technical PDF requested earlier remains deferred.
