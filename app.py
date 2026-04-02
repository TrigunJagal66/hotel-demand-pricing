from fastapi import FastAPI, HTTPException
from datetime import datetime
import traceback

from src.pipeline.predict_pipeline import predict_price
from src.core.contracts import DemandRequest, PricingResponse

app = FastAPI(title="PriceIQ - Demand-Based Pricing API")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Demand-based pricing API is running"
    }

@app.get("/")
def root():
    return health_check()

@app.post("/recommend-price", response_model=PricingResponse)
def recommend_price(payload: DemandRequest):
    # Enforce maximum forecast horizon (Dataset ends 2026-08-20)
    MAX_DATE = datetime(2026, 9, 20).date()
    if payload.target_date > MAX_DATE:
        raise HTTPException(
            status_code=400, 
            detail=f"Forecast horizon exceeded. Maximum allowed date is {MAX_DATE}."
        )

    try:
        # We use input payload to predict price
        result = predict_price(
            input_date=payload.target_date,
            base_price=payload.base_price,
            capacity=payload.capacity,
            context=payload.context
        )

        return PricingResponse(
            target_date=payload.target_date,
            predicted_demand=result["predicted_demand"],
            occupancy_ratio=result["occupancy_ratio"],
            recommended_price=result["recommended_price"],
            confidence=result.get("confidence", "low"),
            explanation=result.get("explanation", []),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

