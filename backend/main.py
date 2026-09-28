import json
import mimetypes
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from pydantic import ValidationError

from .engine import CATALOG, CATALOG_HASH, ENGINE_VERSION, evaluate
from .examples import EXAMPLES
from .models import Scenario
from .reports import render_report

ROOT = Path(__file__).resolve().parents[1]
MAX_BODY = 64 * 1024
app = FastAPI(
    title="Packora",
    version=ENGINE_VERSION,
    docs_url=None,
    redoc_url=None,
    description="Local packaging decision support. No safety certification or shelf-life guarantee.",
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["127.0.0.1", "localhost", "testserver", "[::1]"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = (
        "no-store" if request.url.path.startswith("/api/") else "no-cache"
    )
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
    )
    return response


async def read_scenario(request: Request) -> Scenario:
    if request.headers.get("content-type", "").split(";")[0].strip().lower() != "application/json":
        raise HTTPException(415, "Send application/json.")
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > MAX_BODY:
            raise HTTPException(413, "Scenario exceeds the 64 KB limit.")
        chunks.append(chunk)
    try:
        payload = json.loads(b"".join(chunks))
    except (ValueError, UnicodeDecodeError, RecursionError):
        raise HTTPException(400, "The request is not valid JSON.")
    try:
        return Scenario.model_validate(payload)
    except ValidationError as ex:
        # Do not echo raw imported input (which can contain sensitive information).
        errors = [
            {
                "field": ".".join(str(p) for p in err["loc"]) or "scenario",
                "message": err["msg"],
            }
            for err in ex.errors()
        ]
        raise HTTPException(422, errors)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "engine_version": ENGINE_VERSION,
        "catalog_hash": CATALOG_HASH,
        "mode": "local",
        "ai_provider_required": False,
    }


@app.get("/api/catalog")
def catalog():
    return CATALOG.model_dump()


@app.get("/api/examples")
def examples():
    # Defaults are included so exported/imported scenarios have an explicit complete contract.
    return [
        {**x, "scenario": Scenario.model_validate(x["scenario"]).model_dump()} for x in EXAMPLES
    ]


@app.get("/api/schema")
def schema():
    return Scenario.model_json_schema()


@app.post("/api/evaluate")
async def evaluation(request: Request):
    scenario = await read_scenario(request)
    return evaluate(scenario)


@app.post("/api/report", response_class=HTMLResponse)
async def report(request: Request):
    scenario = await read_scenario(request)
    result = evaluate(scenario)
    expected = request.headers.get("x-packora-fingerprint")
    if expected and expected != result["fingerprint"]:
        raise HTTPException(
            409,
            "This saved snapshot uses different inputs or engine/data versions. Edit and recalculate before creating a current report. The original JSON export remains available.",
        )
    return HTMLResponse(render_report(result))


@app.get("/{path:path}", include_in_schema=False)
def frontend(path: str):
    if path == "api" or path.startswith("api/"):
        raise HTTPException(404, "Unknown API endpoint.")
    dist = ROOT / "frontend" / "dist"
    requested = (dist / path).resolve()
    if not requested.is_relative_to(dist.resolve()):
        raise HTTPException(404, "Not found.")
    if requested.is_file():
        mime = mimetypes.guess_type(str(requested))[0]
        if requested.suffix == ".js":
            mime = "text/javascript"
        return FileResponse(requested, media_type=mime)
    if "." in Path(path).name:
        raise HTTPException(404, "Asset not found.")
    if (dist / "index.html").exists():
        return FileResponse(dist / "index.html")
    return JSONResponse(
        {
            "message": "Packora API is running. Build the frontend or start its development server.",
            "schema": "/api/schema",
        }
    )
