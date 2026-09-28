# Local API contract

Run with `python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000` from the repository root. Frontend instructions follow in the UI phase. Requests are loopback only; no deployment has been performed.

- `GET /api/health`: service and engine/data versions. Core evaluation has no AI provider dependency.
- `GET /api/catalog`: original compact source annotations, food records and material-family candidates with unknowns retained.
- `GET /api/examples`: three complete, editable scenarios. Dry-food tolerances are explicitly illustrative.
- `GET /api/schema`: JSON Schema for expert integration; numeric units are part of property names.
- `POST /api/evaluate`: a scenario object, `Content-Type: application/json`. Returns canonical inputs, deterministic fingerprint, versions, calculated intervals, stage results, candidate families, issues/actions, assumptions, source links and limits.
- `POST /api/report`: same input; returns a self-contained escaped HTML report, printable through a browser. This is an individual scenario report, not the deferred technical design PDF.
- `GET /openapi.json`: machine-readable endpoint discovery. No external-CDN Swagger page is required by this offline-capable core.

No request writes to disk or sends input to another service. Error codes: 400 invalid JSON, 413 over 64 KB (including streaming bodies), 415 wrong media type, 422 schema/semantic error, 404 unknown resource. Errors omit raw user input. Host validation, response MIME hardening, CSP and traversal checks protect the local serving path; this does not replace production authentication/rate limiting/security review.

For report exports, the browser supplies `X-Packora-Fingerprint`. A mismatch produces HTTP 409 and requires recalculation; an old saved result is never silently presented as a report from the new engine. JSON export remains an exact copy of the saved snapshot.

Status meanings: `needs_data` means a required input/reference is missing; `conditional` means a screening result exists but packaging qualification remains outstanding; `infeasible_under_model` means a supplied hard budget already fails. The fingerprint includes normalized inputs, engine version and catalogue content hash; it is an identity/reproducibility aid, not a cryptographic attestation or approval signature.
