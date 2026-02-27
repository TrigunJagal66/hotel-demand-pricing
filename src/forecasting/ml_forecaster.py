import joblib
import pandas as pd
from src.forecasting.base import BaseForecaster
from src.core.contracts import DemandForecast


class MLForecaster(BaseForecaster):

    def __init__(self, model_path: str):
        self.model = joblib.load(model_path)

    def predict(self, target_date, history, context):
        history = history.sort_values("arrival_date")

        last_row = history.iloc[-1]

        features = {
            "day_of_week": target_date.weekday(),
            "is_weekend": int(target_date.weekday() >= 5),
            "month": target_date.month,
            "lag_1": last_row["bookings"],
            "lag_7": history.iloc[-7]["bookings"],
            "rolling_7": history.tail(7)["bookings"].mean(),
            "rolling_14": history.tail(14)["bookings"].mean()
        }

        X = pd.DataFrame([features])
        pred = self.model.predict(X)[0]

        return DemandForecast(
            mean=max(0, int(pred)),
            lower=max(0, int(pred * 0.9)),
            upper=max(0, int(pred * 1.1))
        )
