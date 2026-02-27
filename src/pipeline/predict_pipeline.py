import pandas as pd
import joblib
from datetime import datetime

from src.pricing.pricing_engine import occupancy_based_price



def load_demand_data():
    """Load processed daily demand data."""
    df = pd.read_csv("data/processed/daily_demand.csv")
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

    last_row = df.iloc[-1]

    features = {
        "day_of_week": target_date.weekday(),
        "is_weekend": int(target_date.weekday() >= 5),
        "month": target_date.month,
        "lag_1": last_row["bookings"],
        "lag_7": df.iloc[-7]["bookings"],
        "rolling_7": df.tail(7)["bookings"].mean(),
        "rolling_14": df.tail(14)["bookings"].mean(),
    }

    return pd.DataFrame([features])


# -----------------------------
# Demand prediction
# -----------------------------
def predict_demand(features):
    model = joblib.load("models_saved/demand_model.pkl")
    predicted_demand = model.predict(features)[0]
    return max(0, int(predicted_demand))


# -----------------------------
# End-to-end pricing pipeline
# -----------------------------
def predict_price(input_date, base_price, capacity):
    """
    End-to-end prediction pipeline using occupancy-based pricing.
    """

    # Load data & prepare features
    df = load_demand_data()
    features = prepare_features(df, input_date)

    # Predict demand
    predicted_demand = predict_demand(features)

    # Pricing using occupancy logic (Step 7)
    price, occupancy_ratio, confidence, explanation = occupancy_based_price(
        predicted_demand=predicted_demand,
        base_price=base_price,
        capacity=capacity
    )

    return {
        "predicted_demand": predicted_demand,
        "recommended_price": price,
        "occupancy_ratio": occupancy_ratio,
        "reason": explanation,
    }
