from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import date, datetime


class DemandRequest(BaseModel):
    target_date: date
    capacity: int
    base_price: float
    is_holiday: bool = False

    context: Optional[Dict] = Field(default_factory=dict)    # weather, event, peak_hour, etc.


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
    explanation: List[str]


class HistoryLogResponse(PricingResponse):
    id: int
    timestamp: datetime
    base_price: float
    capacity: int
