from pydantic import BaseModel
from typing import Optional, Dict
from datetime import date


class DemandRequest(BaseModel):
    target_date: date
    capacity: int
    base_price: float

    context: Optional[Dict] = {}    # weather, event, peak_hour, etc.


class DemandForecast(BaseModel):
    mean: float
    lower: float
    upper: float


class PricingResponse(BaseModel):
    target_date: date
    predicted_demand: int
    occupancy_ratio: float
    recommended_price: float
    confidence: str
    explanation: list[str]
