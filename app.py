from typing import List
from fastapi import FastAPI, HTTPException, Depends
from datetime import datetime
import logging
import json
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from src.pipeline.predict_pipeline import predict_price, initialize_pipeline
from src.core.contracts import DemandRequest, PricingResponse, HistoryLogResponse
from src.core.database import get_db, engine, Base
from src.core.models import PricingLog

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Loading Prediction Pipeline into memory...")
    initialize_pipeline()
    yield
    logger.info("Shutting down API...")

app = FastAPI(title="PriceIQ - Demand-Based Pricing API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
@app.post("/api/v1/recommend-price", response_model=PricingResponse)
def recommend_price(payload: DemandRequest, db: Session = Depends(get_db)):
    MAX_DATE = datetime(2026, 10, 7).date()
    if payload.target_date > MAX_DATE:
        raise HTTPException(
            status_code=400, 
            detail=f"Forecast horizon exceeded. Maximum allowed date is {MAX_DATE}."
        )

    try:
        result = predict_price(
            input_date=payload.target_date,
            base_price=payload.base_price,
            capacity=payload.capacity,
            is_holiday_flag=payload.is_holiday,
            context=payload.context
        )

        log_entry = PricingLog(
            target_date=payload.target_date,
            base_price=payload.base_price,
            capacity=payload.capacity,
            context_data=json.dumps(payload.context) if payload.context else "{}",
            predicted_demand=result["predicted_demand"],
            occupancy_ratio=result["occupancy_ratio"],
            recommended_price=result["recommended_price"],
            confidence=result.get("confidence", "low"),
            explanation=json.dumps(result.get("explanation", []))
        )
        db.add(log_entry)
        db.commit()

        return PricingResponse(
            target_date=payload.target_date,
            predicted_demand=result["predicted_demand"],
            occupancy_ratio=result["occupancy_ratio"],
            recommended_price=result["recommended_price"],
            confidence=result.get("confidence", "low"),
            explanation=result.get("explanation", []),
        )
    except Exception as e:
        logger.error(f"Prediction Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during prediction.")

@app.get("/api/v1/history", response_model=List[HistoryLogResponse])
def get_history(db: Session = Depends(get_db)):
    logs = db.query(PricingLog).order_by(PricingLog.id.desc()).limit(100).all()
    return [
        {
            "id": log.id,
            "target_date": str(log.target_date),
            "base_price": log.base_price,
            "capacity": log.capacity,
            "predicted_demand": log.predicted_demand,
            "occupancy_ratio": log.occupancy_ratio,
            "recommended_price": log.recommended_price,
            "confidence": log.confidence,
            "explanation": json.loads(log.explanation) if log.explanation else [],
            "timestamp": str(log.timestamp)
        }
        for log in logs
    ]
