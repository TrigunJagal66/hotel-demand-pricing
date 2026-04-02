import pandas as pd
import joblib
from datetime import datetime
from pathlib import Path

from src.pricing.pricing_engine import occupancy_based_price


def get_project_root():
    return Path(__file__).resolve().parent.parent.parent

def load_demand_data():
    """Load processed daily demand data."""
    data_path = get_project_root() / "data" / "processed" / "daily_demand.csv"
    df = pd.read_csv(data_path)
    df["arrival_date"] = pd.to_datetime(df["arrival_date"])
    return df


# -----------------------------
# Feature preparation
# -----------------------------
def prepare_features(df, target_date):
    """
    Create features for the given prediction date.
    """
    df = df.sort_values("arrival_date")

    
    if len(df) >= 14:
        last_row = df.iloc[-1]
        lag_1 = last_row["bookings"]
        lag_7 = df.iloc[-7]["bookings"]
        rolling_7 = df.tail(7)["bookings"].mean()
        rolling_14 = df.tail(14)["bookings"].mean()
    else:
        # Fallback if there isn't enough historical data
        last_row = df.iloc[-1] if len(df) > 0 else {"bookings": 0}
        lag_1 = last_row.get("bookings", 0)
        lag_7 = 0
        rolling_7 = df["bookings"].mean() if len(df) > 0 else 0
        rolling_14 = rolling_7

    features = {
        "day_of_week": target_date.weekday(),
        "is_weekend": int(target_date.weekday() >= 5),
        "month": target_date.month,
        "lag_1": lag_1,
        "lag_7": lag_7,
        "rolling_7": rolling_7,
        "rolling_14": rolling_14,
    }

    return pd.DataFrame([features])


# -----------------------------
# Demand prediction
# -----------------------------
def predict_demand(features):
    model_path = get_project_root() / "models_saved" / "demand_model.pkl"
    if not model_path.exists():
        # Create models_saved folder just in case
        model_path.parent.mkdir(parents=True, exist_ok=True)
        # Dummy prediction fallback to prevent crashing before model is trained
        return 100 

    model = joblib.load(model_path)
    predicted_demand = model.predict(features)[0]
    return max(0, int(predicted_demand))


# -----------------------------
# End-to-end pricing pipeline
# -----------------------------
def predict_price(input_date, base_price, capacity, context=None):
    """
    End-to-end prediction pipeline using occupancy-based pricing.
    """

    # Load data & prepare features
    try:
        df = load_demand_data()
    except FileNotFoundError:
        # Create empty DataFrame with required columns to prevent crashes
        df = pd.DataFrame(columns=["arrival_date", "bookings"])

    features = prepare_features(df, input_date)

    # Predict demand
    predicted_demand = predict_demand(features)

    # Pricing using occupancy logic (Step 7)
    price, occupancy_ratio, confidence, explanation = occupancy_based_price(
        predicted_demand=predicted_demand,
        base_price=base_price,
        capacity=capacity,
        context=context
    )

    return {
        "predicted_demand": predicted_demand,
        "recommended_price": price,
        "occupancy_ratio": occupancy_ratio,
        "confidence": confidence,
        "explanation": explanation,
    }
