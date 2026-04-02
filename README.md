# PriceIQ – Hotel Demand Dynamic Pricing

PriceIQ is an end-to-end Machine Learning and FastAPI-based dynamic pricing system. It uses a trained Random Forest Regressor to forecast daily hotel demand, and then pairs those predictions with capacity and demand elasticity logic to recommend optimal booking prices.

## Architecture Let
```text
Client (HTTP/cURL/Postman)
    │
    ▼
FastAPI (app.py)  ───────────────────────────────┐
    │                                            │ (Pydantic Validation)
    ▼                                            │
predict_pipeline.py  ─── loads daily_demand.csv  │
    │                    engineers lag features  │
    ▼                                            │
ML Model (demand_model.pkl) ─────────────────────┤
    │  (RandomForestRegressor)                   │
    ▼                                            │
Pricing Engine (occupancy_based_price)           │
    │  Surge / Discount logic                    │
    ▼                                            │
JSON Response ◄──────────────────────────────────┘
```

## Setup & Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the Model
You must train the model and generate the processed datasets before making predictions.
```bash
python src/models/train_model.py
```

### 3. Run the API Server
Start the FastAPI app locally on `http://127.0.0.1:8000`:
```bash
uvicorn app:app --reload
```

## API Usage Example

**Endpoint:** `POST /recommend-price`

```bash
curl -X POST "http://127.0.0.1:8000/recommend-price" \
     -H "Content-Type: application/json" \
     -d '{
           "entity_id": "hotel_nyc_01",
           "target_date": "2024-05-15",
           "capacity": 200,
           "base_price": 150.0
         }'
```

**Response:**
```json
{
  "entity_id": "hotel_nyc_01",
  "target_date": "2024-05-15",
  "predicted_demand": 185,
  "occupancy_ratio": 0.92,
  "recommended_price": 195.0,
  "confidence": "high",
  "explanation": [
    "Predicted demand: 185",
    "Available capacity: 200",
    "Demand exceeds capacity",
    "Surge pricing applied due to scarcity"
  ]
}
```

## Local Testing
To rapidly test the model without booting Uvicorn:
```bash
python src/models/predict.py
```
