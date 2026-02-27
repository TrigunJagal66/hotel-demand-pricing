from prophet import Prophet
import pandas as pd
from src.forecasting.base import BaseForecaster
from src.core.contracts import DemandForecast


class ProphetForecaster(BaseForecaster):

    def __init__(self, model: Prophet):
        self.model = model

    def predict(self, target_date, history, context):
        future = pd.DataFrame({"ds": [target_date]})
        forecast = self.model.predict(future).iloc[0]

        return DemandForecast(
            mean=max(0, int(forecast["yhat"])),
            lower=max(0, int(forecast["yhat_lower"])),
            upper=max(0, int(forecast["yhat_upper"]))
        )
