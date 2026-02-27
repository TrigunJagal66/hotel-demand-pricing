from pydantic import BaseModel
from datetime import date

class PriceRequest(BaseModel):
    date: date
    base_price: float
    capacity: int
