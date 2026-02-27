from fastapi import FastAPI
from datetime import datetime

from src.pipeline.predict_pipeline import predict_price
from src.api.schemas import PriceRequest

app = FastAPI(title="Demand-Based Pricing API")

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Demand-based pricing API is running"
    }

@app.post("/recommend-price")
def recommend_price(payload: PriceRequest):
    pricing_config = {
        "low_threshold": 80,
        "high_threshold": 150
    }

    result = predict_price(
        input_date=payload.date,
        base_price=payload.base_price,
        capacity=payload.capacity,
    )

    # ADD capacity info to response (no pricing change yet)
    result["capacity"] = payload.capacity
    result["occupancy_ratio"] = round(
        result["predicted_demand"] / payload.capacity, 2
    )

    return result
