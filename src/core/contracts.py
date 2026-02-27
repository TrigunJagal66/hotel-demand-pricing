from pydantic import BaseModel
from typing import Optional, Dict
from datetime import date


class DemandRequest(BaseModel):
    entity_id: str                  # e.g. "uber_blr_zone_12"
    target_date: date
    capacity: int
    base_price: float

    context: Optional[Dict] = {}    # weather, event, peak_hour, etc.


class DemandForecast(BaseModel):
    mean: float
    lower: float
    upper: float


class PricingResponse(BaseModel):
    entity_id: str
    target_date: date
    predicted_demand: int
    occupancy_ratio: float
    recommended_price: float
    confidence: str
    explanation: list[str]
