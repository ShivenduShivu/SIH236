"""Explicit units in field names; no strings/booleans silently coerced to numbers."""
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, allow_inf_nan=False)


class Stage(StrictModel):
    name: str = Field(min_length=1, max_length=60)
    hours: float = Field(ge=0, le=8760)
    temperature_c: float | None = Field(default=None, ge=-40, le=60)
    rh_percent: float | None = Field(default=None, ge=0, le=100)


class Scenario(StrictModel):
    schema_version: Literal['1'] = '1'
    title: str = Field(default='My packaging plan', min_length=1, max_length=100)
    commodity: Literal['tomato', 'broccoli', 'peanuts', 'chips']
    format: Literal['bulk', 'retail']
    condition: Literal['whole', 'cut', 'dry']
    shipment_kg: float = Field(gt=0, le=1000000)
    pack_mass_kg: float | None = Field(default=None, gt=0, le=1000)
    area_m2: float | None = Field(default=None, gt=0, le=100)
    stages: list[Stage] = Field(min_length=1, max_length=8)
    priority: Literal['balanced', 'less_material', 'protection'] = 'balanced'
    maturity: Literal['unknown', 'mature_green', 'ripe'] = 'unknown'
    rough_handling: bool = False
    rq: float = Field(default=1, ge=0.5, le=2)
    target_o2_percent: float = Field(default=5, ge=3, le=10)
    target_co2_percent: float = Field(default=8, ge=5, le=10)
    allowable_moisture_gain_g: float | None = Field(default=None, gt=0, le=1000)
    oxygen_budget_ml: float | None = Field(default=None, gt=0, le=100000)
    initial_oxygen_ml: float | None = Field(default=None, ge=0, le=100000)
    budget_basis: Literal['unknown', 'illustrative', 'measured'] = 'unknown'

    @model_validator(mode='after')
    def consistent(self):
        if sum(s.hours for s in self.stages) <= 0:
            raise ValueError('Add at least one hour of preparation, travel or storage.')
        if self.pack_mass_kg is not None and self.pack_mass_kg > self.shipment_kg:
            raise ValueError('Mass per pack cannot exceed the total shipment mass.')
        dry = self.commodity in ('peanuts', 'chips')
        if dry != (self.condition == 'dry'):
            raise ValueError('Choose dry condition for snacks and whole/cut for fresh produce.')
        return self


class Source(StrictModel):
    id: str
    title: str
    url: str
    kind: str
    note: str
    accessed: str


class Respiration(StrictModel):
    temperature_c: float
    low: float = Field(gt=0)
    high: float = Field(gt=0)

    @model_validator(mode='after')
    def ordered(self):
        if self.low > self.high:
            raise ValueError('Respiration interval is reversed')
        return self


class Food(StrictModel):
    id: str
    name: str
    subtitle: str
    category: Literal['fresh', 'dry']
    default_format: Literal['bulk', 'retail']
    source_ids: list[str]
    respiration: list[Respiration]


class Measurement(StrictModel):
    property: Literal['OTR', 'WVTR']
    value: float = Field(ge=0)
    unit: str
    temperature_c: float
    rh_percent: float
    pressure_difference_atm: float | None
    thickness_um: float
    note: str


class Material(StrictModel):
    id: str
    name: str
    family: str
    modes: list[Literal['bulk', 'fresh', 'dry']]
    benefit: str
    tradeoff: str
    seal: str
    mechanical: str
    sustainability: str
    source_ids: list[str]
    measurements: list[Measurement]


class Catalog(StrictModel):
    version: str
    sources: list[Source]
    foods: list[Food]
    materials: list[Material]

    @model_validator(mode='after')
    def references_exist(self):
        ids = {s.id for s in self.sources}
        if len(ids) != len(self.sources):
            raise ValueError('Duplicate source IDs')
        for group in (self.foods, self.materials):
            if len({x.id for x in group}) != len(group):
                raise ValueError('Duplicate catalogue IDs')
            for item in group:
                if not set(item.source_ids) <= ids:
                    raise ValueError('Broken source reference')
        return self
