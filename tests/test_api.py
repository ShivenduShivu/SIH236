import copy

import pytest
from fastapi.testclient import TestClient

from backend.examples import EXAMPLES
from backend.main import app

client = TestClient(app)


def test_health_and_catalog():
    assert client.get("/api/health").json()["ai_provider_required"] is False
    d = client.get("/api/catalog").json()
    assert len(d["foods"]) == 4
    assert len(d["materials"]) == 7


def test_examples_are_full_reproducible_inputs():
    for ex in client.get("/api/examples").json():
        r = client.post("/api/evaluate", json=ex["scenario"])
        assert r.status_code == 200
        again = client.post("/api/evaluate", json=r.json()["scenario"])
        assert r.json() == again.json()


def test_numerical_response():
    r = client.post("/api/evaluate", json=EXAMPLES[1]["scenario"]).json()
    assert next(x for x in r["calculations"] if x["key"] == "o2_permeance")["high"] == 22500
    assert r["catalog_hash"]


@pytest.mark.parametrize(
    "payload",
    [
        {},
        [],
        {"commodity": "unknown"},
        {"commodity": "tomato", "secret": "should-not-be-echoed"},
    ],
)
def test_invalid_payloads_not_echoed(payload):
    r = client.post("/api/evaluate", json=payload)
    assert r.status_code == 422
    assert "should-not-be-echoed" not in r.text


def test_malformed_wrong_media_and_oversized():
    assert (
        client.post(
            "/api/evaluate", content="{", headers={"Content-Type": "application/json"}
        ).status_code
        == 400
    )
    assert client.post("/api/evaluate", content="hello").status_code == 415
    assert (
        client.post(
            "/api/evaluate",
            content=" " * 65537,
            headers={"Content-Type": "application/json"},
        ).status_code
        == 413
    )


def test_pathologically_nested_json_is_rejected():
    # Python runtimes differ in parser depth limits: reject either at parsing or schema validation.
    assert client.post(
        "/api/evaluate",
        content="[" * 2000 + "0" + "]" * 2000,
        headers={"Content-Type": "application/json"},
    ).status_code in (400, 422)


def test_chunked_limit():
    def chunks():
        for _ in range(10):
            yield b"x" * 10000

    assert (
        client.post(
            "/api/evaluate",
            content=chunks(),
            headers={"Content-Type": "application/json"},
        ).status_code
        == 413
    )


def test_report_escapes_user_input_and_contains_basis():
    s = copy.deepcopy(EXAMPLES[1]["scenario"])
    s["title"] = "<script>alert(1)</script>"
    r = client.post("/api/report", json=s)
    assert r.status_code == 200
    assert "<script>alert" not in r.text
    assert "&lt;script&gt;" in r.text
    assert "Scenario fingerprint" in r.text
    assert "No expiry date" in r.text
    assert "20" in r.text


def test_unknown_api_is_not_spa():
    assert client.get("/api/not-real").status_code == 404
    assert client.get("/missing.js").status_code == 404


def test_headers_and_host_restriction():
    r = client.get("/api/health")
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["cache-control"] == "no-store"
    assert client.get("/api/health", headers={"Host": "attacker.example"}).status_code == 400


def test_schema_available():
    assert "stages" in client.get("/api/schema").json()["required"]


def test_report_refuses_silent_recalculation_of_an_old_snapshot():
    r = client.post(
        "/api/report",
        json=EXAMPLES[1]["scenario"],
        headers={"X-Packora-Fingerprint": "old-snapshot"},
    )
    assert r.status_code == 409
    assert "recalculate" in r.json()["detail"]


def test_path_traversal_not_served():
    r = client.get("/%2e%2e/backend/data/catalog.json")
    assert r.status_code == 404


def test_static_frontend_and_spa_fallback(tmp_path, monkeypatch):
    from backend import main

    dist = tmp_path / "frontend" / "dist"
    dist.mkdir(parents=True)
    (dist / "index.html").write_text("<html>Local app</html>", encoding="utf-8")
    (dist / "main.js").write_text("console.log(1)", encoding="utf-8")
    monkeypatch.setattr(main, "ROOT", tmp_path)
    assert "Local app" in client.get("/journey").text
    assert client.get("/main.js").headers["content-type"].startswith("text/javascript")
    assert client.get("/api/not-real").status_code == 404
