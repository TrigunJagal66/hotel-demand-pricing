from abc import ABC, abstractmethod
from datetime import date
from typing import Dict
from src.core.contracts import DemandForecast


class BaseForecaster(ABC):

    @abstractmethod
    def predict(
        self,
        target_date: date,
        history,
        context: Dict
    ) -> DemandForecast:
        pass
