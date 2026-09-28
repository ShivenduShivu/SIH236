import copy
import math

import pytest
from pydantic import ValidationError

from backend.engine import CATALOG, evaluate
from backend.examples import EXAMPLES
from backend.models import Scenario


def scenario(i=1, **changes):
    data = copy.deepcopy(EXAMPLES[i]["scenario"])
    data.update(changes)
    return Scenario.model_validate(data)


def values(result):
    return {v["key"]: v for v in result["calculations"]}


def test_broccoli_independent_numerical_oracle():
    r = evaluate(scenario())
    v = values(r)
    assert v["demand"]["low"] == 192
    assert v["demand"]["high"] == 216
    assert v["o2_permeance"]["low"] == 20000
    assert v["o2_permeance"]["high"] == 22500
    assert v["co2_permeance"]["low"] == pytest.approx(40201.005, abs=0.001)
    assert v["co2_permeance"]["high"] == pytest.approx(45226.1307, abs=0.001)
    assert r["status"] == "conditional"


def test_warm_stage_changes_demand_and_preferred_family():
    s = scenario()
    s.stages[1].temperature_c = 20
    r = evaluate(s)
    assert values(r)["demand"]["high"] == 1920
    assert values(r)["o2_permeance"]["high"] == 200000
    assert r["candidates"][0]["id"] == "vented-produce"
    assert any(x["code"] == "fresh_warm" for x in r["issues"])


def test_dry_budget_independent_oracle():
    r = evaluate(scenario(2))
    v = values(r)
    assert r["journey_hours"] == 720
    assert v["wvtr_max"]["high"] == pytest.approx(1.1111)
    assert v["oxygen_permeance_max"]["high"] == pytest.approx(23.8095)
    assert any(i["code"] == "budget_unvalidated" for i in r["issues"])


def test_longer_dry_duration_tightens_both_budgets():
    s = scenario(2)
    old = values(evaluate(s))
    for stage in s.stages:
        stage.hours *= 2
    new = values(evaluate(s))
    for key in old:
        assert new[key]["high"] == pytest.approx(old[key]["high"] / 2, abs=0.0001)


def test_bulk_does_not_use_total_mass_for_map():
    r = evaluate(scenario(0))
    assert r["journey_hours"] == 38
    assert set(values(r)) == {"journey"}
    assert r["candidates"][0]["id"] == "crate"


@pytest.mark.parametrize(
    "field,value",
    [
        ("area_m2", 0),
        ("pack_mass_kg", -1),
        ("shipment_kg", True),
        ("shipment_kg", "20"),
        ("area_m2", math.inf),
        ("rq", math.nan),
        ("commodity", "mango"),
        ("extra", 1),
    ],
)
def test_invalid_inputs_rejected(field, value):
    with pytest.raises(ValidationError):
        scenario(**{field: value})


def test_oversized_pack_rejected():
    with pytest.raises(ValidationError):
        scenario(pack_mass_kg=51)


def test_missing_geometry_returns_data_gap_not_number():
    r = evaluate(scenario(area_m2=None))
    assert r["status"] == "needs_data"
    assert not r["calculations"]
    assert not any(i["code"].startswith("temperature_reference_") for i in r["issues"])


def test_no_interpolation_or_extrapolation_without_evidence():
    s = scenario()
    for stage in s.stages:
        stage.temperature_c = 7.5
    r = evaluate(s)
    assert r["status"] == "needs_data"
    assert not r["calculations"]


def test_cut_product_does_not_reuse_whole_head_numbers():
    r = evaluate(scenario(condition="cut"))
    assert r["status"] == "needs_data"
    assert not r["calculations"]


def test_exhausted_oxygen_is_infeasible_not_negative():
    r = evaluate(scenario(2, initial_oxygen_ml=13))
    assert r["status"] == "infeasible_under_model"
    assert "oxygen_permeance_max" not in values(r)


def test_unknown_budgets_do_not_become_zero():
    r = evaluate(
        scenario(
            2,
            oxygen_budget_ml=None,
            allowable_moisture_gain_g=None,
            budget_basis="unknown",
        )
    )
    assert r["status"] == "needs_data"
    assert not r["calculations"]


def test_reproducible_and_sensitive_fingerprint():
    assert evaluate(scenario()) == evaluate(scenario())
    assert evaluate(scenario())["fingerprint"] != evaluate(scenario(rq=1.1))["fingerprint"]


def test_no_unqualified_supplier_match():
    for i in range(3):
        r = evaluate(scenario(i))
        assert all(m["status"] == "candidate_requires_validation" for m in r["candidates"])


def test_mass_scales_demand_and_area_scales_permeance():
    base = values(evaluate(scenario()))
    twice = values(evaluate(scenario(pack_mass_kg=1)))
    area = values(evaluate(scenario(area_m2=0.12)))
    assert twice["demand"]["high"] == 2 * base["demand"]["high"]
    assert area["o2_permeance"]["high"] == base["o2_permeance"]["high"] / 2


def test_zero_duration_stage_does_not_invent_temperature_gap():
    s = scenario()
    s.stages[0].hours = 0
    s.stages[0].temperature_c = None
    assert evaluate(s)["status"] == "conditional"


def test_zero_total_duration_is_invalid():
    with pytest.raises(ValidationError):
        scenario(stages=[{"name": "Nothing", "hours": 0}])


def test_catalog_pressure_basis_retained_as_unknown():
    material = next(m for m in CATALOG.materials if m.id == "metallized")
    assert material.measurements[0].pressure_difference_atm is None


def test_priority_is_design_preference_not_safety_score():
    r = evaluate(scenario(2, priority="less_material"))
    assert r["candidates"][0]["id"] == "mono-pe"
    assert "probability of safety" in r["ranking_basis"]
