"""Standalone, escaped HTML report; browser print can create a PDF on demand."""

from html import escape


def render_report(r):
    def e(value):
        return escape(str(value), quote=True)

    def items(values):
        return "<ul>" + "".join("<li>" + e(x) + "</li>" for x in values) + "</ul>"

    rows = "".join(
        f"<tr><td>{e(x['label'])}</td><td>{e(x['low'])} - {e(x['high'])} {e(x['unit'])}</td><td>{e(x['formula'])}<br>{e(x['basis'])}</td></tr>"
        for x in r["calculations"]
    )
    stages = "".join(
        f"<tr><td>{e(x['name'])}</td><td>{e(x['hours'])} h</td><td>{e(x['temperature_c']) if x['temperature_c'] is not None else 'Unknown'} °C</td><td>{e(x['rh_percent']) if x['rh_percent'] is not None else 'Unknown'} % RH</td></tr>"
        for x in r["stages"]
    )
    candidates = "".join(
        f"<h3>{e(m['name'])}</h3><p>{e(m['benefit'])} {e(m['tradeoff'])}</p><p>{e(m['specification'])}. {e(m['seal'])}. {e(m['mechanical'])}</p><p>{e(m['sustainability'])}</p>"
        for m in r["candidates"]
    )
    sources = "".join(
        f'<li><a href="{e(s["url"]) if s["url"].startswith("https://") else "#method"}">{e(s["title"])}</a> ({e(s["accessed"])}). {e(s["note"])}</li>'
        for s in r["sources"]
    )
    inputs = "".join(
        f"<tr><td>{e(k)}</td><td>{e(v) if v is not None else 'Unknown'}</td></tr>"
        for k, v in r["scenario"].items()
        if k != "stages"
    )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Packora - {e(r["scenario"]["title"])}</title><style>
body{{font:15px/1.6 system-ui,sans-serif;color:#233028;max-width:960px;margin:40px auto;padding:24px}}h1{{font:44px/1.1 Georgia,serif}}h2{{margin-top:36px}}small,.muted{{color:#596659}}table{{border-collapse:collapse;width:100%;font-size:13px}}td,th{{padding:10px;border-bottom:1px solid #d9ddd3;text-align:left;vertical-align:top}}a{{color:#335c38}}.notice{{padding:18px;background:#eef1e8;border-left:4px solid #567145}}h2,h3{{break-after:avoid}}tr,li{{break-inside:avoid}}@media print{{body{{margin:0;padding:0;font-size:11px}}h1{{font-size:30px}}a{{text-decoration:none}}table{{font-size:10px}}@page{{size:A4;margin:18mm}}}}
</style></head><body><small>PACKORA / PACKAGING DECISION SUPPORT</small><h1>{e(r["scenario"]["title"])}</h1><p class="notice"><strong>{e(r["status"].replace("_", " ").title())}</strong> · {e(r["journey_hours"])} hours from packing. No expiry date, food-safety certificate or validated supplier match is claimed.</p><h2>{e(r["title"])}</h2><p>{e(r["description"])}</p><h2>Journey</h2><table><tr><th>Stage</th><th>Duration</th><th>Temperature</th><th>Humidity</th></tr>{stages}</table><h2>Calculated requirements</h2><table><tr><th>Quantity</th><th>Result</th><th>Equation and scope</th></tr>{rows}</table><h2>Checks and next actions</h2>{items(x["text"] + " " + x["action"] for x in r["issues"])}<h2>Candidate structures</h2><p>{e(r["ranking_basis"])}</p>{candidates}<h2 id="method">Assumptions and limitations</h2>{items(r["assumptions"] + r["limits"])}<h2>Reproducible input</h2><table>{inputs}</table><h2>Sources</h2><ol>{sources}</ol><p class="muted">Engine {e(r["engine_version"])} · Catalogue {e(r["catalog_version"])} · Data hash {e(r["catalog_hash"])} · Scenario fingerprint {e(r["fingerprint"])}</p></body></html>"""
