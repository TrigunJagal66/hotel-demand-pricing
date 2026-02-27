from src.forecasting.base import BaseForecaster
from src.core.contracts import DemandForecast


class HybridForecaster(BaseForecaster):

    def __init__(self, ml_model, prophet_model, w_ml=0.4, w_prophet=0.6):
        self.ml = ml_model
        self.prophet = prophet_model
        self.w_ml = w_ml
        self.w_prophet = w_prophet

    def predict(self, target_date, history, context):
        ml_pred = self.ml.predict(target_date, history, context)
        pr_pred = self.prophet.predict(target_date, history, context)

        mean = int(
            self.w_ml * ml_pred.mean +
            self.w_prophet * pr_pred.mean
        )

        return DemandForecast(
            mean=mean,
            lower=min(ml_pred.lower, pr_pred.lower),
            upper=max(ml_pred.upper, pr_pred.upper)
        )
